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
                ->map(fn(Page $p) => [
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

        /** @var Page $page */
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

        /** @var Page $page */
        $page = $website->pages()->where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'content_json' => ['sometimes', 'array'],
            'content_json.sections' => ['required_with:content_json', 'array'],
            'content_json.sections.*.id' => ['required', 'string'],
            'content_json.sections.*.type' => ['required', 'string'],
            'content_json.sections.*.settings' => ['required', 'array'],

            // Per-section style overrides — engine-managed payload. Mirrors
            // SectionStyleSchema (engine/style/schema.ts). All sub-keys
            // optional; strict enums for typed fields, free strings for
            // colours + spacing (validated client-side via Zod).
            'content_json.sections.*.style' => ['sometimes', 'nullable', 'array'],
            'content_json.sections.*.style.padding_top' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.style.padding_bottom' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.style.padding_x' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.style.bg_color' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.style.text_color' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.style.heading_color' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.style.heading_size' => ['sometimes', 'nullable', 'string', 'in:xs,sm,md,lg,xl'],
            'content_json.sections.*.style.body_size' => ['sometimes', 'nullable', 'string', 'in:sm,md,lg'],
            'content_json.sections.*.style.align' => ['sometimes', 'nullable', 'string', 'in:start,center,end'],
            'content_json.sections.*.style.max_width' => ['sometimes', 'nullable', 'string', 'in:sm,md,lg,xl,full'],
            'content_json.sections.*.style.radius' => ['sometimes', 'nullable', 'string', 'max:32'],

            // Per-element style overrides — mirrors ElementStyleSchema
            // (engine/element/schema.ts). `elements` is a map of element-id
            // (e.g. "title") → ElementStyle, so we use `.*` twice.
            'content_json.sections.*.elements' => ['sometimes', 'nullable', 'array'],
            'content_json.sections.*.elements.*' => ['sometimes', 'nullable', 'array'],
            'content_json.sections.*.elements.*.hidden' => ['sometimes', 'nullable', 'boolean'],
            'content_json.sections.*.elements.*.color' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.elements.*.font_size' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.elements.*.font_weight' => ['sometimes', 'nullable', 'string', 'max:8'],
            'content_json.sections.*.elements.*.line_height' => ['sometimes', 'nullable', 'string', 'max:16'],
            'content_json.sections.*.elements.*.letter_spacing' => ['sometimes', 'nullable', 'string', 'max:16'],
            'content_json.sections.*.elements.*.text_align' => ['sometimes', 'nullable', 'string', 'in:start,center,end'],
            'content_json.sections.*.elements.*.font_family' => ['sometimes', 'nullable', 'string', 'max:128'],
            'content_json.sections.*.elements.*.text_transform' => ['sometimes', 'nullable', 'string', 'in:none,uppercase,lowercase,capitalize'],
            'content_json.sections.*.elements.*.bg_color' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.elements.*.padding_x' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.elements.*.padding_y' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.elements.*.border_radius' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.elements.*.border_width' => ['sometimes', 'nullable', 'string', 'max:16'],
            'content_json.sections.*.elements.*.border_color' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.elements.*.shadow' => ['sometimes', 'nullable', 'string', 'in:none,sm,md,lg,xl'],
            'content_json.sections.*.elements.*.width' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.elements.*.height' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.elements.*.object_fit' => ['sometimes', 'nullable', 'string', 'in:contain,cover,fill,scale-down,none'],
            'content_json.sections.*.elements.*.opacity' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:1'],
            'content_json.sections.*.elements.*.size' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.elements.*.max_width' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.elements.*.gap' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.elements.*.bg_image' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'content_json.sections.*.elements.*.bg_position' => ['sometimes', 'nullable', 'string', 'in:center,top,bottom,left,right'],
            'content_json.sections.*.elements.*.bg_size' => ['sometimes', 'nullable', 'string', 'in:cover,contain,auto'],
            'content_json.sections.*.elements.*.overlay_color' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.elements.*.overlay_opacity' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:1'],
            'content_json.sections.*.elements.*.margin_top' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.elements.*.margin_bottom' => ['sometimes', 'nullable', 'string', 'max:32'],
            'content_json.sections.*.elements.*.align_self' => ['sometimes', 'nullable', 'string', 'in:auto,start,center,end,stretch'],

            'seo_json' => ['sometimes', 'nullable', 'array'],
            'status' => ['sometimes', 'string', 'in:draft,published'],
        ]);

        // Direct attribute assignment instead of fill() — defends against any
        // edge case where the validator could produce nested stdClass nodes
        // (Filament's textarea ->json() rule is one historic source of this).
        if (array_key_exists('title', $validated)) {
            $page->title = $validated['title'];
        }
        if (array_key_exists('content_json', $validated)) {
            // Force array (not stdClass) before letting the array cast serialise it.
            $page->content_json = json_decode(
                json_encode($validated['content_json']),
                associative: true
            );
        }
        if (array_key_exists('seo_json', $validated)) {
            $page->seo_json = $validated['seo_json'] === null
                ? null
                : json_decode(json_encode($validated['seo_json']), associative: true);
        }
        if (array_key_exists('status', $validated)) {
            $page->status = $validated['status'];
            if ($validated['status'] === 'published') {
                $page->published_at = now();
            }
        }

        $page->save();

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
