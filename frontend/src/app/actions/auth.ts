"use server";

import { redirect } from "next/navigation";
import { apiFetch, API_URL, type ApiUser } from "@/lib/api";
import { clearAuthCookie, getAuthToken, setAuthCookie } from "@/lib/auth";
import type { AuthState } from "@/lib/auth-state";
import { postAuthHref } from "@/lib/onboarding";

function handleApiError(e: unknown): AuthState {
  const err = e as { message?: string; errors?: Record<string, string[]> };
  return {
    status: "error",
    message: err?.message ?? "Something went wrong. Please try again.",
    errors: err?.errors,
  };
}

interface AuthSuccess {
  user: ApiUser;
  token: string;
}


// ─────────────────────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────────────────────
export async function registerAction(
  _prev: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const locale = (formData.get("locale") as string) || "en";

  const phoneCode = (formData.get("phone_code") as string) || "";
  const phoneRaw = ((formData.get("phone") as string) || "").trim();
  const phone = phoneRaw ? `${phoneCode} ${phoneRaw}`.trim() : "";

  const payload = {
    name: (formData.get("name") as string)?.trim(),
    organization_name: (formData.get("organization_name") as string)?.trim(),
    email: (formData.get("email") as string)?.trim().toLowerCase(),
    phone,
    country: (formData.get("country") as string)?.trim(),
    password: formData.get("password") as string,
    turnstile_token: (formData.get("cf-turnstile-response") as string) || "",
  };

  let result: AuthSuccess;
  try {
    result = await apiFetch<AuthSuccess>("/api/register", {
      method: "POST",
      body: payload,
      token: null,
    });
  } catch (e) {
    return handleApiError(e);
  }

  await setAuthCookie(result.token);
  redirect(postAuthHref(result.user, locale));
}

// ─────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────
export async function loginAction(
  _prev: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const locale = (formData.get("locale") as string) || "en";

  const payload = {
    email: (formData.get("email") as string)?.trim().toLowerCase(),
    password: formData.get("password") as string,
    device_name: "web",
    turnstile_token: (formData.get("cf-turnstile-response") as string) || "",
  };

  let result: AuthSuccess;
  try {
    result = await apiFetch<AuthSuccess>("/api/login", {
      method: "POST",
      body: payload,
      token: null,
    });
  } catch (e) {
    return handleApiError(e);
  }

  await setAuthCookie(result.token);
  redirect(postAuthHref(result.user, locale));
}

// ─────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────
export async function logoutAction(locale: string = "en"): Promise<void> {
  try {
    await apiFetch("/api/logout", { method: "POST" });
  } catch {
    // even if token already invalid, clear cookie
  }
  await clearAuthCookie();
  redirect(`/${locale}/login`);
}

// ─────────────────────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────────────────────
export async function forgotPasswordAction(
  _prev: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const turnstileToken = (formData.get("cf-turnstile-response") as string) || "";

  try {
    await apiFetch("/api/forgot-password", {
      method: "POST",
      body: { email, turnstile_token: turnstileToken },
      token: null,
    });
  } catch (e) {
    return handleApiError(e);
  }

  return {
    status: "success",
    message:
      "If an account exists for that email, a reset link has been sent. Check your inbox.",
  };
}

// ─────────────────────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────────────────────
export async function resetPasswordAction(
  _prev: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const locale = (formData.get("locale") as string) || "en";

  const payload = {
    token: formData.get("token") as string,
    email: (formData.get("email") as string)?.trim().toLowerCase(),
    password: formData.get("password") as string,
    password_confirmation: formData.get("password_confirmation") as string,
  };

  try {
    await apiFetch("/api/reset-password", {
      method: "POST",
      body: payload,
      token: null,
    });
  } catch (e) {
    return handleApiError(e);
  }

  redirect(`/${locale}/login?reset=1`);
}

// ─────────────────────────────────────────────────────────────
// RESEND VERIFICATION EMAIL
// ─────────────────────────────────────────────────────────────
export async function resendVerificationAction(): Promise<AuthState> {
  try {
    await apiFetch("/api/email/verification-notification", { method: "POST" });
  } catch (e) {
    return handleApiError(e);
  }
  return {
    status: "success",
    message: "Verification link sent. Check your inbox.",
  };
}

// ─────────────────────────────────────────────────────────────
// ONBOARDING — Step 1: website type
// ─────────────────────────────────────────────────────────────
export async function setWebsiteTypeAction(
  _prev: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const locale = (formData.get("locale") as string) || "en";
  const websiteType = formData.get("website_type") as string;

  let result: { user: ApiUser };
  try {
    result = await apiFetch<{ user: ApiUser }>(
      "/api/onboarding/website-type",
      {
        method: "POST",
        body: { website_type: websiteType },
      }
    );
  } catch (e) {
    return handleApiError(e);
  }

  redirect(postAuthHref(result.user, locale));
}

// ─────────────────────────────────────────────────────────────
// ONBOARDING — Step 2: theme
// ─────────────────────────────────────────────────────────────
export async function setThemeAction(
  _prev: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const locale = (formData.get("locale") as string) || "en";
  const themeId = formData.get("theme_id") as string;

  let result: { user: ApiUser };
  try {
    result = await apiFetch<{ user: ApiUser }>("/api/onboarding/theme", {
      method: "POST",
      body: { theme_id: themeId },
    });
  } catch (e) {
    return handleApiError(e);
  }

  redirect(postAuthHref(result.user, locale));
}

// ─────────────────────────────────────────────────────────────
// ONBOARDING — Step 3: customization (multipart for logo upload)
// ─────────────────────────────────────────────────────────────
export async function setCustomizationAction(
  _prev: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const locale = (formData.get("locale") as string) || "en";

  // Build multipart payload — we can't use apiFetch because it forces JSON.
  // Forward all relevant fields manually.
  const fwd = new FormData();
  fwd.append("site_name", (formData.get("site_name") as string) || "");
  fwd.append("brand_color", (formData.get("brand_color") as string) || "");
  fwd.append("accent_color", (formData.get("accent_color") as string) || "");
  fwd.append(
    "background_tone",
    (formData.get("background_tone") as string) || ""
  );
  fwd.append(
    "typography_style",
    (formData.get("typography_style") as string) || ""
  );

  // site_languages comes in as multiple form entries
  const langs = formData.getAll("site_languages");
  for (const l of langs) {
    if (typeof l === "string") fwd.append("site_languages[]", l);
  }

  const tagline = (formData.get("tagline") as string) || "";
  if (tagline) fwd.append("tagline", tagline);

  const donations = formData.get("donations_enabled");
  fwd.append("donations_enabled", donations === "on" ? "1" : "0");

  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    fwd.append("logo", logo, logo.name);
  }

  const favicon = formData.get("favicon");
  if (favicon instanceof File && favicon.size > 0) {
    fwd.append("favicon", favicon, favicon.name);
  }

  const token = await getAuthToken();
  let result: { user: ApiUser };
  try {
    const res = await fetch(`${API_URL}/api/onboarding/customize`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: fwd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: "error",
        message:
          (data as { message?: string }).message ?? "Could not save changes.",
        errors: (data as { errors?: Record<string, string[]> }).errors,
      };
    }
    result = data as { user: ApiUser };
  } catch (e) {
    return handleApiError(e);
  }

  redirect(postAuthHref(result.user, locale));
}

