import type { CSSProperties } from "react";
import {
  BODY_SCALES,
  HEADING_SCALES,
  MAX_WIDTHS,
  STYLE_CSS_VARS,
  type SectionStyle,
} from "./types";

/**
 * Build a React `style` object for the section's outer wrapper.
 * Combines spacing/background props with CSS vars that section components
 * consume (text colour, heading colour, type scale).
 *
 * Inline styles win over the theme's defaults but lose to the section's
 * !important rules — which we deliberately don't use anywhere.
 */
export function applySectionStyle(
  style: SectionStyle | undefined | null
): CSSProperties {
  if (!style) return {};

  const out: Record<string, string | number> = {};

  // ── Wrapper-level visual props ──
  if (style.padding_top) out.paddingTop = style.padding_top;
  if (style.padding_bottom) out.paddingBottom = style.padding_bottom;
  if (style.padding_x) {
    out.paddingLeft = style.padding_x;
    out.paddingRight = style.padding_x;
  }
  if (style.bg_color) out.background = style.bg_color;
  if (style.text_color) out.color = style.text_color;
  if (style.align) out.textAlign = style.align;
  if (style.radius) out.borderRadius = style.radius;

  // ── CSS variables consumed by section components ──
  // These let section components defer to user overrides via
  // `var(--jw-section-X, theme-default)` without losing their default
  // appearance when nothing has been customised.
  if (style.bg_color) {
    out[STYLE_CSS_VARS.bg] = style.bg_color;
  }
  if (style.text_color) {
    out[STYLE_CSS_VARS.textColor] = style.text_color;
  }
  if (style.heading_color) {
    out[STYLE_CSS_VARS.headingColor] = style.heading_color;
  }
  if (style.heading_size) {
    out[STYLE_CSS_VARS.headingScale] = String(HEADING_SCALES[style.heading_size]);
  }
  if (style.body_size) {
    out[STYLE_CSS_VARS.bodyScale] = String(BODY_SCALES[style.body_size]);
  }

  return out as CSSProperties;
}

/** Resolved max-width in rem (or "100%" for "full"). */
export function maxWidthValue(style: SectionStyle | undefined | null): string | null {
  if (!style?.max_width) return null;
  return MAX_WIDTHS[style.max_width] ?? null;
}
