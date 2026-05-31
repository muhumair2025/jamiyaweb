import { ArrowRight } from "lucide-react";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";
import {
  cssBackgroundPosition,
  cssBackgroundSize,
  resolveImage,
} from "@/engine/image-value";
import type { HeroBasicSettings } from "../component";

/**
 * Classic hero — polished, premium, human-designed feel.
 *
 * Layout: centered (or start-aligned) content stack with eyebrow chip → display
 * heading → subtitle → CTA group. A soft arabesque overlay and a thin gilded
 * divider above the eyebrow add the Arabic/editorial detailing.
 *
 * Element ids exposed to the editor:
 *   • background, container, eyebrow, title, subtitle, cta
 */
export function HeroClassic({ settings }: { settings: HeroBasicSettings }) {
  const isCenter = settings.alignment === "center";
  const image = resolveImage(settings.background_image);

  return (
    <EngineElement
      el="background"
      kind="background"
      as="section"
      className="relative isolate overflow-hidden px-6 py-24 sm:py-32 lg:py-40"
      style={{
        // Layered: brand-tinted gradient on top of (optional) user image, all
        // behind the var() escape hatch so a per-section bg override still wins.
        background: `var(--jw-section-bg, ${
          image
            ? `linear-gradient(135deg, color-mix(in srgb, ${tokenVar(
                "color.primary"
              )} 88%, transparent) 0%, color-mix(in srgb, #050505 70%, transparent) 100%), url("${
                image.url
              }") ${cssBackgroundPosition(image.position)} / ${cssBackgroundSize(
                image.fit
              )} no-repeat`
            : `radial-gradient(120% 80% at 20% 0%, color-mix(in srgb, ${tokenVar(
                "color.accent"
              )} 22%, transparent), transparent 60%), linear-gradient(135deg, ${tokenVar(
                "color.primary"
              )} 0%, color-mix(in srgb, ${tokenVar(
                "color.primary"
              )} 80%, #000) 130%)`
        })`,
        color: "var(--jw-section-text, #ffffff)",
      }}
    >
      {/* User-set image overlay — sits above the bg image, below all chrome */}
      {image && image.overlay_color && image.overlay_opacity > 0 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: image.overlay_color,
            opacity: image.overlay_opacity,
          }}
        />
      )}
      {/* Decorative arabesque — soft */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-arabesque opacity-[0.18]"
      />
      {/* Top-right glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 end-[-6rem] h-[26rem] w-[26rem] rounded-full opacity-30 blur-3xl"
        style={{ background: tokenVar("color.accent") }}
      />
      {/* Bottom fade for legibility over images */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent"
      />

      <EngineElement
        el="container"
        kind="container"
        className={`relative mx-auto flex max-w-3xl flex-col ${
          isCenter ? "items-center text-center" : "items-start text-start"
        }`}
        style={{ fontFamily: `var(--jw-font-heading, inherit)` }}
      >
        {/* Gilded divider — only when there's an eyebrow, gives the editorial feel */}
        {settings.eyebrow && (
          <span
            aria-hidden
            className="mb-5 inline-block h-px w-12 opacity-70"
            style={{ background: tokenVar("color.accent") }}
          />
        )}

        {settings.eyebrow && (
          <EngineElement
            el="eyebrow"
            kind="text"
            as="span"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.22em] backdrop-blur-sm"
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: tokenVar("color.accent") }}
            />
            {settings.eyebrow}
          </EngineElement>
        )}

        <EngineElement
          el="title"
          kind="heading"
          as="h1"
          className="mt-7 text-balance font-semibold leading-[1.05] tracking-tight"
          style={{
            color: "var(--jw-section-heading, inherit)",
            fontSize:
              "calc(clamp(2.25rem, 4.4vw + 0.5rem, 4.25rem) * var(--jw-section-heading-scale, 1))",
            letterSpacing: "-0.02em",
          }}
        >
          {settings.title}
        </EngineElement>

        {settings.subtitle && (
          <EngineElement
            el="subtitle"
            kind="text"
            as="p"
            className={`mt-6 max-w-2xl leading-relaxed opacity-90 ${
              isCenter ? "mx-auto" : ""
            }`}
            style={{
              fontFamily: `var(--jw-font-body, inherit)`,
              fontSize:
                "calc(clamp(1rem, 0.3vw + 0.95rem, 1.18rem) * var(--jw-section-body-scale, 1))",
            }}
          >
            {settings.subtitle}
          </EngineElement>
        )}

        {settings.cta_label && (
          <div
            className={`mt-10 flex flex-wrap items-center gap-3 ${
              isCenter ? "justify-center" : "justify-start"
            }`}
          >
            <EngineElement
              el="cta"
              kind="button"
              as="a"
              className="group inline-flex h-12 items-center gap-2 rounded-full px-7 text-[13.5px] font-semibold tracking-wide shadow-[0_10px_30px_-10px_rgba(0,0,0,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)]"
              style={{
                background: tokenVar("color.accent"),
                color: "#fff",
              }}
              {...({ href: settings.cta_href || "#" } as object)}
            >
              {settings.cta_label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </EngineElement>
          </div>
        )}
      </EngineElement>
    </EngineElement>
  );
}
