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
 * Minimal hero — clean, type-led, whitespace-driven.
 *
 * No heavy gradient, no overlay theatrics. Just confident typography on a
 * neutral surface, with a thin brand-coloured rule above the eyebrow as the
 * sole graphic element. The CTA renders as a quiet underline-on-hover link
 * with an arrow rather than a filled pill — fits the editorial feel.
 *
 * Mobile-first: type sizes use clamp(), the rule shrinks on small screens,
 * and the column never exceeds its `max-w-2xl` so reading width stays
 * comfortable from 360px up to ultrawide.
 *
 * Element ids exposed to the editor:
 *   • background, container, eyebrow, title, subtitle, cta
 */
export function HeroMinimal({ settings }: { settings: HeroBasicSettings }) {
  const isCenter = settings.alignment === "center";
  const image = resolveImage(settings.background_image);

  return (
    <EngineElement
      el="background"
      kind="background"
      as="section"
      className="relative isolate overflow-hidden px-6 py-20 sm:py-28 lg:py-36"
      style={{
        // Always tint the image with a high-opacity white scrim so the
        // minimal variant keeps its airy, type-led feel even with a photo.
        background: `var(--jw-section-bg, ${
          image
            ? `linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.88) 100%), url("${
                image.url
              }") ${cssBackgroundPosition(image.position)} / ${cssBackgroundSize(
                image.fit
              )} no-repeat`
            : "#fafaf7"
        })`,
        color: "var(--jw-section-text, #1a1a1a)",
      }}
    >
      {/* User-set image overlay — sits above the bg image but under content */}
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
      {/* Single hairline accent at the top — the only chrome */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${tokenVar(
            "color.accent"
          )} 50%, transparent)`,
          opacity: 0.45,
        }}
      />

      <EngineElement
        el="container"
        kind="container"
        className={`relative mx-auto flex max-w-2xl flex-col ${
          isCenter ? "items-center text-center" : "items-start text-start"
        }`}
        style={{ fontFamily: `var(--jw-font-heading, inherit)` }}
      >
        {/* Thin brand-coloured rule — the only "decoration" */}
        {settings.eyebrow && (
          <span
            aria-hidden
            className="mb-4 inline-block h-[2px] w-8 sm:w-10"
            style={{ background: tokenVar("color.accent") }}
          />
        )}

        {settings.eyebrow && (
          <EngineElement
            el="eyebrow"
            kind="text"
            as="span"
            className="text-[10.5px] font-semibold uppercase tracking-[0.28em] opacity-70"
          >
            {settings.eyebrow}
          </EngineElement>
        )}

        <EngineElement
          el="title"
          kind="heading"
          as="h1"
          className="mt-4 text-balance font-medium leading-[1.1] tracking-tight sm:mt-5"
          style={{
            color: "var(--jw-section-heading, inherit)",
            fontSize:
              "calc(clamp(2rem, 4vw + 0.5rem, 3.75rem) * var(--jw-section-heading-scale, 1))",
            letterSpacing: "-0.025em",
          }}
        >
          {settings.title}
        </EngineElement>

        {settings.subtitle && (
          <EngineElement
            el="subtitle"
            kind="text"
            as="p"
            className={`mt-5 max-w-xl leading-relaxed opacity-75 sm:mt-6 ${
              isCenter ? "mx-auto" : ""
            }`}
            style={{
              fontFamily: `var(--jw-font-body, inherit)`,
              fontSize:
                "calc(clamp(0.98rem, 0.25vw + 0.95rem, 1.125rem) * var(--jw-section-body-scale, 1))",
            }}
          >
            {settings.subtitle}
          </EngineElement>
        )}

        {settings.cta_label && (
          <div
            className={`mt-8 sm:mt-10 ${
              isCenter ? "flex justify-center" : "flex justify-start"
            }`}
          >
            <EngineElement
              el="cta"
              kind="button"
              as="a"
              className="group inline-flex items-center gap-2 border-b-2 pb-1 text-[13px] font-semibold tracking-wide transition-colors hover:opacity-80"
              style={{
                color: tokenVar("color.accent"),
                borderColor: tokenVar("color.accent"),
              }}
              {...({ href: settings.cta_href || "#" } as object)}
            >
              {settings.cta_label}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </EngineElement>
          </div>
        )}
      </EngineElement>
    </EngineElement>
  );
}
