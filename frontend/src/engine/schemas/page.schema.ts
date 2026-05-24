import { z } from "zod";

/**
 * Shape of a single section instance inside a page's content_json.
 * The `settings` payload is left as a generic record here — each section's
 * own Zod schema (in `sections/{slug}/schema.ts`) narrows it further.
 */
export const SectionInstanceSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  settings: z.record(z.string(), z.unknown()),
});

/** Shape of `pages.content_json`. */
export const PageContentSchema = z.object({
  sections: z.array(SectionInstanceSchema),
});

export type SectionInstanceInput = z.infer<typeof SectionInstanceSchema>;
export type PageContentInput = z.infer<typeof PageContentSchema>;
