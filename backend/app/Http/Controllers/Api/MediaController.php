<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Media library API.
 *
 * Scoped to the authenticated user. A `website_id` query param further
 * narrows results to a specific site (plus user-level assets shared across
 * sites). Uploads go to the `public` disk by default; this can be swapped
 * for S3/R2 by changing filesystems config — no controller changes needed.
 */
class MediaController extends Controller
{
    /** Hard upload ceiling (server-side guardrail). 25 MB. */
    private const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

    /** Per-kind MIME allow-list. Strict by design. */
    private const ALLOWED_MIMES = [
        'image' => [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'image/avif',
        ],
        'video' => [
            'video/mp4',
            'video/webm',
            'video/quicktime',
        ],
        'document' => [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv',
        ],
        'audio' => [
            'audio/mpeg',
            'audio/ogg',
            'audio/wav',
            'audio/webm',
        ],
    ];

    /**
     * GET /api/media
     * List the current user's media. Optional filters: kind, folder, website_id, q (search).
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'website_id' => ['nullable', 'integer', 'exists:websites,id'],
            'kind' => ['nullable', 'string', Rule::in(Media::KINDS)],
            'folder' => ['nullable', 'string', 'max:64'],
            'q' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:120'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $userId = $request->user()->id;
        $websiteId = isset($validated['website_id']) ? (int) $validated['website_id'] : null;

        if ($websiteId !== null) {
            $this->ensureWebsiteOwnership($request, $websiteId);
        }

        /** @var LengthAwarePaginator $paginator */
        $paginator = Media::query()
            ->ownedBy($userId, $websiteId)
            ->kind($validated['kind'] ?? null)
            ->folder($validated['folder'] ?? null)
            ->search($validated['q'] ?? null)
            ->orderByDesc('created_at')
            ->paginate(perPage: (int) ($validated['per_page'] ?? 48));

        return response()->json([
            'data' => $paginator->getCollection()->map(fn (Media $m) => $this->present($m))->all(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * POST /api/media
     * Multipart upload. Body: file (binary), [website_id], [folder], [alt], [title].
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'max:'.(self::MAX_UPLOAD_BYTES / 1024)], // KB
            'website_id' => ['nullable', 'integer', 'exists:websites,id'],
            'folder' => ['nullable', 'string', 'max:64', 'regex:/^[a-z0-9_\-\/]+$/i'],
            'alt' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
        ]);

        /** @var UploadedFile $file */
        $file = $request->file('file');
        $mime = $file->getMimeType() ?? 'application/octet-stream';
        $kind = Media::kindFromMime($mime);

        if (isset(self::ALLOWED_MIMES[$kind]) && ! in_array($mime, self::ALLOWED_MIMES[$kind], true)) {
            throw ValidationException::withMessages([
                'file' => "File type '$mime' is not allowed.",
            ]);
        }

        $userId = $request->user()->id;
        $websiteId = isset($validated['website_id']) ? (int) $validated['website_id'] : null;

        if ($websiteId !== null) {
            $this->ensureWebsiteOwnership($request, $websiteId);
        }

        $disk = 'public';
        $hash = hash_file('sha256', $file->getRealPath()) ?: null;

        // Dedupe: if user already uploaded the same byte-identical file, reuse it.
        if ($hash !== null) {
            $existing = Media::query()
                ->ownedBy($userId, $websiteId)
                ->where('hash', $hash)
                ->first();
            if ($existing) {
                return response()->json(['data' => $this->present($existing), 'deduped' => true], 200);
            }
        }

        $folderPath = $this->buildStorageFolder($userId, $websiteId, $validated['folder'] ?? null);
        $filename = $this->safeFilename($file);
        $relPath = $file->storeAs($folderPath, $filename, ['disk' => $disk]);

        [$width, $height] = $this->extractDimensions($disk, $relPath, $kind);

        $media = Media::create([
            'user_id' => $userId,
            'website_id' => $websiteId,
            'path' => $relPath,
            'original_filename' => $file->getClientOriginalName(),
            'title' => $validated['title'] ?? null,
            'folder' => $validated['folder'] ?? null,
            'disk' => $disk,
            'mime' => $mime,
            'kind' => $kind,
            'size' => $file->getSize() ?: 0,
            'hash' => $hash,
            'width' => $width,
            'height' => $height,
            'variants' => null,
            'metadata' => null,
            'alt' => $validated['alt'] ?? null,
        ]);

