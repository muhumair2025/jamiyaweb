<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OnboardingController extends Controller
{
    /**
     * Shape of the user returned to the SPA after each onboarding step.
     */
    private array $userFields = [
        'id', 'name', 'organization_name', 'site_name', 'email', 'phone',
        'country', 'website_type', 'selected_theme_id', 'brand_color',
        'accent_color', 'background_tone', 'typography_style', 'site_languages',
        'tagline', 'logo_path', 'favicon_path', 'donations_enabled',
        'onboarding_completed_at', 'email_verified_at',
    ];

    public function setWebsiteType(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'website_type' => ['required', 'string', 'in:welfare,scholar'],
        ]);

        $user = $request->user();
        $user->website_type = $validated['website_type'];
        $user->save();

        return response()->json(['user' => $user->only($this->userFields)]);
    }

    public function setTheme(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'theme_id' => ['required', 'string', 'max:64'],
        ]);

        $user = $request->user();
        $user->selected_theme_id = $validated['theme_id'];
        $user->save();

        return response()->json(['user' => $user->only($this->userFields)]);
    }

    public function setCustomization(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'site_name' => ['required', 'string', 'max:255'],
            'brand_color' => ['required', 'string', 'max:32'],
            'accent_color' => ['required', 'string', 'max:32'],
            'background_tone' => ['required', 'string', 'max:32'],
            'typography_style' => ['required', 'string', 'in:modern,classical,minimal,editorial,display'],
            'site_languages' => ['required', 'array', 'min:1'],
            'site_languages.*' => ['string', 'in:en,ar'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'donations_enabled' => ['nullable', 'boolean'],
            'logo' => ['nullable', 'image', 'max:2048'],       // ≤ 2 MB
            'favicon' => ['nullable', 'image', 'max:512'],     // ≤ 512 KB
        ]);

        $user = $request->user();
        $user->site_name = $validated['site_name'];
        $user->brand_color = $validated['brand_color'];
        $user->accent_color = $validated['accent_color'];
        $user->background_tone = $validated['background_tone'];
        $user->typography_style = $validated['typography_style'];
        $user->site_languages = $validated['site_languages'];
        $user->tagline = $validated['tagline'] ?? null;
        $user->donations_enabled = (bool) ($validated['donations_enabled'] ?? false);

        if ($request->hasFile('logo')) {
            if ($user->logo_path) {
                Storage::disk('public')->delete($user->logo_path);
            }
            $user->logo_path = $request->file('logo')->store("logos/{$user->id}", 'public');
        }

        if ($request->hasFile('favicon')) {
            if ($user->favicon_path) {
                Storage::disk('public')->delete($user->favicon_path);
            }
            $user->favicon_path = $request->file('favicon')->store("favicons/{$user->id}", 'public');
        }

        $user->onboarding_completed_at = now();
        $user->save();

        return response()->json(['user' => $user->only($this->userFields)]);
    }
}
