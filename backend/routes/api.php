<?php

use App\Http\Controllers\OnboardingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

require __DIR__.'/auth.php';

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => $request->user()->only([
        'id', 'name', 'organization_name', 'site_name', 'email', 'phone',
        'country', 'website_type', 'selected_theme_id', 'brand_color',
        'accent_color', 'background_tone', 'typography_style', 'site_languages',
        'tagline', 'logo_path', 'favicon_path', 'donations_enabled',
        'onboarding_completed_at', 'email_verified_at',
    ]));

    Route::post('/onboarding/website-type', [OnboardingController::class, 'setWebsiteType']);
    Route::post('/onboarding/theme', [OnboardingController::class, 'setTheme']);
    Route::post('/onboarding/customize', [OnboardingController::class, 'setCustomization']);
});
