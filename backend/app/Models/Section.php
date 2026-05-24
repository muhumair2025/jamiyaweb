<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Section extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'version',
        'category',
        'icon',
        'schema_json',
        'default_settings_json',
        'preview_url',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'schema_json' => 'array',
            'default_settings_json' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function themes(): BelongsToMany
    {
        return $this->belongsToMany(Theme::class, 'theme_sections')
            ->withPivot(['sort_order', 'is_required'])
            ->withTimestamps();
    }
}
