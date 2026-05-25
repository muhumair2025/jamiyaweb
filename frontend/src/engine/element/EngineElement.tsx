"use client";

import {
  createContext,
  useContext,
  useMemo,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import {
  applyElementStyle,
  backgroundOverlayStyle,
  elementResponsiveCss,
} from "./apply";
import type {
  DeviceBreakpoint,
  ElementKind,
  SectionElements,
} from "./types";

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
  /**
   * Active device — drives the responsive style merge inside this section.
   * Only meaningful in builder mode; on the public site the rendered CSS
   * itself carries the media queries.
   */
  device?: DeviceBreakpoint;
}

const Ctx = createContext<SectionElementContext | null>(null);

export function SectionElementProvider({
  sectionId,
  elements,
  builderMode,
  selectedElementId,
  device,
  children,
}: SectionElementContext & { children: ReactNode }) {
  const value = useMemo(
    () => ({ sectionId, elements, builderMode, selectedElementId, device }),
    [sectionId, elements, builderMode, selectedElementId, device]
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
  const device = ctx?.device ?? "desktop";

  // Apply element style overrides FIRST, then merge the section component's
  // base style on top — but skip merging anything the override already set.
  // The device-aware merge cascades desktop → tablet → mobile in builder mode.
  const overrideStyle = useMemo(
    () => applyElementStyle(override, kind, device),
    [override, kind, device]
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
  // background image/colour and the section content. Uses the merged
  // device style so per-device overlay tweaks work too.
  const overlayStyle = useMemo(() => {
    if (kind !== "background" || !override) return null;
    // Build a synthetic ElementStyle carrying just overlay_* for the active
    // device, then read it back.
    const merged = {
      overlay_color: override.overlay_color,
      overlay_opacity: override.overlay_opacity,
      ...(device !== "desktop" && override.tablet
        ? {
            overlay_color: override.tablet.overlay_color ?? override.overlay_color,
            overlay_opacity:
              override.tablet.overlay_opacity ?? override.overlay_opacity,
          }
        : {}),
      ...(device === "mobile" && override.mobile
        ? {
            overlay_color:
              override.mobile.overlay_color ??
              override.tablet?.overlay_color ??
              override.overlay_color,
            overlay_opacity:
              override.mobile.overlay_opacity ??
              override.tablet?.overlay_opacity ??
              override.overlay_opacity,
          }
        : {}),
    };
    return backgroundOverlayStyle(merged);
  }, [kind, override, device]);

  // Stable id so the responsive CSS rule can target this exact element on
  // the public site without colliding with siblings.
  const sectionId = ctx?.sectionId ?? "";
  const eid = `${sectionId}-${el}`;

  // Responsive CSS — only emitted on the public site. In builder mode the
  // device toggle already drives inline-style merge, so emitting media
  // queries would double-up and confuse the simulated viewport.
  const responsiveCss = useMemo(() => {
    if (builderMode || !override) return "";
    if (!override.tablet && !override.mobile) return "";
    const { cssText } = elementResponsiveCss(
      override,
      kind,
      `[data-jw-eid="${eid}"]`
    );
    return cssText;
  }, [builderMode, override, kind, eid]);

  // Builder-only data attributes — picked up by the iframe click handler
  // and the outline CSS selector.
  const dataAttrs = builderMode
    ? {
        "data-jw-element": el,
        "data-jw-element-kind": kind,
        "data-jw-element-selected": isSelected ? "true" : undefined,
      }
    : responsiveCss
      ? { "data-jw-eid": eid }
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
      {responsiveCss && (
        <style dangerouslySetInnerHTML={{ __html: responsiveCss }} />
      )}
      {overlayStyle && <div aria-hidden style={overlayStyle} />}
      {renderChildren}
    </Component>
  );
}
