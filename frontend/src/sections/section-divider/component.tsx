import { z } from "zod";
import type { SectionComponentProps } from "@/engine/component-registry";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";
import { nullSafeString } from "../_helpers";

/**
 * Section divider — pure ornament between two real sections.
 *
 * The signature visual move of premium Saudi welfare/charity sites: a thin
 * gold horizontal rule with a small geometric flourish at the centre. Drop
 * it between hero → about, about → services, services → stats, etc., for
 * the editorial rhythm that distinguishes these sites from generic SaaS.
 *
 * Three styles:
 *   • ornament — gold hairline with an 8-point star motif at the centre
 *   • dots     — three small dots, very minimal
 *   • line     — single hairline, no motif
 *
 * Element ids:
 *   • background  (kind: background) — the section wrapper
 *   • ornament    (kind: icon)       — the central flourish (when present)
 */

export const SectionDividerSchema = z.object({
  style: z.enum(["ornament", "dots", "line"]).catch("ornament").default("ornament"),
  width: z.enum(["narrow", "normal", "wide", "full"]).catch("normal").default("normal"),
  color: nullSafeString(""), // empty → use color.accent token
});

export type SectionDividerSettings = z.infer<typeof SectionDividerSchema>;

const WIDTH_CLASS: Record<SectionDividerSettings["width"], string> = {
  narrow: "max-w-md",
  normal: "max-w-2xl",
  wide: "max-w-4xl",
  full: "max-w-6xl",
};

export default function SectionDivider({
  settings,
}: SectionComponentProps<SectionDividerSettings>) {
  const safe = SectionDividerSchema.parse(settings);
  const accent = safe.color || tokenVar("color.accent");

  return (
    <EngineElement
      el="background"
      kind="background"
      as="section"
      className="px-6 py-10 sm:py-12"
      style={{
        background: `var(--jw-section-bg, transparent)`,
      }}
    >
      <div className={`mx-auto flex items-center gap-4 ${WIDTH_CLASS[safe.width]}`}>
        {/* Left hairline */}
        <span
          aria-hidden
          className="block h-px flex-1"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent} 80%, ${accent})`,
            opacity: 0.55,
          }}
        />

        {/* Centre motif */}
        {safe.style === "ornament" ? (
          <EngineElement
            el="ornament"
            kind="icon"
            as="span"
            className="inline-flex shrink-0 items-center justify-center"
            style={{ color: accent }}
          >
            <OrnamentStar />
          </EngineElement>
        ) : safe.style === "dots" ? (
          <EngineElement
            el="ornament"
            kind="icon"
            as="span"
            className="inline-flex shrink-0 items-center gap-1.5"
            style={{ color: accent }}
          >
            <span className="block h-1 w-1 rounded-full bg-current opacity-50" />
            <span className="block h-1.5 w-1.5 rounded-full bg-current" />
            <span className="block h-1 w-1 rounded-full bg-current opacity-50" />
          </EngineElement>
        ) : null}

        {/* Right hairline */}
        <span
          aria-hidden
          className="block h-px flex-1"
          style={{
            background: `linear-gradient(90deg, ${accent}, ${accent} 20%, transparent)`,
            opacity: 0.55,
          }}
        />
      </div>
    </EngineElement>
  );
}

/**
 * 8-point geometric star — the welfare-site classic. Stays sharp at any
 * size; pure CSS would alias on hairlines, so we ship it as inline SVG.
 */
function OrnamentStar() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Outer 8-point — two overlapping squares rotated 45° */}
      <rect x="5" y="5" width="14" height="14" />
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        transform="rotate(45 12 12)"
      />
      {/* Centre dot */}
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
