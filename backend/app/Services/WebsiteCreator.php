<?php

namespace App\Services;

use App\Models\Page;
use App\Models\Theme;
use App\Models\User;
use App\Models\Website;
use Illuminate\Support\Str;

/**
 * Creates a tenant Website (and its homepage) from a User + chosen theme.
 *
 * Called from two places:
 *   - WebsiteController::store        (user pressed "Create website" manually)
 *   - OnboardingController::setCustomization (end of onboarding — autopilot)
 *
 * Idempotent: returns the existing website if the user already has one.
 */
class WebsiteCreator
{
    /**
     * @param  array<string,mixed>  $overrides  optional fields to override (theme_slug, subdomain, site_name…)
     */
    public function createForUser(User $user, array $overrides = []): Website
    {
        // ─── Idempotency ──────────────────────────────────
        if ($existing = $user->website()->first()) {
            return $existing;
        }

        // ─── Theme resolution ─────────────────────────────
        $themeSlug = $overrides['theme_slug']
            ?? $user->selected_theme_id
            ?? Theme::query()
                ->where('is_active', true)
                ->where('is_default', true)
                ->value('slug')
            ?? Theme::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->value('slug');

        if (! $themeSlug) {
            throw new \RuntimeException('No active themes available to create a website.');
        }

        $theme = Theme::where('slug', $themeSlug)->firstOrFail();

        // ─── Required scalars ─────────────────────────────
        $siteName = $overrides['site_name']
            ?? $user->site_name
            ?? $user->organization_name
            ?? trim("{$user->name}'s site");

        $subdomain = $overrides['subdomain']
            ?? $this->suggestSubdomain($siteName);

        $siteLanguages = $overrides['site_languages']
            ?? $user->site_languages
            ?? ['en'];

        $defaultLocale = $overrides['default_locale']
            ?? ($siteLanguages[0] ?? 'en');

        $tokens = $overrides['tokens']
            ?? $this->buildTokensFromUser($user);

        // ─── Persist website ──────────────────────────────
        $website = Website::create([
            'user_id' => $user->id,
            'theme_id' => $theme->id,
            'subdomain' => $subdomain,
            'site_name' => $siteName,
            'tagline' => $overrides['tagline'] ?? $user->tagline,
            'logo_path' => $overrides['logo_path'] ?? $user->logo_path,
            'favicon_path' => $overrides['favicon_path'] ?? $user->favicon_path,
            'tokens_json' => $tokens ?: null,
            'header_json' => $this->materialiseAreaInstance($theme->default_header_json, 'header'),
            'footer_json' => $this->materialiseAreaInstance($theme->default_footer_json, 'footer'),
            'site_languages' => $siteLanguages,
            'default_locale' => $defaultLocale,
            'status' => 'draft',
        ]);

        // ─── Bootstrap pages ──────────────────────────────
        // If the theme ships multi-page defaults, seed every entry.
        // Otherwise fall back to a single homepage built from the theme's
        // section pivot — the original behaviour for the Starter theme.
        $defaultPages = $theme->default_pages_json;
        if (is_array($defaultPages) && count($defaultPages) > 0) {
            $this->createPagesFromTheme($website, $defaultPages);
        } else {
            $this->createHomepage($website, $theme);
        }

        return $website;
    }

    /**
     * Materialise a theme's default header/footer template into a real
     * SectionInstance with a fresh uuid — keeps element-style overrides
     * keyed by id from one tenant colliding with another.
     */
    private function materialiseAreaInstance(?array $template, string $kind): ?array
    {
        if (! is_array($template)) {
            return null;
        }
        $type = $template['type'] ?? "site-{$kind}";
        return [
            'id' => "{$kind}-".Str::lower(Str::random(8)),
            'type' => $type,
            'settings' => $template['settings'] ?? [],
            'style' => $template['style'] ?? null,
            'elements' => $template['elements'] ?? null,
        ];
    }

    /**
     * Seed every page in the theme's default_pages_json. Each entry shape:
     *   slug => [
     *     'title'       => 'Page title',
     *     'is_homepage' => bool,
     *     'sort_order'  => int,
     *     'sections'    => [ ['type' => slug, 'settings' => [...]], ... ],
     *     'seo'         => ['title' => ..., 'description' => ...] (optional)
     *   ]
     *
     * Section ids are freshly generated so two tenants on the same theme
     * never share a section id (element-style overrides key on it).
     */
    private function createPagesFromTheme(Website $website, array $pages): void
    {
        foreach ($pages as $slug => $payload) {
            $sections = array_map(
                fn (array $s) => [
                    'id' => (string) Str::uuid(),
                    'type' => $s['type'],
                    'settings' => $s['settings'] ?? [],
                ],
                $payload['sections'] ?? []
            );

            Page::create([
                'website_id' => $website->id,
                'slug' => is_string($slug) ? $slug : ($payload['slug'] ?? 'untitled'),
                'title' => $payload['title'] ?? 'Untitled',
                'content_json' => ['sections' => $sections],
                'seo_json' => $payload['seo'] ?? [
                    'title' => $payload['title'] ?? $website->site_name,
                    'description' => $website->tagline,
                ],
                'is_homepage' => (bool) ($payload['is_homepage'] ?? false),
                'sort_order' => (int) ($payload['sort_order'] ?? 0),
                'status' => 'draft',
            ]);
        }
    }

    /**
     * Map the user's onboarding choices to engine tokens.
     * Anything the user didn't set is left out, so the theme's defaults win.
     */
    private function buildTokensFromUser(User $user): array
    {
        $tokens = [];

        if ($user->brand_color) {
            $tokens['color.primary'] = $user->brand_color;
        }
        if ($user->accent_color) {
            $tokens['color.accent'] = $user->accent_color;
        }
        if ($user->background_tone) {
            $tokens['color.background'] = $user->background_tone;
        }

        // Typography style → heading + body font tokens
        if ($user->typography_style) {
            $font = match ($user->typography_style) {
                'modern' => 'geist',
                'classical' => 'playfair-display',
                'minimal' => 'space-grotesk',
                'editorial' => 'crimson-pro',
                'display' => 'fraunces',
                default => null,
            };
            if ($font) {
                $tokens['font.heading'] = $font;
                $tokens['font.body'] = $font;
            }
        }

        return $tokens;
    }

    private function createHomepage(Website $website, Theme $theme): Page
    {
        $sections = $theme->sections()->get()->map(fn ($s) => [
            'id' => (string) Str::uuid(),
            'type' => $s->slug,
            'settings' => $s->default_settings_json,
        ])->all();

        return Page::create([
            'website_id' => $website->id,
            'slug' => 'home',
            'title' => 'Home',
            'content_json' => ['sections' => $sections],
            'seo_json' => [
                'title' => $website->site_name,
                'description' => $website->tagline,
            ],
            'is_homepage' => true,
            'sort_order' => 0,
            'status' => 'draft',
        ]);
    }

    /**
     * Slugify a site name and append `-2`, `-3`… on collision.
     * Falls back to a random slug when the name has no usable letters.
     */
    public function suggestSubdomain(string $siteName): string
    {
        $base = Str::slug($siteName);
        if ($base === '' || strlen($base) < 2) {
            $base = 'site-'.Str::lower(Str::random(6));
        }

        $candidate = $base;
        $i = 2;
        while (Website::where('subdomain', $candidate)->exists()) {
            $candidate = $base.'-'.$i;
            $i++;
        }

        return $candidate;
    }
}
