import { cache } from "react";
import { apiFetch } from "./api";
import { getAuthToken } from "./auth";

export type WebsiteDto = {
  id: number;
  subdomain: string;
  custom_domain: string | null;
  site_name: string;
  tagline: string | null;
  logo_path: string | null;
  favicon_path: string | null;
  tokens: Record<string, string> | null;
  site_languages: string[];
  default_locale: string;
  status: "draft" | "published";
  published_at: string | null;
  theme: { slug: string; name: string } | null;
  homepage: { slug: string; title: string } | null;
};

/**
 * Fetch the authenticated user's website (or null if they haven't created one).
 * Memoised per-request.
 */
export const getCurrentWebsite = cache(
  async (): Promise<WebsiteDto | null> => {
    const token = await getAuthToken();
    if (!token) return null;

    try {
      const res = await apiFetch<{ data: WebsiteDto | null }>(
        "/api/websites/me"
      );
      return res?.data ?? null;
    } catch {
      return null;
    }
  }
);

/** Build the preview URL for a tenant site (dev: *.localhost:3000). */
export function previewUrl(website: WebsiteDto, path = "/"): string {
  const port = typeof window !== "undefined" ? window.location.port : "3000";
  return `http://${website.subdomain}.localhost:${port || 3000}${path}`;
}
