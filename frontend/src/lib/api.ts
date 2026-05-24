import { cookies } from "next/headers";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const AUTH_COOKIE = "jw_token";

export type ApiUser = {
  id: number;
  name: string;
  organization_name: string | null;
  site_name: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  website_type: string | null;
  selected_theme_id: string | null;
  brand_color: string | null;
  accent_color: string | null;
  background_tone: string | null;
  typography_style: string | null;
  site_languages: string[] | null;
  tagline: string | null;
  logo_path: string | null;
  favicon_path: string | null;
  donations_enabled: boolean;
  onboarding_completed_at: string | null;
  email_verified_at: string | null;
};

export type ApiError = {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
};

interface FetchOpts {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
}

/**
 * Server-side API client. Sends bearer token from cookie unless overridden.
 * Throws an object matching ApiError on non-2xx responses.
 */
export async function apiFetch<T = unknown>(
  path: string,
  opts: FetchOpts = {}
): Promise<T> {
  const { method = "GET", body, token, headers = {} } = opts;

  const bearer =
    token !== undefined
      ? token
      : (await cookies()).get(AUTH_COOKIE)?.value ?? null;

  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err: ApiError = {
      message: (data as { message?: string }).message ?? "Request failed",
      errors: (data as { errors?: Record<string, string[]> }).errors,
      status: res.status,
    };
    throw err;
  }

  return data as T;
}
