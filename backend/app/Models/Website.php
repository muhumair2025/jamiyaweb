<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Website extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'theme_id',
        'subdomain',
        'custom_domain',
        'site_name',
        'tagline',
        'logo_path',
        'favicon_path',
        'tokens_json',
        'header_json',
        'footer_json',
        'site_languages',
        'default_locale',
        'status',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'tokens_json' => 'array',
            'header_json' => 'array',
            'footer_json' => 'array',
            'site_languages' => 'array',
            'published_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function theme(): BelongsTo
    {
        return $this->belongsTo(Theme::class);
    }

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class);
    }

    public function homepage()
    {
        return $this->hasOne(Page::class)->where('is_homepage', true);
    }

    public function media(): HasMany
    {
        return $this->hasMany(Media::class);
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }
}
