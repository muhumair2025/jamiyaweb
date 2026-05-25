"use client";

import {
  createContext,
  useContext,
  useMemo,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { applyElementStyle, backgroundOverlayStyle } from "./apply";
import type { ElementKind, SectionElements } from "./types";

/**
 * Section-scoped context — the section's render path sets this up so every
 * <EngineElement /> inside knows which `elements` map to read from and
 * which one (if any) is currently selected in the builder.
 */
interface SectionElementContext {
  sectionId: string;
  elements: SectionElements;
  builderMode: boolean;
  /** Currently-selected element id inside this section. `null` otherwise. */
  selectedElementId?: string | null;
}

const Ctx = createContext<SectionElementContext | null>(null);

export function SectionElementProvider({
  sectionId,
  elements,
  builderMode,
  selectedElementId,
  children,
}: SectionElementContext & { children: ReactNode }) {
  const value = useMemo(
    () => ({ sectionId, elements, builderMode, selectedElementId }),
    [sectionId, elements, builderMode, selectedElementId]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function useElementContext(): SectionElementContext | null {
  return useContext(Ctx);
}

// ─────────────────────────────────────────────────────────────────
interface EngineElementProps {
  /** Stable id within the section. Same value as the editor's selection target. */
  el: string;
  /** Drives which style fields apply (filters via KIND_FIELDS). */
  kind: ElementKind;
  /** Underlying HTML tag — default `div`. Pick `span` / `h1` / `p` etc. */
  as?: ElementType;
  /** Extra static styles from the section component (merged below overrides). */
  style?: CSSProperties;
  className?: string;
  children: ReactNode;
}

/** Outline rendered around the currently-selected element in the builder iframe. */
const SELECTED_OUTLINE = "2px solid #20665c";  // brand teal
/** Faint outline on hover (only inside builder iframe). */
const HOVER_OUTLINE_CLASS = "jw-builder-hover";

/**
 * Wraps a single editable part of a section. In normal render, applies the
 * stored element-level style overrides. In builder mode, also adds the
 * data attributes + click handler the iframe uses to highlight + select.
 */
export function EngineElement({
  el,
  kind,
  as: Tag = "div",
  style: extraStyle,
  className,
  children,
}: EngineElementProps) {
  const ctx = useElementContext();
  const override = ctx?.elements?.[el];
  const builderMode = ctx?.builderMode ?? false;
  const isSelected = builderMode && ctx?.selectedElementId === el;

  // Apply element style overrides FIRST, then merge the section component's
  // base style on top — but skip merging anything the override already set.
  const overrideStyle = useMemo(
    () => applyElementStyle(override, kind),
    [override, kind]
  );

  const finalStyle = useMemo(() => {
    const merged: CSSProperties = { ...extraStyle, ...overrideStyle };
    // Background kind needs a positioning context so the overlay child
    // (and the section's other absolute children) can pin to it. Don't
    // override if the section author already set position explicitly.
    if (kind === "background" && !merged.position) {
      merged.position = "relative";
    }
    if (isSelected) {
      merged.outline = SELECTED_OUTLINE;
      merged.outlineOffset = "2px";
    }
    return merged;
  }, [extraStyle, overrideStyle, isSelected, kind]);

  // Overlay layer for background kind — paints between the wrapper's
  // background image/colour and the section content.
  const overlayStyle = useMemo(
    () => (kind === "background" ? backgroundOverlayStyle(override) : null),
    [kind, override]
  );

  // Builder-only data attributes — picked up by the iframe click handler
  // and the outline CSS selector.
  const dataAttrs = builderMode
    ? {
        "data-jw-element": el,
        "data-jw-element-kind": kind,
        "data-jw-element-selected": isSelected ? "true" : undefined,
      }
    : undefined;

  const finalClassName = builderMode
    ? `${HOVER_OUTLINE_CLASS}${className ? " " + className : ""}`
    : className;

  const Component = Tag;

  // When an overlay is in play, wrap children so they sit above it. The
  // overlay is z-index 1 (set in apply.ts); content gets z-index 2.
  const renderChildren = overlayStyle ? (
    <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
  ) : (
    children
  );

  return (
    <Component
      {...dataAttrs}
      className={finalClassName}
      style={finalStyle}
    >
      {overlayStyle && <div aria-hidden style={overlayStyle} />}
      {renderChildren}
    </Component>
  );
}