        return response()->json(['data' => $this->present($media)], 201);
    }

    /**
     * GET /api/media/{media}
     */
    public function show(Request $request, Media $media): JsonResponse
    {
        $this->ensureOwnership($request, $media);

        return response()->json(['data' => $this->present($media)]);
    }

    /**
     * PATCH /api/media/{media}
     * Only metadata can be edited (alt, title, folder). Binary stays immutable.
     */
    public function update(Request $request, Media $media): JsonResponse
    {
        $this->ensureOwnership($request, $media);

        $validated = $request->validate([
            'alt' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'folder' => ['nullable', 'string', 'max:64', 'regex:/^[a-z0-9_\-\/]+$/i'],
        ]);

        $media->fill(array_filter(
            $validated,
            static fn ($v) => $v !== null
        ));
        $media->save();

        return response()->json(['data' => $this->present($media)]);
    }

    /**
     * DELETE /api/media/{media}
     * Soft-deletes the row and removes the binary from disk. Once deleted,
     * the underlying URL stops resolving — links elsewhere will 404.
     */
    public function destroy(Request $request, Media $media): JsonResponse
    {
        $this->ensureOwnership($request, $media);

        Storage::disk($media->disk)->delete($media->path);
        if (is_array($media->variants)) {
            foreach ($media->variants as $variantPath) {
                if (is_string($variantPath)) {
                    Storage::disk($media->disk)->delete($variantPath);
                }
            }
        }

        $media->delete();

        return response()->json(['data' => null], 200);
    }

    /**
     * POST /api/media/bulk-delete
     * Body: { ids: number[] }
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1', 'max:200'],
            'ids.*' => ['integer'],
        ]);

        $items = Media::query()
            ->whereIn('id', $validated['ids'])
            ->where('user_id', $request->user()->id)
            ->get();

        foreach ($items as $media) {
            Storage::disk($media->disk)->delete($media->path);
            if (is_array($media->variants)) {
                foreach ($media->variants as $variantPath) {
                    if (is_string($variantPath)) {
                        Storage::disk($media->disk)->delete($variantPath);
                    }
                }
            }
            $media->delete();
        }

        return response()->json(['data' => ['deleted' => $items->count()]]);
    }

    /**
     * GET /api/media/folders
     * Returns distinct folder names this user has created.
     */
    public function folders(Request $request): JsonResponse
    {
        $folders = Media::query()
            ->where('user_id', $request->user()->id)
            ->whereNotNull('folder')
            ->select('folder')
            ->groupBy('folder')
            ->orderBy('folder')
            ->pluck('folder');

        return response()->json(['data' => $folders]);
    }

    // ──────────────────────────────────────────────────────────────────────

    private function ensureOwnership(Request $request, Media $media): void
    {
        if ($media->user_id !== $request->user()->id) {
            throw ValidationException::withMessages([
                'media' => 'Forbidden.',
            ])->status(403);
        }
    }

    private function ensureWebsiteOwnership(Request $request, int $websiteId): void
    {
        $ownsWebsite = $request->user()
            ->website()
            ->whereKey($websiteId)
            ->exists();

        if (! $ownsWebsite) {
            throw ValidationException::withMessages([
                'website_id' => 'Forbidden.',
            ])->status(403);
        }
    }

    private function buildStorageFolder(int $userId, ?int $websiteId, ?string $folder): string
    {
        $base = $websiteId
            ? "media/u{$userId}/w{$websiteId}"
            : "media/u{$userId}";

        if ($folder) {
            $base .= '/'.trim($folder, '/');
        }

        $base .= '/'.date('Y/m');

        return $base;
    }

    private function safeFilename(UploadedFile $file): string
    {
        $ext = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'bin');
        $slug = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) ?: 'file';
        $slug = Str::limit($slug, 60, '');

        return $slug.'-'.Str::lower(Str::random(8)).'.'.$ext;
    }

    /**
     * Best-effort dimension extraction via GD. Returns [null, null] for
     * non-images or when GD isn't available.
     *
     * @return array{0:?int,1:?int}
     */
    private function extractDimensions(string $disk, string $relPath, string $kind): array
    {
        if ($kind !== Media::KIND_IMAGE) {
            return [null, null];
        }

        try {
            $absPath = Storage::disk($disk)->path($relPath);
            if (! is_file($absPath)) {
                return [null, null];
            }
            $info = @getimagesize($absPath);
            if (is_array($info) && isset($info[0], $info[1])) {
                return [(int) $info[0], (int) $info[1]];
            }
        } catch (\Throwable) {
            // Swallow — dimensions are best-effort metadata only.
        }

        return [null, null];
    }

    private function present(Media $m): array
    {
        return [
            'id' => $m->id,
            'website_id' => $m->website_id,
            'path' => $m->path,
            'url' => $m->getUrl(),
            'original_filename' => $m->original_filename,
            'title' => $m->title,
            'folder' => $m->folder,
            'disk' => $m->disk,
            'mime' => $m->mime,
            'kind' => $m->kind,
            'size' => $m->size,
            'width' => $m->width,
            'height' => $m->height,
            'alt' => $m->alt,
            'variants' => $m->variants,
            'metadata' => $m->metadata,
            'created_at' => $m->created_at?->toIso8601String(),
        ];
    }
}
