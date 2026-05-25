import type { CSSProperties } from "react";
import { DEVICE_BREAKPOINTS } from "../element/apply";
import type { DeviceBreakpoint } from "../element/types";
import {
  BODY_SCALES,
  HEADING_SCALES,
  MAX_WIDTHS,
  STYLE_CSS_VARS,
  type SectionStyle,
  type SectionStyleOverride,
} from "./types";

/**
 * Merge desktop/tablet/mobile slots for the active device view.
 * Desktop-first cascade — same semantics as element-level overrides.
 */
export function mergeSectionStyleForDevice(
  style: SectionStyle | undefined | null,
  device: DeviceBreakpoint
): SectionStyle {
  if (!style) return {};
  const base: SectionStyle = { ...style };
  delete base.tablet;
  delete base.mobile;

  if (device === "tablet" || device === "mobile") {
    if (style.tablet) Object.assign(base, style.tablet);
  }
  if (device === "mobile") {
    if (style.mobile) Object.assign(base, style.mobile);
  }
  return base;
}

/**
 * Build a React `style` object for the section's outer wrapper.
 * Combines spacing/background props with CSS vars that section components
 * consume (text colour, heading colour, type scale).
 *
 * When `device` is provided, the style is cascaded through the responsive
 * stack first.
 */
export function applySectionStyle(
  rawStyle: SectionStyle | undefined | null,
  device: DeviceBreakpoint = "desktop"
): CSSProperties {
  if (!rawStyle) return {};
  const style = mergeSectionStyleForDevice(rawStyle, device);

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

function camelToKebab(key: string): string {
  return key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}

function cssBlock(props: CSSProperties): string {
  return Object.entries(props)
    .map(([k, v]) => `${camelToKebab(k)}: ${v};`)
    .join(" ");
}

function applySectionOverrideOnly(
  override: SectionStyleOverride
): CSSProperties {
  return applySectionStyle({ ...override } as SectionStyle, "desktop");
}

function hasAnyKey(o: object): boolean {
  for (const _ in o) return true;
  return false;
}

/**
 * Emit responsive CSS text for a section, scoped to the given selector.
 * `base` is the desktop CSSProperties (consumers inline it); `cssText` is
 * the media-query rules block for tablet + mobile overrides.
 */
export function sectionResponsiveCss(
  style: SectionStyle | undefined | null,
  selector: string
): { base: CSSProperties; cssText: string } {
  const base = applySectionStyle(style, "desktop");
  if (!style) return { base, cssText: "" };

  const parts: string[] = [];

  if (style.tablet && hasAnyKey(style.tablet)) {
    const delta = applySectionOverrideOnly(style.tablet);
    if (Object.keys(delta).length > 0) {
      parts.push(
        `@media (max-width: ${DEVICE_BREAKPOINTS.tablet_max}px) { ${selector} { ${cssBlock(delta)} } }`
      );
    }
  }
  if (style.mobile && hasAnyKey(style.mobile)) {
    const delta = applySectionOverrideOnly(style.mobile);
    if (Object.keys(delta).length > 0) {
      parts.push(
        `@media (max-width: ${DEVICE_BREAKPOINTS.mobile_max}px) { ${selector} { ${cssBlock(delta)} } }`
      );
    }
  }

  return { base, cssText: parts.join(" ") };
}
