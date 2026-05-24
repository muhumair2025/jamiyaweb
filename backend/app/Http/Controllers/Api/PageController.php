<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\Website;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PageController extends Controller
{
    /**
     * GET /api/websites/{website}/pages
     */
    public function index(Request $request, Website $website): JsonResponse
    {
        $this->authorizeOwnership($request, $website);

        return response()->json([
            'data' => $website->pages()
                ->orderBy('sort_order')
                ->get(['id', 'slug', 'title', 'is_homepage', 'status', 'published_at'])
                ->map(fn (Page $p) => [
                    'id' => $p->id,
                    'slug' => $p->slug,
                    'title' => $p->title,
                    'is_homepage' => $p->is_homepage,
                    'status' => $p->status,
                    'published_at' => $p->published_at,
                ]),
        ]);
    }

    /**
     * GET /api/websites/{website}/pages/{slug}
     */
    public function show(Request $request, Website $website, string $slug): JsonResponse
    {
        $this->authorizeOwnership($request, $website);

        $page = $website->pages()->where('slug', $slug)->firstOrFail();

        return response()->json(['data' => $this->present($page)]);
    }

    /**
     * PATCH /api/websites/{website}/pages/{slug}
     * Updates the page's content_json, title, seo_json, or status.
     * `content_json` should be a full replacement of the sections array.
     */
    public function update(Request $request, Website $website, string $slug): JsonResponse
    {
        $this->authorizeOwnership($request, $website);

        $page = $website->pages()->where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'content_json' => ['sometimes', 'array'],
            'content_json.sections' => ['required_with:content_json', 'array'],
            'content_json.sections.*.id' => ['required', 'string'],
            'content_json.sections.*.type' => ['required', 'string'],
            'content_json.sections.*.settings' => ['required', 'array'],
            'seo_json' => ['sometimes', 'nullable', 'array'],
            'status' => ['sometimes', 'string', 'in:draft,published'],
        ]);

        if (array_key_exists('status', $validated) && $validated['status'] === 'published') {
            $page->published_at = now();
        }

        $page->fill($validated)->save();

        return response()->json(['data' => $this->present($page)]);
    }

    private function authorizeOwnership(Request $request, Website $website): void
    {
        if ($website->user_id !== $request->user()->id) {
            throw ValidationException::withMessages([
                'website' => 'Forbidden.',
            ])->status(403);
        }
    }

    private function present(Page $p): array
    {
        return [
            'id' => $p->id,
            'slug' => $p->slug,
            'title' => $p->title,
            'content_json' => $p->content_json,
            'seo_json' => $p->seo_json,
            'is_homepage' => $p->is_homepage,
            'status' => $p->status,
            'published_at' => $p->published_at,
        ];
    }
}
