<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\Website;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Public tenant rendering endpoints.
 *
 * Used by the Next.js subdomain rewrite to look up a tenant's site by its
 * subdomain (no auth required). Draft sites/pages are only returned when
 * the request is authenticated as the site's owner — that way owners can
 * preview their draft, but the public sees a 404 until they publish.
 */
class PublicSiteController extends Controller
{
    /**
     * GET /api/public/sites/by-subdomain/{subdomain}
     * Returns the site + theme + pages summary needed to bootstrap rendering.
     */
    public function show(Request $request, string $subdomain): JsonResponse
    {
        $website = Website::query()
            ->with('theme')
            ->where('subdomain', $subdomain)
            ->first();

        if (! $website) {
            throw new NotFoundHttpException('Site not found.');
        }

        $isOwner = $this->isOwner($request, $website);
        $isPublished = $website->status === 'published';

        // Draft + not owner → friendly "coming soon" payload (instead of 404).
        // The frontend renders a tasteful placeholder page using site_name + tagline.
        if (! $isPublished && ! $isOwner) {
            return response()->json([
                'data' => [
                    'website' => [
                        'site_name' => $website->site_name,
                        'tagline' => $website->tagline,
                        'subdomain' => $website->subdomain,
                        'logo_path' => $website->logo_path,
                        'favicon_path' => $website->favicon_path,
                        'status' => 'draft',
                    ],
                    'theme' => null,
                    'pages' => [],
                    'is_preview' => false,
                    'is_coming_soon' => true,
                ],
            ]);
        }

        $theme = $website->theme;

        // Theme's section list for the renderer (must mirror /api/themes shape)
        $themeSections = $theme
            ? $theme->sections()
                ->where('sections.is_active', true)
                ->get(['sections.slug', 'sections.name', 'sections.version', 'sections.category'])
                ->map(fn ($s) => [
                    'slug' => $s->slug,
                    'name' => $s->name,
                    'version' => $s->version,
                    'category' => $s->category,
                    'sort_order' => (int) $s->pivot->sort_order,
                    'is_required' => (bool) $s->pivot->is_required,
                ])
                ->values()
            : collect();

        // Pages summary (just enough to know what's available; the page content
        // is fetched per-request via the next endpoint).
        $pages = $website->pages()
            ->when(! $isOwner, fn ($q) => $q->where('status', 'published'))
            ->orderBy('sort_order')
            ->get(['id', 'slug', 'title', 'is_homepage', 'status']);

        return response()->json([
            'data' => [
                'website' => [
                    'id' => $website->id,
                    'subdomain' => $website->subdomain,
                    'custom_domain' => $website->custom_domain,
                    'site_name' => $website->site_name,
                    'tagline' => $website->tagline,
                    'logo_path' => $website->logo_path,
                    'favicon_path' => $website->favicon_path,
                    'tokens' => $website->tokens_json,
                    'header' => $website->header_json,
                    'footer' => $website->footer_json,
                    'site_languages' => $website->site_languages,
                    'default_locale' => $website->default_locale,
                    'status' => $website->status,
                    'published_at' => $website->published_at,
                ],
                'theme' => $theme ? [
                    'id' => $theme->id,
                    'slug' => $theme->slug,
                    'name' => $theme->name,
                    'version' => $theme->version,
                    'author' => $theme->author,
                    'preview_url' => $theme->preview_url,
                    'manifest' => $theme->manifest_json,
                    'tokens' => $theme->tokens_json,
                    'supported_types' => $theme->supported_types,
                    'is_default' => $theme->is_default,
                    'sections' => $themeSections,
                ] : null,
                'pages' => $pages->map(fn (Page $p) => [
                    'slug' => $p->slug,
                    'title' => $p->title,
                    'is_homepage' => $p->is_homepage,
                    'status' => $p->status,
                ])->values(),
                'is_preview' => $isOwner && $website->status !== 'published',
                'is_coming_soon' => false,
            ],
        ]);
    }

    /**
     * GET /api/public/sites/by-subdomain/{subdomain}/pages/{slug}
     */
    public function showPage(
        Request $request,
        string $subdomain,
        string $slug
    ): JsonResponse {
        $website = Website::query()
            ->where('subdomain', $subdomain)
            ->first();

        if (! $website) {
            throw new NotFoundHttpException('Site not found.');
        }

        $isOwner = $this->isOwner($request, $website);

        if ($website->status !== 'published' && ! $isOwner) {
            throw new NotFoundHttpException('Site not published.');
        }

        $page = $website->pages()
            ->where('slug', $slug)
            ->when(! $isOwner, fn ($q) => $q->where('status', 'published'))
            ->first();

        if (! $page) {
            throw new NotFoundHttpException('Page not found.');
        }

        return response()->json([
            'data' => [
                'id' => $page->id,
                'slug' => $page->slug,
                'title' => $page->title,
                'content_json' => $page->content_json,
                'seo_json' => $page->seo_json,
                'is_homepage' => $page->is_homepage,
                'status' => $page->status,
                'published_at' => $page->published_at,
                'is_preview' => $isOwner && $page->status !== 'published',
            ],
        ]);
    }

    /**
     * Soft auth check: if the caller sent a Sanctum Bearer token AND it
     * resolves to the owner of this website, treat as owner. Otherwise treat
     * as anonymous public visitor. Never throws on missing/invalid auth.
     */
    private function isOwner(Request $request, Website $website): bool
    {
        try {
            $user = auth('sanctum')->user();
        } catch (\Throwable) {
            $user = null;
        }

        return $user !== null && $user->id === $website->user_id;
    }
}
