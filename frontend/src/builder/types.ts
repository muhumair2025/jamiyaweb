import type { PageContent, SectionInstance } from "@/engine/types";
import type { ElementKind } from "@/engine/element/types";

/**
 * Cross-frame postMessage protocol between the builder shell and the
 * preview iframe.
 *
 * Both frames live on the SAME origin (the preview is served from
 * /builder-preview/... on the dashboard host), so cookies flow naturally
 * — but every message still carries a `kind` discriminator and we always
 * post with explicit `targetOrigin: window.location.origin`.
 */

// ─── Selection (shared by store + messages) ──────────────────────
export type Selection =
  | null
  | { kind: "section"; sectionId: string }
  | {
      kind: "element";
      sectionId: string;
      elementId: string;
      /** Drives which controls the right panel shows. */
      elementKind: ElementKind;
    };

// ─── Messages ────────────────────────────────────────────────────
export type BuilderToPreviewMessage =
  | {
      kind: "UPDATE_PAGE";
      page: PageContent;
      selection: Selection;
    }
  | {
      kind: "SELECT";
      selection: Selection;
    };

export type PreviewToBuilderMessage =
  | { kind: "PREVIEW_READY" }
  | { kind: "SECTION_CLICK"; sectionId: string }
  | {
      kind: "ELEMENT_CLICK";
      sectionId: string;
      elementId: string;
      elementKind: ElementKind;
    };

export const BUILDER_MESSAGE_NAMESPACE = "jw-builder/v1";

/** Wrapper so we ignore foreign postMessage chatter (extensions, devtools, …). */
export interface NamespacedEnvelope<T> {
  ns: typeof BUILDER_MESSAGE_NAMESPACE;
  payload: T;
}

export function wrap<T>(payload: T): NamespacedEnvelope<T> {
  return { ns: BUILDER_MESSAGE_NAMESPACE, payload };
}

export function unwrap<T>(data: unknown): T | null {
  if (!data || typeof data !== "object") return null;
  const env = data as Partial<NamespacedEnvelope<T>>;
  if (env.ns !== BUILDER_MESSAGE_NAMESPACE) return null;
  return env.payload ?? null;
}

/** Shape used by the store for SectionInstance manipulation utilities. */
export type { PageContent, SectionInstance };
