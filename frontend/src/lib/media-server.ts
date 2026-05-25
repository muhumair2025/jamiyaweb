// Server-only: this module uses apiFetch which reads cookies via next/headers.
// Importing it into a client component will fail at build/runtime.
import { apiFetch } from "./api";
import type {
  MediaListParams,
  MediaListResponse,
} from "./media";

/**
 * SSR helper: list the authenticated user's media from a server component.
 * Skips the internal proxy hop — talks to Laravel directly with apiFetch.
 */
export async function listMediaServer(
  params: MediaListParams = {}
): Promise<MediaListResponse> {
  const sp = new URLSearchParams();
  if (params.websiteId != null) sp.set("website_id", String(params.websiteId));
  if (params.kind) sp.set("kind", params.kind);
  if (params.folder) sp.set("folder", params.folder);
  if (params.q) sp.set("q", params.q);
  if (params.page) sp.set("page", String(params.page));
  if (params.perPage) sp.set("per_page", String(params.perPage));

  const qs = sp.toString();
  return apiFetch<MediaListResponse>(`/api/media${qs ? `?${qs}` : ""}`);
}

export async function listMediaFoldersServer(): Promise<string[]> {
  const res = await apiFetch<{ data: string[] }>("/api/media/folders");
  return res.data;
}
