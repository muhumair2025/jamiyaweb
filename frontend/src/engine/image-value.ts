/**
 * Image value — the shape stored in `settings.<image-field>` for any
 * section/field of `format: "image"`.
 *
 * Historically this was just a URL string. We now support a richer object
 * that carries display options (fit, position, overlay) so the user can
 * customise how the picked image is rendered without going through the
 * separate element-style panel.
 *
 * **Backwards compatible**: legacy plain-string URLs in content_json keep
 * working. `resolveImage()` normalises both shapes into one record the
 * section components can rely on.
 */

import { z } from "zod";

export type ImageFit = "cover" | "contain" | "fill" | "scale-down" | "none";

export type ImagePosition =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export const IMAGE_FITS: { value: ImageFit; label: string }[] = [
  { value: "cover", label: "Cover" },
  { value: "contain", label: "Contain" },
  { value: "fill", label: "Fill" },
  { value: "scale-down", label: "Scale down" },
  { value: "none", label: "None" },
];

export const IMAGE_POSITIONS_GRID: ImagePosition[][] = [
  ["top-left", "top", "top-right"],
  ["left", "center", "right"],
  ["bottom-left", "bottom", "bottom-right"],
];

/** Rich object form. All visual options are optional with sensible defaults. */
export interface ImageValueObject {
  url: string;
  fit?: ImageFit;
  position?: ImagePosition;
  overlay_color?: string | null;
  overlay_opacity?: number;
}

/** Value as stored. Old data is a plain string URL; new data is the object. */
export type ImageValue = string | ImageValueObject | null | undefined;

/** Always-populated record, safe to pass into the CSS helpers below. */
export interface ResolvedImage {
  url: string;
  fit: ImageFit;
  position: ImagePosition;
  overlay_color: string | null;
  overlay_opacity: number;
}

/** Normalise either shape (or empty/null) into a `ResolvedImage` or null. */
export function resolveImage(value: ImageValue): ResolvedImage | null {
  if (!value) return null;
  if (typeof value === "string") {
    if (!value) return null;
    return {
      url: value,
      fit: "cover",
      position: "center",
      overlay_color: null,
      overlay_opacity: 0,
    };
  }
  if (typeof value !== "object" || !value.url) return null;
  return {
    url: value.url,
    fit: value.fit ?? "cover",
    position: value.position ?? "center",
    overlay_color: value.overlay_color ?? null,
    overlay_opacity: clamp01(value.overlay_opacity ?? 0),
  };
}

/** Pull just the URL out — handy when only the URL matters (logo, avatar). */
export function getImageUrl(value: ImageValue): string | null {
  if (!value) return null;
  if (typeof value === "string") return value || null;
  return value.url || null;
}

/** CSS `background-position` for the 9-point grid. */
export function cssBackgroundPosition(pos: ImagePosition): string {
  switch (pos) {
    case "top-left":
      return "top left";
    case "top-right":
      return "top right";
    case "bottom-left":
      return "bottom left";
    case "bottom-right":
      return "bottom right";
    default:
      return pos;
  }
}

/**
 * CSS `background-size` — `cover`/`contain` pass through; the `<img>`-only
 * fits (`fill`, `scale-down`, `none`) are mapped to the closest background
 * behaviour so a single setting works for both rendering modes.
 */
export function cssBackgroundSize(fit: ImageFit): string {
  switch (fit) {
    case "fill":
      return "100% 100%";
    case "scale-down":
      return "contain";
    case "none":
      return "auto";
    default:
      return fit;
  }
}

/** CSS `object-position` for an `<img>` tag — same grammar as bg-position. */
export function cssObjectPosition(pos: ImagePosition): string {
  return cssBackgroundPosition(pos);
}

/**
 * Build the CSS `background` shorthand for the given resolved image. Returns
 * just the layer — the section component composes it with any gradient
 * overlays it wants on top.
 */
export function imageBackgroundCss(image: ResolvedImage): string {
  return `url("${escapeUrl(image.url)}") ${cssBackgroundPosition(
    image.position
  )} / ${cssBackgroundSize(image.fit)} no-repeat`;
}

function escapeUrl(url: string): string {
  return url.replace(/"/g, '\\"');
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

/**
 * Shared Zod schema for any image field. Accepts the legacy plain-string
 * URL form AND the rich `{ url, fit, position, overlay_color,
 * overlay_opacity }` form. Empty strings and undefined coerce to null.
 *
 * Every section that stores an image MUST declare its field with this
 * schema — otherwise the per-image fit/position/overlay controls in the
 * Content tab will produce a value that fails section-level validation
 * (the bug that surfaced as `expected string, received object` in
 * sections like image-gallery and team).
 */
export const imageValueSchema = z.preprocess(
  (v) => (v === undefined || v === "" ? null : v),
  z.union([
    z.string(),
    z.object({
      url: z.string(),
      fit: z
        .enum(["cover", "contain", "fill", "scale-down", "none"])
        .optional(),
      position: z
        .enum([
          "center",
          "top",
          "bottom",
          "left",
          "right",
          "top-left",
          "top-right",
          "bottom-left",
          "bottom-right",
        ])
        .optional(),
      overlay_color: z.string().nullable().optional(),
      overlay_opacity: z.number().min(0).max(1).optional(),
    }),
    z.null(),
  ])
);
