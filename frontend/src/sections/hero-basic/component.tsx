import { z } from "zod";
import type { SectionComponentProps } from "@/engine/component-registry";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";

/**
 * Hero — Basic
 *
 * Element ids exposed to the editor:
 *   • background  (kind: background) — section background + arabesque overlay
 *   • container   (kind: container)  — content stack (max-width, gap, padding)
 *   • eyebrow     (kind: text)       — small label above the title
 *   • title       (kind: heading)    — H1
 *   • subtitle    (kind: text)       — paragraph
 *   • cta         (kind: button)     — primary call-to-action link
 *
 * Click any of these in the builder iframe → that element's style controls
 * appear in the right panel. Click outside any element → whole-section
 * Style tab.
 */

export const HeroBasicSchema = z.object({
  eyebrow: z.string().default(""),
  title: z.string().default("Your hero title goes here"),
  subtitle: z.string().default(""),
  cta_label: z.string().default(""),
  cta_href: z.string().default("#"),
  background_image: z.string().nullable().optional(),
  alignment: z.enum(["start", "center"]).default("center"),
});

export type HeroBasicSettings = z.infer<typeof HeroBasicSchema>;

export default function HeroBasic({
  settings,
}: SectionComponentProps<HeroBasicSettings>) {
  const safe = HeroBasicSchema.parse(settings);
  const isCenter = safe.alignment === "center";

  return (
    <EngineElement
      el="background"
      kind="background"
      as="section"
      className="relative overflow-hidden px-6 py-20 sm:py-28 lg:py-36"
      style={{
        // Defaults to the heroic gradient; user-set section bg/text wins.
        background: `var(--jw-section-bg, ${
          safe.background_image
            ? `linear-gradient(135deg, ${tokenVar("color.primary")} 0%, rgba(0,0,0,0.55) 100%), url(${safe.background_image}) center/cover`
            : `linear-gradient(135deg, ${tokenVar("color.primary")} 0%, ${tokenVar("color.accent")} 130%)`
        })`,
        color: "var(--jw-section-text, #ffffff)",
      }}
    >
      {/* Decorative arabesque pattern */}
      <div aria-hidden className="absolute inset-0 bg-arabesque opacity-30" />

      <EngineElement
        el="container"
        kind="container"
        className={`relative mx-auto max-w-3xl ${
          isCenter ? "text-center" : "text-start"
        }`}
        style={{ fontFamily: `var(--jw-font-heading, inherit)` }}
      >
        {safe.eyebrow && (
          <EngineElement
            el="eyebrow"
            kind="text"
            as="span"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider opacity-90 backdrop-blur"
          >
            {safe.eyebrow}
          </EngineElement>
        )}

        <EngineElement
          el="title"
          kind="heading"
          as="h1"
          className="mt-6 text-balance font-semibold leading-tight tracking-tight"
          style={{
            color: "var(--jw-section-heading, inherit)",
            fontSize: "calc(2.5rem * var(--jw-section-heading-scale, 1))",
          }}
        >
          {safe.title}
        </EngineElement>

        {safe.subtitle && (
          <EngineElement
            el="subtitle"
            kind="text"
            as="p"
            className="mx-auto mt-5 max-w-2xl leading-relaxed opacity-85"
            style={{
              fontFamily: `var(--jw-font-body, inherit)`,
              fontSize: "calc(1.05rem * var(--jw-section-body-scale, 1))",
            }}
          >
            {safe.subtitle}
          </EngineElement>
        )}

        {safe.cta_label && (
          <div className={`mt-8 ${isCenter ? "" : "flex justify-start"}`}>
            <EngineElement
              el="cta"
              kind="button"
              as="a"
              className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold shadow-lg transition-transform hover:scale-[1.02]"
              style={{
                background: tokenVar("color.accent"),
                color: "#fff",
              }}
              {...({ href: safe.cta_href || "#" } as object)}
            >
              {safe.cta_label}
            </EngineElement>
          </div>
        )}
      </EngineElement>
    </EngineElement>
  );
}
