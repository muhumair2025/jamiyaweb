"use client";

import { useRef, useState } from "react";
import { Turnstile as TurnstileWidget, type TurnstileInstance } from "@marsidev/react-turnstile";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

/**
 * Cloudflare Turnstile (CAPTCHA alternative) — drop into any auth form.
 * Renders the widget and a hidden input named `cf-turnstile-response`
 * so the parent form's server action picks up the token automatically.
 *
 * Falls back to a hidden "dev-bypass" token in development if SITE_KEY is
 * unset, so local work isn't blocked while you set up Cloudflare.
 */
export function Turnstile({ locale }: { locale: string }) {
  const ref = useRef<TurnstileInstance | null>(null);
  const [token, setToken] = useState<string>("");

  if (!SITE_KEY) {
    // No key configured: emit a placeholder so backend gets *something*.
    // Backend will still reject it unless TURNSTILE_SECRET is also the test key.
    return (
      <input
        type="hidden"
        name="cf-turnstile-response"
        value="dev-bypass"
        readOnly
      />
    );
  }

  return (
    <div className="grid gap-2">
      <TurnstileWidget
        ref={ref}
        siteKey={SITE_KEY}
        options={{
          theme: "light",
          size: "flexible",
          language: locale === "ar" ? "ar" : "en",
        }}
        onSuccess={(t) => setToken(t)}
        onExpire={() => {
          setToken("");
          ref.current?.reset();
        }}
        onError={() => setToken("")}
      />
      <input
        type="hidden"
        name="cf-turnstile-response"
        value={token}
        readOnly
      />
    </div>
  );
}
