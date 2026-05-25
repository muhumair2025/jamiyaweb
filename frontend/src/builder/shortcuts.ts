"use client";

import { useEffect } from "react";
import { useBuilderStore } from "./store";
import { useBuilderSave } from "./save";

/** Whether a key event happened inside an editable element. Used to skip
 *  shortcuts so the user can type Ctrl+A inside a text field without
 *  triggering anything. */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (target.isContentEditable) return true;
  return false;
}

/** Cross-platform modifier check — Cmd on macOS, Ctrl elsewhere. */
function modKey(e: KeyboardEvent): boolean {
  return e.metaKey || e.ctrlKey;
}

export interface ShortcutBindings {
  /** Open the shortcuts overlay modal. */
  toggleShortcutOverlay?: () => void;
  /** Open the preview in a new tab — caller supplies the URL builder. */
  openPreview?: () => void;
}

/**
 * Global builder keyboard shortcuts. Mount once at the shell level.
 *
 *   Ctrl/Cmd+Z         → undo
 *   Ctrl/Cmd+Shift+Z   → redo (also Ctrl+Y)
 *   Ctrl/Cmd+S         → save
 *   Ctrl/Cmd+D         → duplicate selected section
 *   Ctrl/Cmd+P         → preview (callback)
 *   Ctrl/Cmd+/         → toggle shortcut overlay
 *   Delete / Backspace → delete selected section (with confirm-via-undo)
 *
 * Shortcuts that collide with browser defaults (Cmd+S, Cmd+D, Cmd+P) call
 * preventDefault to take over.
 */
export function useBuilderShortcuts(bindings: ShortcutBindings = {}) {
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const canUndo = useBuilderStore((s) => s.canUndo());
  const canRedo = useBuilderStore((s) => s.canRedo());
  const selection = useBuilderStore((s) => s.selection);
  const duplicateSection = useBuilderStore((s) => s.duplicateSection);
  const removeSection = useBuilderStore((s) => s.removeSection);
  const { save } = useBuilderSave();

  const { toggleShortcutOverlay, openPreview } = bindings;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't hijack typing inside form fields
      if (isEditableTarget(e.target)) return;

      // Cmd/Ctrl + key combos
      if (modKey(e)) {
        const key = e.key.toLowerCase();

        // Undo / Redo
        if (key === "z" && !e.shiftKey) {
          e.preventDefault();
          if (canUndo) undo();
          return;
        }
        if ((key === "z" && e.shiftKey) || key === "y") {
          e.preventDefault();
          if (canRedo) redo();
          return;
        }

        // Save
        if (key === "s") {
          e.preventDefault();
          save();
          return;
        }

        // Duplicate selected section
        if (key === "d") {
          e.preventDefault();
          if (selection?.sectionId) {
            duplicateSection(selection.sectionId);
          }
          return;
        }

        // Preview
        if (key === "p") {
          e.preventDefault();
          openPreview?.();
          return;
        }

        // Shortcut overlay
        if (key === "/") {
          e.preventDefault();
          toggleShortcutOverlay?.();
          return;
        }
      }

      // Bare Delete/Backspace — only if a SECTION is selected (deleting an
      // element from the panel doesn't really exist; we'd hide it instead).
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selection?.kind === "section" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        if (
          confirm(
            "Delete this section? You can undo with Ctrl+Z right after."
          )
        ) {
          removeSection(selection.sectionId);
        }
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    canUndo,
    canRedo,
    undo,
    redo,
    save,
    selection,
    duplicateSection,
    removeSection,
    toggleShortcutOverlay,
    openPreview,
  ]);
}
