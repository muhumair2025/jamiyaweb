"use client";

import { create } from "zustand";
import type { PageContent, SectionInstance } from "@/engine/types";

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
  /** Currently focused section instance (drives form panel + preview highlight). */
  selectedSectionId: string | null;

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

  // ─── Editing ───────────────────────────────────
  selectSection: (id: string | null) => void;
  updateSettings: (
    id: string,
    settings: Record<string, unknown>
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
  selectedSectionId: null,
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
      selectedSectionId: initial.sections[0]?.id ?? null,
      past: [],
      future: [],
      saving: false,
      saveError: null,
    }),

  selectSection: (id) => set({ selectedSectionId: id }),

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
        selectedSectionId: section.id,
      };
    }),

  removeSection: (id) =>
    set((state) => {
      const idx = state.draft.sections.findIndex((s) => s.id === id);
      if (idx === -1) return state;
      const sections = state.draft.sections.filter((s) => s.id !== id);
      const nextSelected =
        state.selectedSectionId === id
          ? sections[Math.max(0, idx - 1)]?.id ?? null
          : state.selectedSectionId;
      return {
        past: pushHistory(state.past, state.draft),
        future: [],
        draft: { sections },
        selectedSectionId: nextSelected,
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
