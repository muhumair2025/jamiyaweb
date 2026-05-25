/**
 * Element-level customisation — the Elementor / Shopify Theme Editor 2.0 model.
 *
 * Each section's component wraps its individual parts (a heading, a button,
 * an image, …) with `<EngineElement el="title" kind="heading">`. The engine
 * stores per-element overrides in `section.elements[elementId]` and applies
 * them automatically at render time.
 *
 * The schema is intentionally a SINGLE permissive shape. `applyElementStyle()`
 * decides which fields apply based on the element's `kind` — adding a new
 * style control (e.g. text-shadow) only needs one edit, never a per-kind fork.
 */

export type ElementKind =
  | "text"        // body text, paragraphs, captions
  | "heading"     // h1/h2/h3/h4 — same fields as text plus tighter defaults
  | "button"      // CTA — adds bg, padding, radius, border, shadow
  | "image"       // raster / svg — width, height, fit, radius, opacity
  | "icon"        // lucide / svg icon — colour, size
  | "container"   // section's inner content wrapper — max-width, gap, padding
  | "background"; // section background layer — colour, image, overlay

/** Map of element id (e.g. "title", "cta") → style overrides. */
export type SectionElements = Record<string, ElementStyle>;

/** Single permissive shape. Apply logic filters by kind. */
export interface ElementStyle {
  // ── Visibility ──
  hidden?: boolean;

  // ── Self-alignment within parent flex/grid container.
  // "auto" returns to the parent's align-items default.
  align_self?: "auto" | "start" | "center" | "end" | "stretch";

  // ── Typography (text / heading / button text) ──
  color?: string;
  font_size?: string;          // "1rem", "32px", "calc(1.5rem * 1.1)"
  font_weight?: string;        // "300".."900"
  line_height?: string;        // "1.4", "1.1"
  letter_spacing?: string;     // "-0.02em"
  text_align?: "start" | "center" | "end";
  font_family?: string;        // "var(--font-typo-classical)" etc.
  text_transform?: "none" | "uppercase" | "lowercase" | "capitalize";

  // ── Box / button extras ──
  bg_color?: string;
  padding_x?: string;
  padding_y?: string;
  border_radius?: string;
  border_width?: string;
  border_color?: string;
  shadow?: "none" | "sm" | "md" | "lg" | "xl";

  // ── Image ──
  width?: string;              // "auto", "100%", "300px"
  height?: string;
  object_fit?: "contain" | "cover" | "fill" | "scale-down" | "none";
  opacity?: number;            // 0..1

  // ── Icon (extras) ──
  size?: string;               // "1rem", "32px" — applied as width+height to svg

  // ── Container ──
  max_width?: string;          // "32rem", "64rem", "100%"
  gap?: string;                // for flex/grid children

  // ── Background ──
  bg_image?: string;           // url
  bg_position?: "center" | "top" | "bottom" | "left" | "right";
  bg_size?: "cover" | "contain" | "auto";
  overlay_color?: string;
  overlay_opacity?: number;    // 0..1

  // ── Spacing (universal) ──
  margin_top?: string;
  margin_bottom?: string;
}

/** Box-shadow presets for the `shadow` enum. */
export const SHADOW_PRESETS: Record<NonNullable<ElementStyle["shadow"]>, string> = {
  none: "none",
  sm: "0 1px 2px rgba(0,0,0,0.05)",
  md: "0 4px 12px rgba(0,0,0,0.08)",
  lg: "0 10px 28px rgba(0,0,0,0.12)",
  xl: "0 20px 50px rgba(0,0,0,0.18)",
};

/**
 * Which style fields each kind exposes in the editor. Fields not in this set
 * are stripped by `applyElementStyle()` even if they exist in the data.
 *
 * Order is preserved for the editor's display.
 */
export const KIND_FIELDS: Record<ElementKind, (keyof ElementStyle)[]> = {
  text: [
    "color", "font_family", "font_size", "font_weight", "line_height",
    "letter_spacing", "text_align", "text_transform",
    "width", "max_width", "align_self",
    "margin_top", "margin_bottom", "hidden",
  ],
  heading: [
    "color", "font_family", "font_size", "font_weight", "line_height",
    "letter_spacing", "text_align", "text_transform",
    "width", "max_width", "align_self",
    "margin_top", "margin_bottom", "hidden",
  ],
  button: [
    "color", "font_family", "bg_color", "padding_x", "padding_y",
    "border_radius", "border_width", "border_color",
    "shadow", "font_size", "font_weight",
    "width", "align_self",
    "margin_top", "margin_bottom", "hidden",
  ],
  image: [
    "width", "height", "object_fit", "border_radius",
    "opacity", "align_self",
    "margin_top", "margin_bottom", "hidden",
  ],
  icon: [
    "color", "size", "align_self",
    "margin_top", "margin_bottom", "hidden",
  ],
  container: [
    "width", "height", "max_width", "padding_x", "padding_y", "gap",
    "bg_color", "border_radius", "shadow", "align_self",
    "margin_top", "margin_bottom", "hidden",
  ],
  background: [
    "bg_color", "bg_image", "bg_position", "bg_size",
    "overlay_color", "overlay_opacity",
  ],
};
