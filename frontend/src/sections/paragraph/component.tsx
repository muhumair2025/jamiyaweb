import { z } from "zod";
import type { SectionComponentProps } from "@/engine/component-registry";
import { tokenVar } from "@/engine/core/tokens";

/**
 * Paragraph
 * A simple typographic block — heading + body, optionally constrained width.
 */

export const ParagraphSchema = z.object({
  heading: z.string().default(""),
  body: z.string().default(""),
  max_width: z.enum(["narrow", "normal", "wide"]).default("normal"),
});

export type ParagraphSettings = z.infer<typeof ParagraphSchema>;

const widthClass: Record<ParagraphSettings["max_width"], string> = {
  narrow: "max-w-2xl",
  normal: "max-w-3xl",
  wide: "max-w-5xl",
};

export default function Paragraph({
  settings,
}: SectionComponentProps<ParagraphSettings>) {
  const safe = ParagraphSchema.parse(settings);

  return (
    <section
      className="px-6 py-14 sm:py-20"
      style={{
        background: tokenVar("color.background"),
        color: tokenVar("color.foreground"),
      }}
    >
      <div className={`mx-auto ${widthClass[safe.max_width]}`}>
        {safe.heading && (
          <h2
            className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{ fontFamily: `var(--jw-font-heading, inherit)` }}
          >
            {safe.heading}
          </h2>
        )}

        {safe.body && (
          <div
            className="prose-jw mt-5 whitespace-pre-line text-base leading-relaxed sm:text-lg"
            style={{
              fontFamily: `var(--jw-font-body, inherit)`,
              opacity: 0.85,
            }}
          >
            {safe.body}
          </div>
        )}
      </div>
    </section>
  );
}
