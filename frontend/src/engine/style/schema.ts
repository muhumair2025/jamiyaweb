import { z } from "zod";

/** Zod for SectionStyle — used both in page validation and (later) in
 *  the Style form's RHF resolver. */
export const SectionStyleSchema = z
  .object({
    padding_top: z.string().optional(),
    padding_bottom: z.string().optional(),
    padding_x: z.string().optional(),
    bg_color: z.string().optional(),
    text_color: z.string().optional(),
    heading_color: z.string().optional(),
    heading_size: z.enum(["xs", "sm", "md", "lg", "xl"]).optional(),
    body_size: z.enum(["sm", "md", "lg"]).optional(),
    align: z.enum(["start", "center", "end"]).optional(),
    max_width: z.enum(["sm", "md", "lg", "xl", "full"]).optional(),
    radius: z.string().optional(),
  })
  .partial();

export type SectionStyleInput = z.infer<typeof SectionStyleSchema>;
