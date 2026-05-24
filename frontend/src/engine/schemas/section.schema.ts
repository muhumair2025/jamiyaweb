import { z } from "zod";

/**
 * Shape of section metadata as returned by GET /api/sections (and /api/sections/{slug}).
 * NOT the schema for an individual section's settings — that lives in
 * `sections/{slug}/schema.ts` and is what `schema` references here.
 */
export const SectionMetaSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  category: z.string().nullable(),
  icon: z.string().nullable(),
  preview_url: z.string().nullable(),
  schema: z.record(z.string(), z.unknown()),
  default_settings: z.record(z.string(), z.unknown()),
});

export const SectionMetaListResponseSchema = z.object({
  data: z.array(SectionMetaSchema),
});

export type SectionMetaInput = z.infer<typeof SectionMetaSchema>;
