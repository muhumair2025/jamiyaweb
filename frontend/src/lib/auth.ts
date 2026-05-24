import { cookies } from "next/headers";
import { cache } from "react";
import { apiFetch, AUTH_COOKIE, type ApiUser } from "./api";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function setAuthCookie(token: string) {
  const jar = await cookies();
  jar.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearAuthCookie() {
  const jar = await cookies();
  jar.delete(AUTH_COOKIE);
}

export async function getAuthToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(AUTH_COOKIE)?.value ?? null;
}

/**
 * Fetch the currently-authenticated user, or null if no valid token.
 * Memoised per-request via React `cache`.
 */
export const getCurrentUser = cache(async (): Promise<ApiUser | null> => {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    return await apiFetch<ApiUser>("/api/user");
  } catch {
    return null;
  }
});
