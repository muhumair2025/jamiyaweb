import { z } from "zod";
import { SectionStyleSchema } from "../style/schema";
import { SectionElementsSchema } from "../element/schema";

/**
 * Shape of a single section instance inside a page's content_json.
 *
 *   - `settings`  : section-specific content (validated per-section by Zod)
 *   - `style`     : whole-section overrides (background, padding, …)
 *   - `elements`  : per-element overrides (heading colour, button radius, …)
 */
export const SectionInstanceSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  settings: z.record(z.string(), z.unknown()),
  style: SectionStyleSchema.optional(),
  elements: SectionElementsSchema.optional(),
});

/** Shape of `pages.content_json`. */
export const PageContentSchema = z.object({
  sections: z.array(SectionInstanceSchema),
});

export type SectionInstanceInput = z.infer<typeof SectionInstanceSchema>;
export type PageContentInput = z.infer<typeof PageContentSchema>;
