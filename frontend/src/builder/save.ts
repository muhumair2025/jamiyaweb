"use client";

import { useCallback, useTransition } from "react";
import { useBuilderStore } from "./store";
import { savePageAction } from "./actions";

/**
 * Shared save hook — wraps the topbar's existing save flow so the keyboard
 * shortcut (Ctrl/Cmd+S) and the topbar Save button stay in sync. Returns a
 * stable `save` callback + a `busy` flag and `disabled` flag so callers can
 * mirror button state.
 */
export function useBuilderSave() {
  const meta = useBuilderStore((s) => s.meta);
  const draft = useBuilderStore((s) => s.draft);
  const isDirty = useBuilderStore((s) => s.isDirty());
  const saving = useBuilderStore((s) => s.saving);
  const beginSave = useBuilderStore((s) => s.beginSave);
  const finishSave = useBuilderStore((s) => s.finishSave);
  const failSave = useBuilderStore((s) => s.failSave);

  const [pending, startTransition] = useTransition();
  const busy = saving || pending;

  const save = useCallback(() => {
    if (!meta || busy || !isDirty) return;
    beginSave();
    startTransition(async () => {
      const result = await savePageAction(
        meta.websiteId,
        meta.pageSlug,
        draft
      );
      if (result.ok) finishSave(draft);
      else failSave(result.message ?? "Save failed");
    });
  }, [meta, busy, isDirty, draft, beginSave, finishSave, failSave]);

  return { save, busy, disabled: !isDirty || busy, isDirty };
}
