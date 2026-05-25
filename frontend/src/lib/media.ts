/**
 * Media library — types + client-side helpers.
 *
 * Client code calls the internal Next route handlers under /api/internal/media,
 * which forward the request to the Laravel API with the auth cookie attached.
 * This keeps the bearer token httpOnly while still letting the browser upload
 * files directly (multipart FormData, no body-size dance with server actions).
 *
 * For SSR list/read inside server components, prefer lib/media-server.ts —
 * it skips the proxy hop and hits Laravel directly via apiFetch.
 */

export type MediaKind = "image" | "video" | "document" | "audio" | "other";

export interface MediaItem {
  id: number;
  website_id: number | null;
  path: string;
  url: string;
  original_filename: string | null;
  title: string | null;
  folder: string | null;
  disk: string;
  mime: string;
  kind: MediaKind;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  variants: Record<string, string> | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
}

export interface MediaListMeta {
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
}

export interface MediaListResponse {
  data: MediaItem[];
  meta: MediaListMeta;
}

export interface MediaListParams {
  websiteId?: number | null;
  kind?: MediaKind | null;
  folder?: string | null;
  q?: string | null;
  page?: number;
  perPage?: number;
}

export interface UploadParams {
  file: File;
  websiteId?: number | null;
  folder?: string | null;
  alt?: string | null;
  title?: string | null;
}

export interface UpdateMediaParams {
  alt?: string | null;
  title?: string | null;
  folder?: string | null;
}

const PROXY_BASE = "/api/internal/media";

function buildQuery(params: MediaListParams): string {
  const sp = new URLSearchParams();
  if (params.websiteId != null) sp.set("website_id", String(params.websiteId));
  if (params.kind) sp.set("kind", params.kind);
  if (params.folder) sp.set("folder", params.folder);
  if (params.q) sp.set("q", params.q);
  if (params.page) sp.set("page", String(params.page));
  if (params.perPage) sp.set("per_page", String(params.perPage));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

async function asJson<T>(res: Response): Promise<T> {
  const ct = res.headers.get("content-type") ?? "";
  const body = ct.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const message =
      (typeof body === "object" && body && "message" in body
        ? (body as { message?: string }).message
        : null) ?? `Request failed (${res.status})`;
    const errors =
      typeof body === "object" && body && "errors" in body
        ? ((body as { errors?: Record<string, string[]> }).errors ?? undefined)
        : undefined;
    throw Object.assign(new Error(message), { status: res.status, errors });
  }

  return body as T;
}

export async function listMedia(
  params: MediaListParams = {}
): Promise<MediaListResponse> {
  const res = await fetch(`${PROXY_BASE}${buildQuery(params)}`, {
    method: "GET",
    cache: "no-store",
  });
  return asJson<MediaListResponse>(res);
}

export async function listMediaFolders(): Promise<string[]> {
  const res = await fetch(`${PROXY_BASE}/folders`, {
    method: "GET",
    cache: "no-store",
  });
  const json = await asJson<{ data: string[] }>(res);
  return json.data;
}

export async function uploadMedia(
  params: UploadParams
): Promise<{ data: MediaItem; deduped?: boolean }> {
  const form = new FormData();
  form.append("file", params.file);
  if (params.websiteId != null)
    form.append("website_id", String(params.websiteId));
  if (params.folder) form.append("folder", params.folder);
  if (params.alt) form.append("alt", params.alt);
  if (params.title) form.append("title", params.title);

  const res = await fetch(PROXY_BASE, {
    method: "POST",
    body: form,
  });
  return asJson<{ data: MediaItem; deduped?: boolean }>(res);
}

export async function updateMedia(
  id: number,
  patch: UpdateMediaParams
): Promise<MediaItem> {
  const res = await fetch(`${PROXY_BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const json = await asJson<{ data: MediaItem }>(res);
  return json.data;
}

export async function deleteMedia(id: number): Promise<void> {
  const res = await fetch(`${PROXY_BASE}/${id}`, { method: "DELETE" });
  await asJson<{ data: null }>(res);
}

export async function bulkDeleteMedia(ids: number[]): Promise<number> {
  const res = await fetch(`${PROXY_BASE}/bulk-delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  const json = await asJson<{ data: { deleted: number } }>(res);
  return json.data.deleted;
}

// ── Display helpers ─────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

export function kindFromMime(mime: string): MediaKind {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (
    mime === "application/pdf" ||
    mime.startsWith("application/msword") ||
    mime.includes("officedocument") ||
    mime === "text/plain" ||
    mime === "text/csv"
  ) {
    return "document";
  }
  return "other";
}
