"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import type { PageContent } from "@/engine/types";

interface SaveResult {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

interface PublishResult {
  ok: boolean;
  message?: string;
  status?: "draft" | "published";
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

/**
 * Flip a website to `published` or `draft`. Invalidates the dashboard cache
 * so the status badge updates immediately on redirect/refresh.
 */
export async function setPublishStatusAction(
  websiteId: number,
  publish: boolean,
  locale: string = "en"
): Promise<PublishResult> {
  const path = publish
    ? `/api/websites/${websiteId}/publish`
    : `/api/websites/${websiteId}/unpublish`;

  try {
    const res = await apiFetch<{ data: { status: "draft" | "published" } }>(
      path,
      { method: "POST" }
    );
    // Bust cached dashboard reads
    revalidatePath(`/${locale}/dashboard`);
    return { ok: true, status: res.data.status };
  } catch (e) {
    const err = e as { message?: string };
    return {
      ok: false,
      message: err.message ?? (publish ? "Publish failed." : "Unpublish failed."),
    };
  }
}
