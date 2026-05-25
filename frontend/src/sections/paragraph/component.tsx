import { z } from "zod";
import type { SectionComponentProps } from "@/engine/component-registry";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";

/**
 * Paragraph
 *
 * Element ids exposed to the editor:
 *   • background  (kind: background)
 *   • container   (kind: container)
 *   • heading     (kind: heading)
 *   • body        (kind: text)
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
    <EngineElement
      el="background"
      kind="background"
      as="section"
      className="px-6 py-14 sm:py-20"
      style={{
        // var() lets user-set section bg_color/text_color win at the same
        // DOM level; the fallback chain ends at the theme token.
        background: `var(--jw-section-bg, ${tokenVar("color.background")})`,
        color: `var(--jw-section-text, ${tokenVar("color.foreground")})`,
      }}
    >
      <EngineElement
        el="container"
        kind="container"
        className={`mx-auto ${widthClass[safe.max_width]}`}
      >
        {safe.heading && (
          <EngineElement
            el="heading"
            kind="heading"
            as="h2"
            className="text-balance font-semibold tracking-tight"
            style={{
              fontFamily: `var(--jw-font-heading, inherit)`,
              color: "var(--jw-section-heading, inherit)",
              fontSize: "calc(2rem * var(--jw-section-heading-scale, 1))",
            }}
          >
            {safe.heading}
          </EngineElement>
        )}

        {safe.body && (
          <EngineElement
            el="body"
            kind="text"
            className="prose-jw mt-5 whitespace-pre-line leading-relaxed"
            style={{
              fontFamily: `var(--jw-font-body, inherit)`,
              fontSize: "calc(1rem * var(--jw-section-body-scale, 1))",
              opacity: 0.85,
            }}
          >
            {safe.body}
          </EngineElement>
        )}
      </EngineElement>
    </EngineElement>
  );
}
