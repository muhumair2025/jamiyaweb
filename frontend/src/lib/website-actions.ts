"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, type ApiError } from "./api";
import type { WebsiteDto } from "./websites";

interface UpdateResult {
  ok: boolean;
  data?: WebsiteDto;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface WebsiteUpdatePayload {
  site_name?: string;
  tagline?: string | null;
  theme_id?: number | null;
  tokens?: Record<string, string> | null;
  logo_path?: string | null;
  favicon_path?: string | null;
}

/**
 * PATCH /api/websites/{id}. Used by the Theme dashboard pages to update
 * tokens (colors/fonts), switch themes, and set logo/favicon.
 *
 * Revalidates /dashboard so the sidebar context card updates after a save.
 */
export async function updateWebsiteAction(
  websiteId: number,
  patch: WebsiteUpdatePayload
): Promise<UpdateResult> {
  try {
    const res = await apiFetch<{ data: WebsiteDto }>(
      `/api/websites/${websiteId}`,
      { method: "PATCH", body: patch }
    );
    revalidatePath("/", "layout");
    return { ok: true, data: res.data };
  } catch (e) {
    const err = e as ApiError;
    return {
      ok: false,
      message: err.message,
      errors: err.errors,
    };
  }
}
