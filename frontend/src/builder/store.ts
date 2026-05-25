"use client";

import { create } from "zustand";
import type { PageContent, SectionInstance } from "@/engine/types";
import type { SectionStyle } from "@/engine/style/types";
import type {
  DeviceBreakpoint,
  ElementKind,
  ElementStyle,
} from "@/engine/element/types";
import type { Selection } from "./types";

interface PageMeta {
  websiteId: number;
  pageSlug: string;
  pageTitle: string;
  subdomain: string;
}

/** What lives on the "style clipboard" between a Copy and a Paste action.
 *  Carries the element kind so the paste can refuse to apply across kinds
 *  (a button's styles applied to a heading would mostly be junk). */
export interface StyleClipboard {
  source:
    | { scope: "element"; kind: ElementKind; style: ElementStyle }
    | { scope: "section"; style: SectionStyle };
  /** Origin sectionId / elementId — purely informational, surfaced in UI. */
  fromSectionId: string;
  fromElementId?: string;
}

interface BuilderState {
  // ─── Loaded data ───────────────────────────────
  meta: PageMeta | null;
  /** Last-saved snapshot — used to compute `isDirty`. */
  pristine: PageContent;
  /** Current editable state — what the form panel + preview see. */
  draft: PageContent;
  /** In-memory style clipboard (lives only for the session). */
  clipboard: StyleClipboard | null;
  /**
   * What the user has currently selected — either a whole section, a specific
   * element inside a section, or nothing. Drives the form panel + iframe
   * highlight.
   */
  selection: Selection;

  /**
   * Active device the user is editing for. Edits made in `tablet` or `mobile`
   * are stored under `style.tablet` / `style.mobile` of the affected element
   * (desktop-first cascade — see ResponsiveOverride). Drives the iframe width
   * + which slot the element panel writes to.
   */
  device: DeviceBreakpoint;

  // ─── History ───────────────────────────────────
  past: PageContent[];
  future: PageContent[];

  // ─── Save lifecycle ────────────────────────────
  saving: boolean;
  saveError: string | null;

  // ─── Computed flags (kept as a method to avoid stale-closure subtleties) ──
  isDirty: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // ─── Hydration ─────────────────────────────────
  hydrate: (meta: PageMeta, initial: PageContent) => void;

  // ─── Device toggle ─────────────────────────────
  setDevice: (device: DeviceBreakpoint) => void;

  // ─── Selection ────────────────────────────────
  selectSection: (id: string | null) => void;
  selectElement: (
    sectionId: string,
    elementId: string,
    elementKind: ElementKind
  ) => void;
  clearSelection: () => void;

  // ─── Editing ───────────────────────────────────
  updateSettings: (
    id: string,
    settings: Record<string, unknown>
  ) => void;
  updateSectionStyle: (id: string, style: SectionStyle) => void;
  updateElementStyle: (
    sectionId: string,
    elementId: string,
    style: ElementStyle
  ) => void;
  reorderSections: (orderedIds: string[]) => void;
  addSection: (section: SectionInstance, atIndex?: number) => void;
  removeSection: (id: string) => void;
  /** Clone a section in place (right after the original). Picks a fresh id. */
  duplicateSection: (id: string) => void;
  /** Toggle `hidden: true` on an element's style (right-click → Hide). */
  toggleElementHidden: (sectionId: string, elementId: string) => void;

  // ─── Clipboard ─────────────────────────────────
  copyElementStyle: (sectionId: string, elementId: string) => void;
  pasteElementStyle: (
    sectionId: string,
    elementId: string,
    elementKind: ElementKind
  ) => void;
  copySectionStyle: (sectionId: string) => void;
  pasteSectionStyle: (sectionId: string) => void;
  clearClipboard: () => void;

  // ─── History actions ───────────────────────────
  undo: () => void;
  redo: () => void;

  // ─── Save ──────────────────────────────────────
  beginSave: () => void;
  finishSave: (next?: PageContent) => void;
  failSave: (msg: string) => void;
}

const EMPTY_PAGE: PageContent = { sections: [] };
const MAX_HISTORY = 50;

