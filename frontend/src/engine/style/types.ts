/**
 * Per-section style overrides — applied by the engine renderer as a wrapper
 * around every section instance. Sections never read these directly; instead
 * they consume `var(--jw-section-*)` CSS variables that the wrapper provides.
 *
 * Every field is OPTIONAL. Missing fields fall through to:
 *   1. Theme defaults (via tokens, e.g. `var(--jw-color-primary)`)
 *   2. The section component's own hard-coded fallback
 *
 * Designed to stay LIGHT — a fixed schema of ~10 controls covers 95% of
 * Shopify-class customisation needs without per-section duplication.
 */
export interface SectionStyle {
  /** Vertical padding (top + bottom). Values like "0", "2rem", "4rem". */
  padding_top?: string;
  padding_bottom?: string;
  /** Horizontal padding (uniform left+right). */
  padding_x?: string;
  /** Background color of the whole section. */
  bg_color?: string;
  /** Default text color (paragraphs, lists, etc.). */
  text_color?: string;
  /** Heading color (h1/h2/h3 inside the section). */
  heading_color?: string;
  /** Heading scale — preset multiplier applied via CSS var. */
  heading_size?: HeadingSize;
  /** Body text scale. */
  body_size?: BodySize;
  /** Text alignment for the section's content. */
  align?: "start" | "center" | "end";
  /** Maximum content width preset. */
  max_width?: "sm" | "md" | "lg" | "xl" | "full";
  /** Corner radius for the section's outer wrapper. */
  radius?: string;
}

export type HeadingSize = "xs" | "sm" | "md" | "lg" | "xl";
export type BodySize = "sm" | "md" | "lg";

/** Style values exposed as CSS variables on the section wrapper. */
export const STYLE_CSS_VARS = {
  bg: "--jw-section-bg",
  textColor: "--jw-section-text",
  headingColor: "--jw-section-heading",
  headingScale: "--jw-section-heading-scale",
  bodyScale: "--jw-section-body-scale",
} as const;

/** Heading scale presets (multiplier on the section's heading font-size). */
export const HEADING_SCALES: Record<HeadingSize, number> = {
  xs: 0.75,
  sm: 0.9,
  md: 1,
  lg: 1.25,
  xl: 1.6,
};

/** Body scale presets. */
export const BODY_SCALES: Record<BodySize, number> = {
  sm: 0.9,
  md: 1,
  lg: 1.125,
};

/** Max-width presets in rem. */
export const MAX_WIDTHS: Record<NonNullable<SectionStyle["max_width"]>, string> = {
  sm: "40rem",
  md: "48rem",
  lg: "64rem",
  xl: "80rem",
  full: "100%",
};
