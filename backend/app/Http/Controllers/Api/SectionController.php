<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Section;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    /**
     * GET /api/sections
     * Public list of every active section the engine can render.
     * Optionally filter by category (hero, content, donation…).
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['nullable', 'string', 'max:64'],
        ]);

        $query = Section::query()
            ->where('is_active', true)
            ->orderBy('category')
            ->orderBy('name');

        if ($cat = $validated['category'] ?? null) {
            $query->where('category', $cat);
        }

        return response()->json([
            'data' => $query->get()->map(fn (Section $s) => $this->present($s)),
        ]);
    }

    /**
     * GET /api/sections/{slug}
     */
    public function show(string $slug): JsonResponse
    {
        $section = Section::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json(['data' => $this->present($section)]);
    }

    private function present(Section $s): array
    {
        return [
            'id' => $s->id,
            'slug' => $s->slug,
            'name' => $s->name,
            'version' => $s->version,
            'category' => $s->category,
            'icon' => $s->icon,
            'preview_url' => $s->preview_url,
            'schema' => $s->schema_json,
            'default_settings' => $s->default_settings_json,
        ];
    }
}
