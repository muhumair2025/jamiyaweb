import type { CSSProperties } from "react";
import {
  KIND_FIELDS,
  SHADOW_PRESETS,
  type ElementKind,
  type ElementStyle,
} from "./types";

/**
 * Build the React `style` object for a single element wrapper based on its
 * `kind`. Fields not relevant to the kind (e.g. `bg_image` on a heading) are
 * silently ignored — so the same ElementStyle schema serves all kinds.
 */
export function applyElementStyle(
  style: ElementStyle | undefined | null,
  kind: ElementKind
): CSSProperties {
  if (!style) return {};

  const allowed = new Set<string>(KIND_FIELDS[kind]);
  const out: Record<string, string | number> = {};

  // Visibility (universal)
  if (allowed.has("hidden") && style.hidden) {
    out.display = "none";
    return out as CSSProperties;
  }

  // ── Typography (text/heading/button) ──
  if (allowed.has("color") && style.color) out.color = style.color;
  if (allowed.has("font_size") && style.font_size) out.fontSize = style.font_size;
  if (allowed.has("font_weight") && style.font_weight)
    out.fontWeight = style.font_weight;
  if (allowed.has("line_height") && style.line_height)
    out.lineHeight = style.line_height;
  if (allowed.has("letter_spacing") && style.letter_spacing)
    out.letterSpacing = style.letter_spacing;
  if (allowed.has("text_align") && style.text_align)
    out.textAlign = style.text_align;
  if (allowed.has("text_transform") && style.text_transform)
    out.textTransform = style.text_transform;
  if (allowed.has("font_family") && style.font_family)
    out.fontFamily = style.font_family;

  // ── Box / button extras ──
  if (allowed.has("bg_color") && style.bg_color) out.background = style.bg_color;
  if (allowed.has("padding_x") && style.padding_x) {
    out.paddingLeft = style.padding_x;
    out.paddingRight = style.padding_x;
  }
  if (allowed.has("padding_y") && style.padding_y) {
    out.paddingTop = style.padding_y;
    out.paddingBottom = style.padding_y;
  }
  if (allowed.has("border_radius") && style.border_radius)
    out.borderRadius = style.border_radius;
  if (allowed.has("border_width") && style.border_width) {
    out.borderWidth = style.border_width;
    out.borderStyle = "solid";
  }
  if (allowed.has("border_color") && style.border_color)
    out.borderColor = style.border_color;
  if (allowed.has("shadow") && style.shadow)
    out.boxShadow = SHADOW_PRESETS[style.shadow];

  // ── Image ──
  if (allowed.has("width") && style.width) out.width = style.width;
  if (allowed.has("height") && style.height) out.height = style.height;
  if (allowed.has("object_fit") && style.object_fit)
    out.objectFit = style.object_fit;
  if (allowed.has("opacity") && style.opacity !== undefined)
    out.opacity = style.opacity;

  // ── Icon: `size` becomes both width and height ──
  if (allowed.has("size") && style.size) {
    out.width = style.size;
    out.height = style.size;
    // For SVGs that use currentColor, apply the icon's colour here too
    if (style.color && allowed.has("color")) out.color = style.color;
  }

  // ── Container ──
  if (allowed.has("max_width") && style.max_width)
    out.maxWidth = style.max_width;
  if (allowed.has("gap") && style.gap) out.gap = style.gap;

  // ── Background (section) ──
  if (allowed.has("bg_image") && style.bg_image) {
    out.backgroundImage = `url("${style.bg_image}")`;
    out.backgroundRepeat = "no-repeat";
  }
  if (allowed.has("bg_position") && style.bg_position)
    out.backgroundPosition = style.bg_position;
  if (allowed.has("bg_size") && style.bg_size) out.backgroundSize = style.bg_size;

  // ── Spacing (universal) ──
  if (allowed.has("margin_top") && style.margin_top)
    out.marginTop = style.margin_top;
  if (allowed.has("margin_bottom") && style.margin_bottom)
    out.marginBottom = style.margin_bottom;

  // ── Self-alignment within parent flex/grid container ──
  if (allowed.has("align_self") && style.align_self) {
    if (style.align_self !== "auto") {
      // CSS aligns names: start/center/end/stretch
      out.alignSelf = style.align_self;
      // For non-flex parents, also center horizontally when the user
      // picks center on a block element — matches Elementor behaviour.
      if (style.align_self === "center") {
        out.marginLeft = "auto";
        out.marginRight = "auto";
      } else if (style.align_self === "end") {
        out.marginLeft = "auto";
      } else if (style.align_self === "start") {
        out.marginRight = "auto";
      }
    }
  }

  return out as CSSProperties;
}

/**
 * Background overlay needs an absolute child div, not a style prop on the
 * wrapper. Helper returns null when there's no overlay configured.
 *
 * z-index 1 puts the overlay above the wrapper's background-image/colour
 * but below the section's content (which we wrap in a z-index 2 layer).
 */
export function backgroundOverlayStyle(
  style: ElementStyle | undefined | null
): CSSProperties | null {
  if (!style?.overlay_color) return null;
  return {
    position: "absolute",
    inset: 0,
    background: style.overlay_color,
    opacity: style.overlay_opacity ?? 0.5,
    pointerEvents: "none",
    zIndex: 1,
  };
}
