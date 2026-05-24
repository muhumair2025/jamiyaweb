import { z } from "zod";

/**
 * Shape of a theme's tokens.json — a flat map of token key → token definition.
 *
 * Example entry:  "color.primary": { "type": "color", "default": "#20665c" }
 */

const ColorTokenSchema = z.object({
  type: z.literal("color"),
  default: z.string(),
  label: z.string().optional(),
});

const FontTokenSchema = z.object({
  type: z.literal("font"),
  default: z.string(),
  label: z.string().optional(),
});

const SizeTokenSchema = z.object({
  type: z.literal("size"),
  default: z.string(),
  min: z.string().optional(),
  max: z.string().optional(),
  label: z.string().optional(),
});

export const TokenDefinitionSchema = z.discriminatedUnion("type", [
  ColorTokenSchema,
  FontTokenSchema,
  SizeTokenSchema,
]);

export const TokensDefinitionSchema = z.record(
  z.string(),
  TokenDefinitionSchema
);

export type TokenDefinitionInput = z.infer<typeof TokenDefinitionSchema>;
export type TokensDefinitionInput = z.infer<typeof TokensDefinitionSchema>;
