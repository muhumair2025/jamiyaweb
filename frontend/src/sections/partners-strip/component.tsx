import { z } from "zod";
import type { SectionComponentProps } from "@/engine/component-registry";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";
import {
  cssBackgroundPosition,
  cssBackgroundSize,
  getImageUrl,
  imageValueSchema,
  resolveImage,
} from "@/engine/image-value";
import { nullSafeBoolean, nullSafeString } from "../_helpers";

/**
 * Partners strip — trust signal. A row of partner / sponsor / regulator
 * logos, optionally desaturated until hover (the convention used on every
 * reference site: wusul, alsukkary, msaee).
 *
 * Two display modes:
 *   • grid     — uniform N-column grid (default)
 *   • marquee  — continuously-scrolling row (great when there are many)
 *
 * Element ids:
 *   • background, container, eyebrow, heading, subheading, strip
 */

const PartnerSchema = z.object({
  logo: imageValueSchema,
  name: nullSafeString(""),
  href: nullSafeString(""),
});

export const PartnersStripSchema = z.object({
  eyebrow: nullSafeString(""),
  heading: nullSafeString(""),
  subheading: nullSafeString(""),
  layout: z.enum(["grid", "marquee"]).catch("grid").default("grid"),
  columns: z.enum(["3", "4", "5", "6"]).catch("5").default("5"),
  grayscale: nullSafeBoolean(true),
  partners: z.array(PartnerSchema).default([]),
});

export type PartnersStripSettings = z.infer<typeof PartnersStripSchema>;

const COL_CLASS: Record<PartnersStripSettings["columns"], string> = {
  "3": "grid-cols-3",
  "4": "grid-cols-2 sm:grid-cols-4",
  "5": "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  "6": "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};

export default function PartnersStrip({
  settings,
}: SectionComponentProps<PartnersStripSettings>) {
  const safe = PartnersStripSchema.parse(settings);
  const hasHeader = Boolean(safe.eyebrow || safe.heading || safe.subheading);

  return (
    <EngineElement
      el="background"
      kind="background"
      as="section"
      className="px-6 py-14 sm:py-16"
      style={{
        background: `var(--jw-section-bg, ${tokenVar("color.background")})`,
        color: `var(--jw-section-text, ${tokenVar("color.foreground")})`,
      }}
    >
      <EngineElement
        el="container"
        kind="container"
        className="mx-auto max-w-6xl"
      >
        {hasHeader && (
          <header className="mx-auto max-w-2xl text-center">
            {safe.eyebrow && (
              <EngineElement
                el="eyebrow"
                kind="text"
                as="p"
                className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: tokenVar("color.accent") }}
              >
                {safe.eyebrow}
              </EngineElement>
            )}
            {safe.heading && (
              <EngineElement
                el="heading"
                kind="heading"
                as="h2"
                className="mt-3 text-balance font-semibold tracking-tight"
                style={{
                  fontFamily: "var(--jw-font-heading, inherit)",
                  color: "var(--jw-section-heading, inherit)",
                  fontSize:
                    "calc(clamp(1.5rem, 2vw + 0.8rem, 2.1rem) * var(--jw-section-heading-scale, 1))",
                  letterSpacing: "-0.02em",
                }}
              >
                {safe.heading}
              </EngineElement>
            )}
            {safe.subheading && (
              <EngineElement
                el="subheading"
                kind="text"
                as="p"
                className="mt-3 text-sm opacity-75"
              >
                {safe.subheading}
              </EngineElement>
            )}
          </header>
        )}

        {safe.partners.length > 0 && (
          <EngineElement
            el="strip"
            kind="container"
            className={hasHeader ? "mt-10" : ""}
          >
            {safe.layout === "marquee" ? (
              <Marquee partners={safe.partners} grayscale={safe.grayscale} />
            ) : (
              <div
                className={`grid items-center gap-x-6 gap-y-8 ${COL_CLASS[safe.columns]}`}
              >
                {safe.partners.map((p, i) => (
                  <PartnerLogo
                    key={i}
                    partner={p}
                    grayscale={safe.grayscale}
                  />
                ))}
              </div>
            )}
          </EngineElement>
        )}
      </EngineElement>
    </EngineElement>
  );
}

// ────────────────────────────────────────────────────────────────────────

function PartnerLogo({
  partner,
  grayscale,
}: {
  partner: z.infer<typeof PartnerSchema>;
  grayscale: boolean;
}) {
  const url = getImageUrl(partner.logo);
  const resolved = resolveImage(partner.logo);

  const inner = url ? (
    <span
      className={`block h-10 w-full transition-all duration-300 sm:h-12 ${
        grayscale
          ? "opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
          : "opacity-90 hover:opacity-100"
      }`}
      style={{
        background: `url("${url}") ${
          resolved ? cssBackgroundPosition(resolved.position) : "center"
        } / ${resolved ? cssBackgroundSize(resolved.fit) : "contain"} no-repeat`,
      }}
      role="img"
      aria-label={partner.name || "Partner logo"}
    />
  ) : (
    <span
      className="block h-10 w-full rounded-md text-center text-xs font-semibold leading-[2.5rem] opacity-60 sm:h-12 sm:leading-[3rem]"
      style={{
        background: "color-mix(in srgb, currentColor 6%, transparent)",
      }}
    >
      {partner.name || "Partner"}
    </span>
  );

  return partner.href ? (
    <a
      href={partner.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
      aria-label={partner.name || "Partner"}
    >
      {inner}
    </a>
  ) : (
    <div>{inner}</div>
  );
}

/**
 * Marquee — CSS-only horizontal scroll. The track is rendered twice
 * back-to-back so the animation can loop seamlessly. Pauses on hover.
 */
function Marquee({
  partners,
  grayscale,
}: {
  partners: z.infer<typeof PartnerSchema>[];
  grayscale: boolean;
}) {
  const items = [...partners, ...partners]; // duplicate for seamless loop

  return (
    <div
      className="group relative overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
      }}
    >
      <div
        className="flex shrink-0 items-center gap-12"
        style={{
          animation: "jw-marquee 36s linear infinite",
          animationPlayState: "running",
        }}
      >
        {items.map((p, i) => (
          <div key={i} className="w-40 shrink-0 sm:w-48">
            <PartnerLogo partner={p} grayscale={grayscale} />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes jw-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .group:hover [style*="jw-marquee"] {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
}
