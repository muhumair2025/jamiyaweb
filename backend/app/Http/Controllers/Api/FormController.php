<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormSubmission;
use App\Models\Website;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

/**
 * Public form submission endpoint. Receives contact-form submissions from
 * any tenant site, scoped by subdomain.
 *
 * Anti-abuse layers:
 *   1. Honeypot — a hidden `_hp` field must be empty. Bots fill every input.
 *   2. Rate limit — 6 submissions / minute / IP / website.
 *   3. Spam tagging — if the message contains too many URLs or looks
 *      automated, mark it as `spam` (still stored so the user can review).
 */
class FormController extends Controller
{
    public function store(Request $request, string $subdomain): JsonResponse
    {
        $website = Website::query()
            ->where('subdomain', $subdomain)
            ->firstOrFail();

        $validated = $request->validate([
            'form_name' => ['nullable', 'string', 'max:100'],
            'section_id' => ['nullable', 'string', 'max:64'],
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:64'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'min:5', 'max:5000'],
            // Honeypot — MUST be empty. Bots that auto-fill every input
            // populate this; humans never see it (display: none).
            '_hp' => ['nullable', 'string', 'max:0'],
            // Extra fields (free-form) the front-end may include for
            // custom forms in the future.
            'extra' => ['nullable', 'array'],
        ]);

        // Honeypot trip → silently 200 (don't tell bots they failed) but
        // never write anything.
        if (! empty($validated['_hp'] ?? null)) {
            return response()->json(['ok' => true]);
        }

        // Rate limit: 6 per minute per (ip + website)
        $key = "form-submit:{$website->id}:".$request->ip();
        if (RateLimiter::tooManyAttempts($key, 6)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'message' => "Too many submissions. Try again in {$seconds} seconds.",
            ])->status(429);
        }
        RateLimiter::hit($key, 60);

        $message = $validated['message'];
        $status = self::looksLikeSpam($message)
            ? FormSubmission::STATUS_SPAM
            : FormSubmission::STATUS_NEW;

        FormSubmission::create([
            'website_id' => $website->id,
            'section_id' => $validated['section_id'] ?? null,
            'form_name' => $validated['form_name'] ?? 'contact',
            'sender_name' => $validated['name'] ?? null,
            'sender_email' => $validated['email'],
            'sender_phone' => $validated['phone'] ?? null,
            'sender_subject' => $validated['subject'] ?? null,
            'message' => $message,
            'payload' => $validated['extra'] ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 512),
            'referrer' => mb_substr((string) $request->header('referer', ''), 0, 512) ?: null,
            'status' => $status,
        ]);

        return response()->json(['ok' => true]);
    }

    /** Heuristic spam detector — flags >3 URLs or known spam keywords. */
    private static function looksLikeSpam(string $message): bool
    {
        $urlCount = preg_match_all('/https?:\/\//i', $message);
        if ($urlCount > 3) {
            return true;
        }
        $needles = ['viagra', 'cialis', 'casino', 'crypto giveaway', 'forex signals'];
        $lower = mb_strtolower($message);
        foreach ($needles as $needle) {
            if (str_contains($lower, $needle)) {
                return true;
            }
        }

        return false;
    }
}
