import { z } from "zod";
import { ManifestSchema } from "./manifest.schema";
import { TokensDefinitionSchema } from "./tokens.schema";

/** Section reference as it appears nested inside a theme response. */
const ThemeSectionRefSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  category: z.string().nullable(),
  sort_order: z.number().int(),
  is_required: z.boolean(),
});

/** Shape of a theme as returned by GET /api/themes and /api/themes/{slug}. */
export const ThemeMetaSchema = z.object({
  id: z.number().int(),
  slug: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  author: z.string().nullable(),
  preview_url: z.string().nullable(),
  manifest: ManifestSchema,
  tokens: TokensDefinitionSchema,
  supported_types: z.array(z.string()),
  is_default: z.boolean(),
  sections: z.array(ThemeSectionRefSchema),
});

export const ThemeListResponseSchema = z.object({
  data: z.array(ThemeMetaSchema),
});

export const ThemeShowResponseSchema = z.object({
  data: ThemeMetaSchema,
});

export type ThemeMetaInput = z.infer<typeof ThemeMetaSchema>;
