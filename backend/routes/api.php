<?php

use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\PublicSiteController;
use App\Http\Controllers\Api\SectionController;
use App\Http\Controllers\Api\ThemeController;
use App\Http\Controllers\Api\WebsiteController;
use App\Http\Controllers\OnboardingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

require __DIR__.'/auth.php';

// ─── Public engine reads (no auth required — needed for tenant rendering) ──
Route::get('/themes', [ThemeController::class, 'index']);
Route::get('/themes/{slug}', [ThemeController::class, 'show']);
Route::get('/sections', [SectionController::class, 'index']);
Route::get('/sections/{slug}', [SectionController::class, 'show']);

// ─── Public tenant rendering ────────────────────────────────────────────
// Draft sites/pages are visible only when the request carries an owner token.
Route::get('/public/sites/by-subdomain/{subdomain}', [PublicSiteController::class, 'show']);
Route::get('/public/sites/by-subdomain/{subdomain}/pages/{slug}', [PublicSiteController::class, 'showPage']);

// Public form submission — rate-limited + honeypot inside the controller.
Route::post('/public/sites/by-subdomain/{subdomain}/forms', [FormController::class, 'store']);

// ─── Authenticated routes ─────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => $request->user()->only([
        'id', 'name', 'organization_name', 'site_name', 'email', 'phone',
        'country', 'website_type', 'selected_theme_id', 'brand_color',
        'accent_color', 'background_tone', 'typography_style', 'site_languages',
        'tagline', 'logo_path', 'favicon_path', 'donations_enabled',
        'onboarding_completed_at', 'email_verified_at',
    ]));

    // Onboarding
    Route::post('/onboarding/website-type', [OnboardingController::class, 'setWebsiteType']);
    Route::post('/onboarding/theme', [OnboardingController::class, 'setTheme']);
    Route::post('/onboarding/customize', [OnboardingController::class, 'setCustomization']);

    // Websites (one per user in MVP)
    Route::get('/websites/me', [WebsiteController::class, 'me']);
    Route::post('/websites', [WebsiteController::class, 'store']);
    Route::patch('/websites/{website}', [WebsiteController::class, 'update']);
    Route::post('/websites/{website}/publish', [WebsiteController::class, 'publish']);
    Route::post('/websites/{website}/unpublish', [WebsiteController::class, 'unpublish']);

    // Pages (scoped to a website)
    Route::get('/websites/{website}/pages', [PageController::class, 'index']);
    Route::get('/websites/{website}/pages/{slug}', [PageController::class, 'show']);
    Route::patch('/websites/{website}/pages/{slug}', [PageController::class, 'update']);

    // Media library (scoped to authenticated user; ?website_id= narrows further)
    Route::get('/media', [MediaController::class, 'index']);
    Route::post('/media', [MediaController::class, 'store']);
    Route::post('/media/bulk-delete', [MediaController::class, 'bulkDestroy']);
    Route::get('/media/folders', [MediaController::class, 'folders']);
    Route::get('/media/{media}', [MediaController::class, 'show']);
    Route::patch('/media/{media}', [MediaController::class, 'update']);
    Route::delete('/media/{media}', [MediaController::class, 'destroy']);
});
