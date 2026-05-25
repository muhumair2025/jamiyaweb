<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasFactory, SoftDeletes;

    // Laravel's auto-pluralisation of "Media" is "Media" not "Medias",
    // so the migration uses the singular table name on purpose.
    protected $table = 'media';

    public const KIND_IMAGE = 'image';
    public const KIND_VIDEO = 'video';
    public const KIND_DOCUMENT = 'document';
    public const KIND_AUDIO = 'audio';
    public const KIND_OTHER = 'other';

    public const KINDS = [
        self::KIND_IMAGE,
        self::KIND_VIDEO,
        self::KIND_DOCUMENT,
        self::KIND_AUDIO,
        self::KIND_OTHER,
    ];

    protected $fillable = [
        'user_id',
        'website_id',
        'path',
        'original_filename',
        'title',
        'folder',
        'disk',
        'mime',
        'kind',
        'size',
        'hash',
        'width',
        'height',
        'variants',
        'metadata',
        'alt',
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
            'variants' => 'array',
            'metadata' => 'array',
        ];
    }

    protected $appends = ['url'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class);
    }

    /** Public URL for the asset. */
    public function getUrl(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }

    public function getUrlAttribute(): string
    {
        return $this->getUrl();
    }

    /** Map a MIME type to a high-level "kind" bucket. */
    public static function kindFromMime(string $mime): string
    {
        return match (true) {
            str_starts_with($mime, 'image/') => self::KIND_IMAGE,
            str_starts_with($mime, 'video/') => self::KIND_VIDEO,
            str_starts_with($mime, 'audio/') => self::KIND_AUDIO,
            in_array($mime, [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain',
                'text/csv',
            ], true) => self::KIND_DOCUMENT,
            default => self::KIND_OTHER,
        };
    }

    /** Scope: media owned by a user (and optionally a website). */
    public function scopeOwnedBy(Builder $query, int $userId, ?int $websiteId = null): Builder
    {
        $query->where('user_id', $userId);
        if ($websiteId !== null) {
            $query->where(function (Builder $q) use ($websiteId): void {
                $q->where('website_id', $websiteId)->orWhereNull('website_id');
            });
        }

        return $query;
    }

    public function scopeKind(Builder $query, ?string $kind): Builder
    {
        if ($kind && in_array($kind, self::KINDS, true)) {
            $query->where('kind', $kind);
        }

        return $query;
    }

    public function scopeFolder(Builder $query, ?string $folder): Builder
    {
        if ($folder !== null && $folder !== '') {
            $query->where('folder', $folder);
        }

        return $query;
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if ($term) {
            $like = '%'.str_replace(['%', '_'], ['\%', '\_'], $term).'%';
            $query->where(function (Builder $q) use ($like): void {
                $q->where('original_filename', 'like', $like)
                    ->orWhere('title', 'like', $like)
                    ->orWhere('alt', 'like', $like);
            });
        }

        return $query;
    }
}
