<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Verifies Cloudflare Turnstile tokens.
 *
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
class TurnstileService
{
    private const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    public function verify(?string $token, ?string $remoteIp = null): bool
    {
        if (! $token) {
            return false;
        }

        $secret = (string) config('services.turnstile.secret');
        if ($secret === '') {
            // Misconfiguration: fail closed rather than silently allowing bots through.
            Log::warning('Turnstile secret is not set. Rejecting verification.');
            return false;
        }

        try {
            $payload = [
                'secret' => $secret,
                'response' => $token,
            ];
            if ($remoteIp) {
                $payload['remoteip'] = $remoteIp;
            }

            $response = Http::asForm()
                ->timeout(5)
                ->post(self::VERIFY_URL, $payload);

            if (! $response->successful()) {
                Log::warning('Turnstile verification call failed.', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return false;
            }

            return (bool) ($response->json('success') ?? false);
        } catch (\Throwable $e) {
            Log::warning('Turnstile verification threw.', ['msg' => $e->getMessage()]);
            return false;
        }
    }
}
