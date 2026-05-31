import { ArrowRight, ChevronDown } from "lucide-react";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";
import {
  cssBackgroundPosition,
  cssBackgroundSize,
  resolveImage,
} from "@/engine/image-value";
import type { HeroBasicSettings } from "../component";

/**
 * Cinematic hero — full-bleed dramatic background, display-scale title,
 * supporting tagline pinned to the bottom-corner, and a scroll cue.
 *
 * The whole section spans the viewport height (with a sensible min/max) and
 * uses a strong gradient overlay for legibility over any photo. If no
 * background image is set, a brand-coloured gradient + arabesque stand in.
 *
 * Element ids exposed to the editor:
 *   • background, container, eyebrow, title, subtitle, cta
 */
export function HeroCinematic({ settings }: { settings: HeroBasicSettings }) {
  const isCenter = settings.alignment === "center";
  const image = resolveImage(settings.background_image);

  return (
    <EngineElement
      el="background"
      kind="background"
      as="section"
      className="relative isolate flex min-h-[88vh] flex-col overflow-hidden px-6 py-20 sm:py-24 lg:min-h-[92vh]"
      style={{
        background: `var(--jw-section-bg, ${
          image
            ? `url("${image.url}") ${cssBackgroundPosition(
                image.position
              )} / ${cssBackgroundSize(image.fit)} no-repeat`
            : `radial-gradient(60% 80% at 70% 20%, color-mix(in srgb, ${tokenVar(
                "color.accent"
              )} 35%, transparent), transparent 65%), linear-gradient(160deg, ${tokenVar(
                "color.primary"
              )} 0%, color-mix(in srgb, ${tokenVar(
                "color.primary"
              )} 60%, #000) 100%)`
        })`,
        color: "var(--jw-section-text, #ffffff)",
      }}
    >
      {/* User-set image overlay — flat colour scrim above the bg image */}
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
      {/* Strong cinematic overlay — dark vignette + readable bottom gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 30%, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.78) 100%)",
        }}
      />
      {/* Subtle arabesque texture on top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-arabesque opacity-[0.08] mix-blend-screen"
      />
      {/* Thin top-line motif — barely there, very editorial */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${tokenVar(
            "color.accent"
          )}, transparent)`,
          opacity: 0.6,
        }}
      />

      {/* Top eyebrow band — full-width, very thin, sits at the section top */}
      {settings.eyebrow && (
        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <EngineElement
            el="eyebrow"
            kind="text"
            as="span"
            className="inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.32em] opacity-90"
          >
            <span
              aria-hidden
              className="h-px w-8"
              style={{ background: tokenVar("color.accent") }}
            />
            {settings.eyebrow}
          </EngineElement>
        </div>
      )}

      {/* Display title — vertically centered, fills the section */}
      <div
        className={`relative z-10 flex flex-1 ${
          isCenter ? "items-center justify-center" : "items-center"
        }`}
      >
        <EngineElement
          el="container"
          kind="container"
          className={`mx-auto w-full max-w-6xl ${
            isCenter ? "text-center" : "text-start"
          }`}
          style={{ fontFamily: `var(--jw-font-heading, inherit)` }}
        >
          <EngineElement
            el="title"
            kind="heading"
            as="h1"
            className="text-balance font-semibold leading-[0.98] tracking-tight"
            style={{
              color: "var(--jw-section-heading, #ffffff)",
              fontSize:
                "calc(clamp(2.75rem, 7vw + 0.5rem, 7rem) * var(--jw-section-heading-scale, 1))",
              letterSpacing: "-0.035em",
              textShadow: "0 2px 30px rgba(0,0,0,0.35)",
            }}
          >
            {settings.title}
          </EngineElement>
        </EngineElement>
      </div>

      {/* Bottom row — subtitle on one side, CTA on the other (or stacked center) */}
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div
          aria-hidden
          className="mb-6 h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
          }}
        />

        <div
          className={`flex flex-col gap-6 ${
            isCenter
              ? "items-center text-center"
              : "items-start text-start sm:flex-row sm:items-end sm:justify-between"
          }`}
        >
          {settings.subtitle && (
            <EngineElement
              el="subtitle"
              kind="text"
              as="p"
              className={`max-w-xl leading-relaxed opacity-90 ${
                isCenter ? "mx-auto" : ""
              }`}
              style={{
                fontFamily: `var(--jw-font-body, inherit)`,
                fontSize:
                  "calc(clamp(0.95rem, 0.3vw + 0.9rem, 1.1rem) * var(--jw-section-body-scale, 1))",
              }}
            >
              {settings.subtitle}
            </EngineElement>
          )}

          {settings.cta_label && (
            <EngineElement
              el="cta"
              kind="button"
              as="a"
              className="group inline-flex h-12 shrink-0 items-center gap-2.5 rounded-full px-7 text-[13.5px] font-semibold tracking-wide shadow-[0_12px_36px_-10px_rgba(0,0,0,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_48px_-12px_rgba(0,0,0,0.65)]"
              style={{
                background: tokenVar("color.accent"),
                color: "#fff",
              }}
              {...({ href: settings.cta_href || "#" } as object)}
            >
              {settings.cta_label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </EngineElement>
          )}
        </div>

        {/* Scroll cue — sits just under the bottom row */}
        <div className="mt-10 flex justify-center">
          <span
            aria-hidden
            className="inline-flex flex-col items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.3em] opacity-70"
          >
            scroll
            <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
          </span>
        </div>
      </div>
    </EngineElement>
  );
}
