<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AuthorizationException;

class VerifyEmailController extends Controller
{
    /**
     * Mark a user's email as verified via a signed URL from the verification email.
     */
    public function __invoke(Request $request, string $id, string $hash): RedirectResponse
    {
        $user = User::findOrFail($id);

        if (! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            throw new AuthorizationException('Invalid verification link.');
        }

        $redirectBase = rtrim(config('app.frontend_url') ?? config('app.url'), '/');

        if ($user->hasVerifiedEmail()) {
            return redirect($redirectBase.'/en/verify-email?verified=1');
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect($redirectBase.'/en/verify-email?verified=1');
    }
}
