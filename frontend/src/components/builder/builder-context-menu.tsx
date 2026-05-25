"use client";

import { useEffect, useRef } from "react";
import {
  Clipboard,
  ClipboardPaste,
  Copy,
  CopyPlus,
  EyeOff,
  Eye,
  Trash2,
} from "lucide-react";
import { useBuilderStore } from "@/builder/store";
import type { ElementKind } from "@/engine/element/types";
import { cn } from "@/lib/utils";

export interface ContextMenuTarget {
  x: number;
  y: number;
  sectionId: string;
  elementId?: string;
  elementKind?: ElementKind;
}

interface Props {
  target: ContextMenuTarget;
  onClose: () => void;
}

/**
 * Floating right-click menu. Two modes depending on what was right-clicked:
 *
 *   • Element  → Copy style · Paste style · Show/Hide
 *   • Section  → Copy style · Paste style · Duplicate · Delete
 *
 * Paste is disabled when the clipboard scope/kind doesn't match the target.
 * Positions itself within the viewport (flips to top/left when near the
 * window edges).
 */
export function BuilderContextMenu({ target, onClose }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  const clipboard = useBuilderStore((s) => s.clipboard);
  const copyElementStyle = useBuilderStore((s) => s.copyElementStyle);
  const pasteElementStyle = useBuilderStore((s) => s.pasteElementStyle);
  const copySectionStyle = useBuilderStore((s) => s.copySectionStyle);
  const pasteSectionStyle = useBuilderStore((s) => s.pasteSectionStyle);
  const toggleElementHidden = useBuilderStore((s) => s.toggleElementHidden);
  const duplicateSection = useBuilderStore((s) => s.duplicateSection);
  const removeSection = useBuilderStore((s) => s.removeSection);
  const draft = useBuilderStore((s) => s.draft);

  const isElement = !!target.elementId;

  // Close on outside click / Escape / scroll
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onScroll = () => onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onClose);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onClose);
    };
  }, [onClose]);

  // Resolve current element style → drives the Show/Hide label
  const elementHidden = (() => {
    if (!target.elementId) return false;
    const section = draft.sections.find((s) => s.id === target.sectionId);
    return section?.elements?.[target.elementId]?.hidden === true;
  })();

  // Position: flip if too close to right/bottom edges
  const MENU_W = 220;
  const MENU_H = isElement ? 168 : 176;
  const margin = 8;
  const maxX =
    typeof window !== "undefined" ? window.innerWidth - MENU_W - margin : 9999;
  const maxY =
    typeof window !== "undefined" ? window.innerHeight - MENU_H - margin : 9999;
  const left = Math.min(Math.max(margin, target.x), maxX);
  const top = Math.min(Math.max(margin, target.y), maxY);

  // ── Actions ────────────────────────────────────────────────────────
  const doCopy = () => {
    if (isElement && target.elementId) {
      copyElementStyle(target.sectionId, target.elementId);
    } else {
      copySectionStyle(target.sectionId);
    }
    onClose();
  };

  const doPaste = () => {
    if (isElement && target.elementId && target.elementKind) {
      pasteElementStyle(target.sectionId, target.elementId, target.elementKind);
    } else if (!isElement) {
      pasteSectionStyle(target.sectionId);
    }
    onClose();
  };

  const doToggleHide = () => {
    if (target.elementId) {
      toggleElementHidden(target.sectionId, target.elementId);
    }
    onClose();
  };

  const doDuplicate = () => {
    duplicateSection(target.sectionId);
    onClose();
  };

  const doDelete = () => {
    if (confirm("Delete this section? You can undo right after.")) {
      removeSection(target.sectionId);
    }
    onClose();
  };

  // ── Paste enablement ────────────────────────────────────────────────
  const canPaste = (() => {
    if (!clipboard) return false;
    if (isElement) {
      return (
        clipboard.source.scope === "element" &&
        clipboard.source.kind === target.elementKind
      );
    }
    return clipboard.source.scope === "section";
  })();

  return (
    <div
      ref={ref}
      role="menu"
      className="fixed z-[100] w-[220px] overflow-hidden rounded-lg border border-border bg-surface py-1 text-sm shadow-elevated"
      style={{ left, top }}
    >
      <ContextHeader
        label={isElement ? "Element" : "Section"}
        subtitle={
          isElement
            ? target.elementId
            : target.sectionId.split("-")[0]
        }
      />

      <MenuItem icon={Copy} onClick={doCopy}>
        Copy style
      </MenuItem>
      <MenuItem icon={ClipboardPaste} onClick={doPaste} disabled={!canPaste}>
        Paste style
        {clipboard && !canPaste && (
          <span className="ms-auto text-[10px] text-muted-foreground">
            incompatible
          </span>
        )}
      </MenuItem>

      {isElement ? (
        <MenuItem
          icon={elementHidden ? Eye : EyeOff}
          onClick={doToggleHide}
        >
          {elementHidden ? "Show" : "Hide"}
        </MenuItem>
      ) : (
        <>
          <Divider />
          <MenuItem icon={CopyPlus} onClick={doDuplicate}>
            Duplicate section
            <Kbd>⌘D</Kbd>
          </MenuItem>
          <MenuItem icon={Trash2} onClick={doDelete} danger>
            Delete section
            <Kbd>Del</Kbd>
          </MenuItem>
        </>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────

function ContextHeader({
  label,
  subtitle,
}: {
  label: string;
  subtitle?: string;
}) {
  return (
    <div className="border-b border-border px-3 py-1.5">
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {subtitle && (
        <p
          dir="ltr"
          className="truncate font-mono text-[10px] text-foreground"
          title={subtitle}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  onClick,
  disabled,
  danger,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[12.5px] font-medium transition-colors",
        disabled
          ? "cursor-not-allowed text-muted-foreground/60"
          : danger
            ? "text-red-700 hover:bg-red-50"
            : "text-foreground hover:bg-muted/60"
      )}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          disabled
            ? "text-muted-foreground/60"
            : danger
              ? "text-red-600"
              : "text-foreground-soft"
        )}
      />
      {children}
    </button>
  );
}

function Divider() {
  return <div className="my-1 h-px bg-border" />;
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="ms-auto rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
      {children}
    </span>
  );
}
