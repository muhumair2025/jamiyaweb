import { z } from "zod";

/**
 * Zod for ElementStyle — a single permissive schema mirroring `types.ts`.
 * Used by both the page validator and (later) the builder's element form
 * resolver. All fields optional; enums where the type allows it.
 */
export const ElementStyleSchema = z
  .object({
    hidden: z.boolean().optional(),

    color: z.string().max(32).optional(),
    font_size: z.string().max(32).optional(),
    font_weight: z.string().max(8).optional(),
    line_height: z.string().max(16).optional(),
    letter_spacing: z.string().max(16).optional(),
    text_align: z.enum(["start", "center", "end"]).optional(),
    font_family: z.string().max(128).optional(),
    text_transform: z
      .enum(["none", "uppercase", "lowercase", "capitalize"])
      .optional(),

    bg_color: z.string().max(32).optional(),
    padding_x: z.string().max(32).optional(),
    padding_y: z.string().max(32).optional(),
    border_radius: z.string().max(32).optional(),
    border_width: z.string().max(16).optional(),
    border_color: z.string().max(32).optional(),
    shadow: z.enum(["none", "sm", "md", "lg", "xl"]).optional(),

    width: z.string().max(32).optional(),
    height: z.string().max(32).optional(),
    object_fit: z
      .enum(["contain", "cover", "fill", "scale-down", "none"])
      .optional(),
    opacity: z.number().min(0).max(1).optional(),

    size: z.string().max(32).optional(),

    max_width: z.string().max(32).optional(),
    gap: z.string().max(32).optional(),

    bg_image: z.string().max(2048).optional(),
    bg_position: z
      .enum(["center", "top", "bottom", "left", "right"])
      .optional(),
    bg_size: z.enum(["cover", "contain", "auto"]).optional(),
    overlay_color: z.string().max(32).optional(),
    overlay_opacity: z.number().min(0).max(1).optional(),

    margin_top: z.string().max(32).optional(),
    margin_bottom: z.string().max(32).optional(),
  })
  .partial();

/** Map of element id (e.g. "title") to its style overrides. */
export const SectionElementsSchema = z.record(
  z.string().min(1).max(64),
  ElementStyleSchema
);

export type ElementStyleInput = z.infer<typeof ElementStyleSchema>;
export type SectionElementsInput = z.infer<typeof SectionElementsSchema>;
