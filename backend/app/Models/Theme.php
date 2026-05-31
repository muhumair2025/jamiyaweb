<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Theme extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'version',
        'author',
        'preview_url',
        'manifest_json',
        'tokens_json',
        'default_pages_json',
        'default_header_json',
        'default_footer_json',
        'supported_types',
        'is_active',
        'is_default',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'manifest_json' => 'array',
            'tokens_json' => 'array',
            'default_pages_json' => 'array',
            'default_header_json' => 'array',
            'default_footer_json' => 'array',
            'supported_types' => 'array',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function sections(): BelongsToMany
    {
        return $this->belongsToMany(Section::class, 'theme_sections')
            ->withPivot(['sort_order', 'is_required'])
            ->withTimestamps()
            ->orderBy('theme_sections.sort_order');
    }

    public function websites(): HasMany
    {
        return $this->hasMany(Website::class);
    }
}
