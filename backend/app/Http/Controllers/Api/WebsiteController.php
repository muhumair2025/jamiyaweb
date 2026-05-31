<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Website;
use App\Services\WebsiteCreator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class WebsiteController extends Controller
{
    public function __construct(private WebsiteCreator $creator)
    {
    }

    /**
     * GET /api/websites/me
     * Returns the authenticated user's website (data: null if none yet).
     */
    public function me(Request $request): JsonResponse
    {
        $website = $request->user()
            ->website()
            ->with('theme', 'homepage')
            ->first();

        if (! $website) {
            return response()->json(['data' => null]);
        }

        return response()->json(['data' => $this->present($website)]);
    }

    /**
     * POST /api/websites
     * Creates the user's website. In MVP each user gets exactly one.
     */
    /**
     * POST /api/websites/{website}/publish
     * Owner-only. Flips status to published and stamps published_at.
     * Also publishes the homepage so the public route returns content.
     */
    public function publish(Request $request, Website $website): JsonResponse
    {
        $this->authorizeOwnership($request, $website);

        $website->status = 'published';
        $website->published_at ??= now();
        $website->save();

        // Publish the homepage too (other pages stay as-is)
        $website->pages()->where('is_homepage', true)->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        return response()->json([
            'data' => $this->present($website->fresh()->load('theme', 'homepage')),
        ]);
    }

    /**
     * POST /api/websites/{website}/unpublish
     * Owner-only. Reverts to draft.
     */
    public function unpublish(Request $request, Website $website): JsonResponse
    {
        $this->authorizeOwnership($request, $website);

        $website->status = 'draft';
        $website->save();

        $website->pages()->update(['status' => 'draft']);

        return response()->json([
            'data' => $this->present($website->fresh()->load('theme', 'homepage')),
        ]);
    }

    private function authorizeOwnership(Request $request, Website $website): void
    {
        if ($website->user_id !== $request->user()->id) {
            throw ValidationException::withMessages([
                'website' => 'Forbidden.',
            ])->status(403);
        }
    }

    /**
     * PATCH /api/websites/{website}
     * Owner-only. Lets the dashboard update theme + identity + tokens
     * without going through the onboarding flow.
     *
     * All fields are optional and partial — only the keys actually present
     * in the request get touched.
     */
    public function update(Request $request, Website $website): JsonResponse
    {
        $this->authorizeOwnership($request, $website);

        $validated = $request->validate([
            'site_name' => ['sometimes', 'string', 'max:255'],
            'tagline' => ['sometimes', 'nullable', 'string', 'max:255'],
            'theme_id' => ['sometimes', 'nullable', 'integer', 'exists:themes,id'],
            // Tokens — flat key→value map (e.g. `color.primary` → `#20665c`).
            // Trusted as array; client-side TS enforces shape.
            'tokens' => ['sometimes', 'nullable', 'array', 'max:100'],
            'tokens.*' => ['sometimes', 'nullable', 'string', 'max:256'],
            // Identity assets — store the public URL or storage path coming
            // from the media library.
            'logo_path' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'favicon_path' => ['sometimes', 'nullable', 'string', 'max:2048'],
            // Global header/footer — single SectionInstance JSON each.
            // Shape validated client-side; we only check it's an array.
            'header' => ['sometimes', 'nullable', 'array'],
            'header.id' => ['sometimes', 'string', 'max:64'],
            'header.type' => ['sometimes', 'string', 'max:64'],
            'header.settings' => ['sometimes', 'array'],
            'header.style' => ['sometimes', 'nullable', 'array'],
            'header.elements' => ['sometimes', 'nullable', 'array'],
            'footer' => ['sometimes', 'nullable', 'array'],
            'footer.id' => ['sometimes', 'string', 'max:64'],
            'footer.type' => ['sometimes', 'string', 'max:64'],
            'footer.settings' => ['sometimes', 'array'],
            'footer.style' => ['sometimes', 'nullable', 'array'],
            'footer.elements' => ['sometimes', 'nullable', 'array'],
        ]);

        foreach ($validated as $key => $value) {
            // `tokens` maps to the `tokens_json` cast column.
            if ($key === 'tokens') {
                $website->tokens_json = $value;
                continue;
            }
            if ($key === 'header') {
                $website->header_json = $value;
                continue;
            }
            if ($key === 'footer') {
                $website->footer_json = $value;
                continue;
            }
            $website->{$key} = $value;
        }

        $website->save();

        return response()->json([
            'data' => $this->present($website->fresh()->load('theme', 'homepage')),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->user()->website()->exists()) {
            throw ValidationException::withMessages([
                'website' => 'You already have a website.',
            ]);
        }

        $validated = $request->validate([
            'theme_slug' => ['nullable', 'string', 'exists:themes,slug'],
            'subdomain' => ['nullable', 'string', 'min:2', 'max:64', 'regex:/^[a-z0-9-]+$/', 'unique:websites,subdomain'],
            'site_name' => ['nullable', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'tokens' => ['nullable', 'array'],
            'site_languages' => ['nullable', 'array', 'min:1'],
            'site_languages.*' => ['string', 'in:en,ar'],
            'default_locale' => ['nullable', 'string', 'in:en,ar'],
        ]);

        $website = $this->creator->createForUser($request->user(), $validated);

        return response()->json([
            'data' => $this->present($website->load('theme', 'homepage')),
        ], 201);
    }

    private function present(Website $w): array
    {
        return [
            'id' => $w->id,
            'subdomain' => $w->subdomain,
            'custom_domain' => $w->custom_domain,
            'site_name' => $w->site_name,
            'tagline' => $w->tagline,
            'logo_path' => $w->logo_path,
            'favicon_path' => $w->favicon_path,
            'tokens' => $w->tokens_json,
            'header' => $w->header_json,
            'footer' => $w->footer_json,
            'site_languages' => $w->site_languages,
            'default_locale' => $w->default_locale,
            'status' => $w->status,
            'published_at' => $w->published_at,
            'theme' => $w->relationLoaded('theme') && $w->theme ? [
                'slug' => $w->theme->slug,
                'name' => $w->theme->name,
            ] : null,
            'homepage' => $w->relationLoaded('homepage') && $w->homepage ? [
                'slug' => $w->homepage->slug,
                'title' => $w->homepage->title,
            ] : null,
        ];
    }
}
