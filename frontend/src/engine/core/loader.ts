import { API_URL } from "@/lib/api";
import {
  SectionMetaListResponseSchema,
} from "../schemas/section.schema";
import {
  ThemeListResponseSchema,
  ThemeShowResponseSchema,
} from "../schemas/theme.schema";
import type { SectionMeta, ThemeMeta } from "../types";

/**
 * Server-side fetchers for the public engine endpoints.
 *
 * All requests use Next.js fetch cache with `revalidate: 60` — the registry
 * data changes rarely (admin updates a theme/section in Filament), so a 60s
 * stale-while-revalidate is a good safety/freshness trade.
 *
 * If the API is down we throw — callers can decide how to handle it.
 */

const REVALIDATE_SECONDS = 60;

async function fetchJson<T>(path: string, parser: (raw: unknown) => T): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: REVALIDATE_SECONDS, tags: ["engine"] },
  });

  if (!res.ok) {
    throw new Error(
      `Engine API ${path} returned ${res.status} ${res.statusText}`
    );
  }

  const raw = await res.json();
  return parser(raw);
}

/** GET /api/themes — optionally filtered by website_type. */
export async function fetchThemes(opts?: {
  websiteType?: string;
}): Promise<ThemeMeta[]> {
  const qs = opts?.websiteType
    ? `?website_type=${encodeURIComponent(opts.websiteType)}`
    : "";

  return fetchJson(`/api/themes${qs}`, (raw) => {
    const parsed = ThemeListResponseSchema.parse(raw);
    return parsed.data;
  });
}

/** GET /api/themes/{slug}. */
export async function fetchTheme(slug: string): Promise<ThemeMeta> {
  return fetchJson(`/api/themes/${encodeURIComponent(slug)}`, (raw) => {
    const parsed = ThemeShowResponseSchema.parse(raw);
    return parsed.data;
  });
}

/** GET /api/sections — optionally filtered by category. */
export async function fetchSections(opts?: {
  category?: string;
}): Promise<SectionMeta[]> {
  const qs = opts?.category
    ? `?category=${encodeURIComponent(opts.category)}`
    : "";

  return fetchJson(`/api/sections${qs}`, (raw) => {
    const parsed = SectionMetaListResponseSchema.parse(raw);
    return parsed.data;
  });
}
