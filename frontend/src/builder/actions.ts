"use server";

import { apiFetch } from "@/lib/api";
import type { PageContent } from "@/engine/types";

interface SaveResult {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Persist the current draft to the backend. Returns a flat success/failure
 * shape so the builder UI can show toast / error messages without unpacking
 * a thrown error in the client.
 */
export async function savePageAction(
  websiteId: number,
  pageSlug: string,
  content: PageContent
): Promise<SaveResult> {
  try {
    await apiFetch(`/api/websites/${websiteId}/pages/${pageSlug}`, {
      method: "PATCH",
      body: { content_json: content },
    });
    return { ok: true };
  } catch (e) {
    const err = e as {
      message?: string;
      errors?: Record<string, string[]>;
    };
    return {
      ok: false,
      message: err.message ?? "Save failed.",
      errors: err.errors,
    };
  }
}
