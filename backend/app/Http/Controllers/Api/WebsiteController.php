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
