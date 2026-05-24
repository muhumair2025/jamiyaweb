<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasFactory;

    // Laravel's auto-pluralisation of "Media" is "Media" not "Medias", so
    // the migration uses the singular table name on purpose.
    protected $table = 'media';

    protected $fillable = [
        'user_id',
        'website_id',
        'path',
        'disk',
        'mime',
        'size',
        'width',
        'height',
        'alt',
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class);
    }

    /** Public URL to access this asset. */
    public function getUrl(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }
}
