"use client";

import { create } from "zustand";
import type { PageContent, SectionInstance } from "@/engine/types";
import type { SectionStyle } from "@/engine/style/types";
import type { ElementKind, ElementStyle } from "@/engine/element/types";
import type { Selection } from "./types";

interface PageMeta {
  websiteId: number;
  pageSlug: string;
  pageTitle: string;
  subdomain: string;
}

interface BuilderState {
  // ─── Loaded data ───────────────────────────────
  meta: PageMeta | null;
  /** Last-saved snapshot — used to compute `isDirty`. */
  pristine: PageContent;
  /** Current editable state — what the form panel + preview see. */
  draft: PageContent;
  /**
   * What the user has currently selected — either a whole section, a specific
   * element inside a section, or nothing. Drives the form panel + iframe
   * highlight.
   */
  selection: Selection;

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
  return {
    sections: p.sections.map((s) => ({
      id: s.id,
      type: s.type,
      settings: { ...s.settings },
      ...(s.style ? { style: { ...s.style } } : {}),
      ...(s.elements
        ? {
            elements: Object.fromEntries(
              Object.entries(s.elements).map(([k, v]) => [k, { ...v }])
            ),
          }
        : {}),
    })),
  };
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

export const useBuilderStore = create<BuilderState>((set, get) => ({
  meta: null,
  pristine: EMPTY_PAGE,
  draft: EMPTY_PAGE,
  selection: null,
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
