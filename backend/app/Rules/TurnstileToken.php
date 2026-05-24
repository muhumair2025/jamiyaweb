<?php

namespace App\Rules;

use App\Services\TurnstileService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class TurnstileToken implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || $value === '') {
            $fail('Please complete the captcha.');
            return;
        }

        $ok = app(TurnstileService::class)->verify($value, request()->ip());

        if (! $ok) {
            $fail('Captcha verification failed. Please refresh and try again.');
        }
    }
}