function clonePage(p: PageContent): PageContent {
  // Deep clone — element styles can now hold nested `tablet`/`mobile`
  // override objects (responsive cascade), so a shallow spread leaves the
  // history sharing references with the live draft. JSON round-trip is
  // fine: PageContent is strictly JSON-serialisable by design.
  return JSON.parse(JSON.stringify(p)) as PageContent;
}

function pageEquals(a: PageContent, b: PageContent): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Push the *previous* draft onto `past` and clear `future`.
 * Caps history at MAX_HISTORY to keep memory bounded.
 */
function pushHistory(
  past: PageContent[],
  prev: PageContent
): PageContent[] {
  const next = [...past, clonePage(prev)];
  return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
}

/** Generate a stable-enough section id. Doesn't need to be cryptographic;
 *  collisions within a single page are vanishingly unlikely. */
function newSectionId(base: string): string {
  const rand = Math.random().toString(36).slice(2, 9);
  return `${base}-${rand}`;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  meta: null,
  pristine: EMPTY_PAGE,
  draft: EMPTY_PAGE,
  selection: null,
  device: "desktop",
  clipboard: null,
  past: [],
  future: [],
  saving: false,
  saveError: null,

  isDirty: () => !pageEquals(get().pristine, get().draft),
  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  hydrate: (meta, initial) =>
    set({
      meta,
      pristine: clonePage(initial),
      draft: clonePage(initial),
      selection: initial.sections[0]
        ? { kind: "section", sectionId: initial.sections[0].id }
        : null,
      past: [],
      future: [],
      saving: false,
      saveError: null,
    }),

  setDevice: (device) => set({ device }),

  selectSection: (id) =>
    set({
      selection: id === null ? null : { kind: "section", sectionId: id },
    }),

  selectElement: (sectionId, elementId, elementKind) =>
    set({
      selection: { kind: "element", sectionId, elementId, elementKind },
    }),

  clearSelection: () => set({ selection: null }),

  updateSettings: (id, settings) =>
    set((state) => {
      const idx = state.draft.sections.findIndex((s) => s.id === id);
      if (idx === -1) return state;
      const next: PageContent = {
        sections: state.draft.sections.map((s, i) =>
          i === idx ? { ...s, settings: { ...s.settings, ...settings } } : s
        ),
      };
      return {
        past: pushHistory(state.past, state.draft),
        future: [],
        draft: next,
      };
    }),

  /**
   * Replace a section's style payload. Strips empty/undefined keys so the
   * persisted JSON stays small and clean.
   */
  updateSectionStyle: (id, style) =>
    set((state) => {
      const idx = state.draft.sections.findIndex((s) => s.id === id);
      if (idx === -1) return state;

      // Drop empty values
      const cleaned: SectionStyle = {};
      for (const [k, v] of Object.entries(style)) {
        if (v !== undefined && v !== null && v !== "") {
          (cleaned as Record<string, unknown>)[k] = v;
        }
      }

      const hasAny = Object.keys(cleaned).length > 0;

      const next: PageContent = {
        sections: state.draft.sections.map((s, i) => {
          if (i !== idx) return s;
          const base: SectionInstance = {
            id: s.id,
            type: s.type,
            settings: s.settings,
            ...(s.elements ? { elements: s.elements } : {}),
          };
          return hasAny ? { ...base, style: cleaned } : base;
        }),
      };

      if (pageEquals(next, state.draft)) return state;
      return {
        past: pushHistory(state.past, state.draft),
        future: [],
        draft: next,
      };
    }),

  /**
   * Replace the style overrides for a single element inside a section.
   * Strips empty values; deletes the element key if the cleaned style is
   * empty; deletes the whole `elements` map if no elements remain.
   */
  updateElementStyle: (sectionId, elementId, style) =>
    set((state) => {
      const idx = state.draft.sections.findIndex((s) => s.id === sectionId);
      if (idx === -1) return state;

      const cleaned: ElementStyle = {};
      for (const [k, v] of Object.entries(style)) {
        if (v !== undefined && v !== null && v !== "") {
          (cleaned as Record<string, unknown>)[k] = v;
        }
      }
      const hasAny = Object.keys(cleaned).length > 0;

      const next: PageContent = {
        sections: state.draft.sections.map((s, i) => {
          if (i !== idx) return s;
          const elements = { ...(s.elements ?? {}) };
          if (hasAny) {
            elements[elementId] = cleaned;
          } else {
            delete elements[elementId];
          }
          const hasAnyElements = Object.keys(elements).length > 0;
          const base: SectionInstance = {
            id: s.id,
            type: s.type,
            settings: s.settings,
            ...(s.style ? { style: s.style } : {}),
          };
          return hasAnyElements ? { ...base, elements } : base;
        }),
      };

      if (pageEquals(next, state.draft)) return state;
      return {
        past: pushHistory(state.past, state.draft),
        future: [],
        draft: next,
      };
    }),

  reorderSections: (orderedIds) =>
    set((state) => {
      const map = new Map(state.draft.sections.map((s) => [s.id, s]));
      const next: PageContent = {
        sections: orderedIds
          .map((id) => map.get(id))
          .filter((s): s is SectionInstance => Boolean(s)),
      };
      // Skip history push if no actual change
      if (pageEquals(next, state.draft)) return state;
      return {
        past: pushHistory(state.past, state.draft),
        future: [],
        draft: next,
      };
    }),

  addSection: (section, atIndex) =>
    set((state) => {
      const sections = [...state.draft.sections];
      const insertAt =
        atIndex !== undefined && atIndex >= 0 && atIndex <= sections.length
          ? atIndex
          : sections.length;
      sections.splice(insertAt, 0, section);
      return {
        past: pushHistory(state.past, state.draft),
        future: [],
        draft: { sections },
        selection: { kind: "section", sectionId: section.id },
      };
    }),

  removeSection: (id) =>
    set((state) => {
      const idx = state.draft.sections.findIndex((s) => s.id === id);
      if (idx === -1) return state;
      const sections = state.draft.sections.filter((s) => s.id !== id);

      // If we deleted the currently-selected section (or an element inside it),
      // pick the previous section as the new selection (or null if none left).
      const selectionPointsAtRemoved =
        state.selection?.sectionId === id;
      const nextSelection: Selection = selectionPointsAtRemoved
        ? sections[Math.max(0, idx - 1)]
          ? { kind: "section", sectionId: sections[Math.max(0, idx - 1)].id }
          : null
        : state.selection;

      return {
        past: pushHistory(state.past, state.draft),
        future: [],
        draft: { sections },
        selection: nextSelection,
      };
    }),

  duplicateSection: (id) =>
    set((state) => {
      const idx = state.draft.sections.findIndex((s) => s.id === id);
      if (idx === -1) return state;
      const original = state.draft.sections[idx];
      const clone: SectionInstance = JSON.parse(JSON.stringify(original));
      clone.id = newSectionId(original.type);

      const sections = [...state.draft.sections];
      sections.splice(idx + 1, 0, clone);
      return {
        past: pushHistory(state.past, state.draft),
        future: [],
        draft: { sections },
        selection: { kind: "section", sectionId: clone.id },
      };
    }),

  toggleElementHidden: (sectionId, elementId) =>
    set((state) => {
      const idx = state.draft.sections.findIndex((s) => s.id === sectionId);
      if (idx === -1) return state;
      const section = state.draft.sections[idx];
      const elements = { ...(section.elements ?? {}) };
      const prev = elements[elementId] ?? {};
      const nextHidden = !prev.hidden;
      const merged: ElementStyle = { ...prev, hidden: nextHidden };
      // If we just turned hidden off and no other keys remain, drop the entry
      if (!nextHidden) {
        delete merged.hidden;
      }
      const hasAnyKey = Object.keys(merged).length > 0;
      if (hasAnyKey) {
        elements[elementId] = merged;
      } else {
        delete elements[elementId];
      }
      const hasAnyEls = Object.keys(elements).length > 0;
      const updated: SectionInstance = {
        id: section.id,
        type: section.type,
        settings: section.settings,
        ...(section.style ? { style: section.style } : {}),
        ...(hasAnyEls ? { elements } : {}),
      };
      const next: PageContent = {
        sections: state.draft.sections.map((s, i) => (i === idx ? updated : s)),
      };
      return {
        past: pushHistory(state.past, state.draft),
        future: [],
        draft: next,
      };
    }),

  // ─── Clipboard ─────────────────────────────────
  copyElementStyle: (sectionId, elementId) =>
    set((state) => {
      const section = state.draft.sections.find((s) => s.id === sectionId);
      if (!section) return state;
      const style = section.elements?.[elementId];
      if (!style) return state;
      // The element kind isn't stored in `elements` — caller (the click
      // handler) gives it to us via the current selection. Read from there.
      const sel = state.selection;
      const kind =
        sel?.kind === "element" &&
        sel.sectionId === sectionId &&
        sel.elementId === elementId
          ? sel.elementKind
          : null;
      if (!kind) return state;
      return {
        clipboard: {
          source: { scope: "element", kind, style: JSON.parse(JSON.stringify(style)) },
          fromSectionId: sectionId,
          fromElementId: elementId,
        },
      };
    }),

  pasteElementStyle: (sectionId, elementId, elementKind) =>
    set((state) => {
      const clip = state.clipboard;
      if (!clip || clip.source.scope !== "element") return state;
      // Refuse to paste across incompatible kinds — a button → heading
      // paste would mostly be irrelevant junk fields.
      if (clip.source.kind !== elementKind) return state;

      const idx = state.draft.sections.findIndex((s) => s.id === sectionId);
      if (idx === -1) return state;
      const section = state.draft.sections[idx];
      const elements = { ...(section.elements ?? {}) };
      elements[elementId] = JSON.parse(JSON.stringify(clip.source.style));
      const updated: SectionInstance = {
        id: section.id,
        type: section.type,
        settings: section.settings,
        ...(section.style ? { style: section.style } : {}),
        elements,
      };
      const next: PageContent = {
        sections: state.draft.sections.map((s, i) => (i === idx ? updated : s)),
      };
      return {
        past: pushHistory(state.past, state.draft),
        future: [],
        draft: next,
      };
    }),

  copySectionStyle: (sectionId) =>
    set((state) => {
      const section = state.draft.sections.find((s) => s.id === sectionId);
      if (!section?.style) return state;
      return {
        clipboard: {
          source: {
            scope: "section",
            style: JSON.parse(JSON.stringify(section.style)),
          },
          fromSectionId: sectionId,
        },
      };
    }),

  pasteSectionStyle: (sectionId) =>
    set((state) => {
      const clip = state.clipboard;
      if (!clip || clip.source.scope !== "section") return state;
      const idx = state.draft.sections.findIndex((s) => s.id === sectionId);
      if (idx === -1) return state;
      const section = state.draft.sections[idx];
      const updated: SectionInstance = {
        id: section.id,
        type: section.type,
        settings: section.settings,
        style: JSON.parse(JSON.stringify(clip.source.style)),
        ...(section.elements ? { elements: section.elements } : {}),
      };
      const next: PageContent = {
        sections: state.draft.sections.map((s, i) => (i === idx ? updated : s)),
      };
      return {
        past: pushHistory(state.past, state.draft),
        future: [],
        draft: next,
      };
    }),

  clearClipboard: () => set({ clipboard: null }),

  undo: () =>
    set((state) => {
      const last = state.past[state.past.length - 1];
      if (!last) return state;
      return {
        past: state.past.slice(0, -1),
        future: [clonePage(state.draft), ...state.future],
        draft: clonePage(last),
      };
    }),

  redo: () =>
    set((state) => {
      const next = state.future[0];
      if (!next) return state;
      return {
        past: [...state.past, clonePage(state.draft)],
        future: state.future.slice(1),
        draft: clonePage(next),
      };
    }),

  beginSave: () => set({ saving: true, saveError: null }),
  finishSave: (next) =>
    set((state) => ({
      saving: false,
      saveError: null,
      pristine: clonePage(next ?? state.draft),
    })),
  failSave: (msg) => set({ saving: false, saveError: msg }),
}));
