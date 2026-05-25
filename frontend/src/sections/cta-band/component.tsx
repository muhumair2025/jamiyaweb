import { z } from "zod";
import type { SectionComponentProps } from "@/engine/component-registry";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";

/**
 * CTA band — centered headline + subheading + single button on a coloured
 * panel.
 *
 * Element ids exposed to the editor:
 *   • background  (kind: background)
 *   • container   (kind: container)
 *   • heading     (kind: heading)
 *   • subheading  (kind: text)
 *   • button      (kind: button)
 */

export const CtaBandSchema = z.object({
  heading: z.string().default("Ready to get started?"),
  subheading: z.string().default(""),
  button_label: z.string().default("Get started"),
  button_href: z.string().default("#"),
  style: z.enum(["dark", "light"]).default("dark"),
});

export type CtaBandSettings = z.infer<typeof CtaBandSchema>;

export default function CtaBand({
  settings,
}: SectionComponentProps<CtaBandSettings>) {
  const s = CtaBandSchema.parse(settings);
  const isDark = s.style === "dark";

  return (
    <EngineElement
      el="background"
      kind="background"
      as="section"
      className="px-6 py-16 sm:py-20"
      style={{
        background: `var(--jw-section-bg, ${
          isDark ? tokenVar("color.primary") : tokenVar("color.background")
        })`,
        color: `var(--jw-section-text, ${isDark ? "#fff" : tokenVar("color.foreground")})`,
        borderTop: isDark
          ? "none"
          : `1px solid color-mix(in srgb, ${tokenVar("color.foreground")} 10%, transparent)`,
        borderBottom: isDark
          ? "none"
          : `1px solid color-mix(in srgb, ${tokenVar("color.foreground")} 10%, transparent)`,
      }}
    >
      <EngineElement
        el="container"
        kind="container"
        className="mx-auto max-w-3xl text-center"
      >
        <EngineElement
          el="heading"
          kind="heading"
          as="h2"
          className="text-balance font-semibold tracking-tight"
          style={{
            fontFamily: `var(--jw-font-heading, inherit)`,
            color: isDark ? "inherit" : "var(--jw-section-heading, inherit)",
            fontSize: "calc(1.875rem * var(--jw-section-heading-scale, 1))",
          }}
        >
          {s.heading}
        </EngineElement>

        {s.subheading && (
          <EngineElement
            el="subheading"
            kind="text"
            as="p"
            className="mx-auto mt-3 max-w-2xl leading-relaxed"
            style={{
              opacity: isDark ? 0.85 : 0.8,
              fontFamily: `var(--jw-font-body, inherit)`,
              fontSize: "calc(1rem * var(--jw-section-body-scale, 1))",
            }}
          >
            {s.subheading}
          </EngineElement>
        )}

        {s.button_label && (
          <div className="mt-7">
            <EngineElement
              el="button"
              kind="button"
              as="a"
              className="inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold shadow-lg transition-transform hover:scale-[1.02]"
              style={{
                background: tokenVar("color.accent"),
                color: "#fff",
              }}
              {...({ href: s.button_href || "#" } as object)}
            >
              {s.button_label}
            </EngineElement>
          </div>
        )}
      </EngineElement>
    </EngineElement>
  );
}
