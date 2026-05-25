"use client";

import { useEffect } from "react";
import { Keyboard, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface ShortcutRow {
  label: string;
  keys: string[];
}

interface ShortcutGroup {
  title: string;
  items: ShortcutRow[];
}

/** Detects platform for the modifier glyph. SSR-safe — defaults to non-mac. */
function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

function modGlyph(): string {
  return isMac() ? "⌘" : "Ctrl";
}

/**
 * Cmd+/ overlay — a quick reference of every builder shortcut, grouped by
 * intent. Mostly a discoverability + onboarding aid, but power users keep
 * coming back to it once they've memorised them.
 */
export function ShortcutsOverlay({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const mod = modGlyph();
  const groups: ShortcutGroup[] = [
    {
      title: "Editing",
      items: [
        { label: "Undo", keys: [mod, "Z"] },
        { label: "Redo", keys: [mod, "Shift", "Z"] },
        { label: "Save", keys: [mod, "S"] },
        { label: "Duplicate selected section", keys: [mod, "D"] },
        { label: "Delete selected section", keys: ["Del"] },
      ],
    },
    {
      title: "Navigation",
      items: [
        { label: "Preview in new tab", keys: [mod, "P"] },
        { label: "Toggle shortcuts overlay", keys: [mod, "/"] },
        { label: "Close menus + modals", keys: ["Esc"] },
      ],
    },
    {
      title: "On any element (right-click)",
      items: [
        { label: "Copy style", keys: ["Right-click", "→", "Copy"] },
        { label: "Paste style", keys: ["Right-click", "→", "Paste"] },
        { label: "Hide / Show element", keys: ["Right-click", "→", "Hide"] },
      ],
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-background shadow-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-brand" />
            <h2
              id="shortcuts-title"
              className="text-sm font-semibold text-foreground"
            >
              Keyboard shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-2">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {group.title}
              </p>
              <ul className="space-y-1.5">
                {group.items.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-foreground">{row.label}</span>
                    <span className="flex items-center gap-1">
                      {row.keys.map((k, i) => (
                        <Kbd key={i}>{k}</Kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="border-t border-border bg-muted/30 px-5 py-2.5 text-[11px] text-muted-foreground">
          Tip: press{" "}
          <Kbd small>{mod}</Kbd>
          <Kbd small>/</Kbd> any time to reopen this list.
        </p>
      </div>
    </div>
  );
}

function Kbd({
  children,
  small,
}: {
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded border border-border bg-muted/50 font-mono font-semibold text-foreground shadow-soft",
        small
          ? "h-4 min-w-4 px-1 text-[10px]"
          : "h-5 min-w-5 px-1.5 text-[11px]"
      )}
    >
      {children}
    </span>
  );
}
