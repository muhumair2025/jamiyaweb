<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Theme;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ThemeController extends Controller
{
    /**
     * GET /api/themes
     * Public list of active themes. Optionally filter by website_type.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'website_type' => ['nullable', 'string', 'in:welfare,scholar'],
        ]);

        $query = Theme::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($type = $validated['website_type'] ?? null) {
            $query->whereJsonContains('supported_types', $type);
        }

        return response()->json([
            'data' => $query->with(['sections' => fn ($q) => $q->where('is_active', true)])
                ->get()
                ->map(fn (Theme $t) => $this->present($t)),
        ]);
    }

    /**
     * GET /api/themes/{slug}
     */
    public function show(string $slug): JsonResponse
    {
        $theme = Theme::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->with(['sections' => fn ($q) => $q->where('is_active', true)])
            ->firstOrFail();

        return response()->json(['data' => $this->present($theme)]);
    }

    private function present(Theme $theme): array
    {
        return [
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
            'sections' => $theme->sections->map(fn ($s) => [
                'slug' => $s->slug,
                'name' => $s->name,
                'version' => $s->version,
                'category' => $s->category,
                'sort_order' => $s->pivot->sort_order,
                'is_required' => (bool) $s->pivot->is_required,
            ])->values(),
        ];
    }
}
