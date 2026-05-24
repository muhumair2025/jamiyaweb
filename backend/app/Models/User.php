<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'organization_name',
        'site_name',
        'email',
        'phone',
        'country',
        'password',
        'website_type',
        'selected_theme_id',
        'brand_color',
        'accent_color',
        'background_tone',
        'typography_style',
        'site_languages',
        'tagline',
        'logo_path',
        'favicon_path',
        'donations_enabled',
        'onboarding_completed_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'site_languages' => 'array',
            'donations_enabled' => 'boolean',
            'onboarding_completed_at' => 'datetime',
        ];
    }
}
