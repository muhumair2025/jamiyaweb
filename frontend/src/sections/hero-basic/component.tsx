import { z } from "zod";
import type { SectionComponentProps } from "@/engine/component-registry";
import { tokenVar } from "@/engine/core/tokens";

/**
 * Hero — Basic
 * A simple full-width hero with title, subtitle and one CTA.
 * Backed by token vars so the active theme + per-tenant overrides flow through.
 */

// Local Zod schema — narrows the generic `Record<string, unknown>` into a
// strongly-typed shape, with safe defaults so a half-filled section still renders.
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
    <section
      className="relative overflow-hidden px-6 py-20 text-white sm:py-28 lg:py-36"
      style={{
        background: safe.background_image
          ? `linear-gradient(135deg, ${tokenVar("color.primary")} 0%, rgba(0,0,0,0.55) 100%), url(${safe.background_image}) center/cover`
          : `linear-gradient(135deg, ${tokenVar("color.primary")} 0%, ${tokenVar("color.accent")} 130%)`,
      }}
    >
      {/* Subtle arabesque texture (uses the global CSS class from globals.css) */}
      <div aria-hidden className="absolute inset-0 bg-arabesque opacity-30" />

      <div
        className={`relative mx-auto max-w-3xl ${
          isCenter ? "text-center" : "text-start"
        }`}
        style={{ fontFamily: `var(--jw-font-heading, inherit)` }}
      >
        {safe.eyebrow && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur">
            {safe.eyebrow}
          </span>
        )}

        <h1 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          {safe.title}
        </h1>

        {safe.subtitle && (
          <p
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg"
            style={{ fontFamily: `var(--jw-font-body, inherit)` }}
          >
            {safe.subtitle}
          </p>
        )}

        {safe.cta_label && (
          <div className={`mt-8 ${isCenter ? "" : "flex justify-start"}`}>
            <a
              href={safe.cta_href || "#"}
              className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold shadow-lg transition-transform hover:scale-[1.02]"
              style={{
                background: tokenVar("color.accent"),
                color: "#fff",
              }}
            >
              {safe.cta_label}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
