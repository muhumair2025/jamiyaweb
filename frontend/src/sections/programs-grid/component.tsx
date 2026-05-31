import { z } from "zod";
import { ArrowRight, Heart } from "lucide-react";
import type { SectionComponentProps } from "@/engine/component-registry";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";
import {
  cssBackgroundPosition,
  cssBackgroundSize,
  imageValueSchema,
  resolveImage,
} from "@/engine/image-value";
import { nullSafeNumber, nullSafeString } from "../_helpers";

/**
 * Programs grid — eyebrow + heading + N program cards.
 *
 * Supports two display modes:
 *   • card     — classic image-led card with title, description, link
 *   • project  — donation-style card with raised amount, progress bar,
 *                and a strong "Donate now" CTA (Saudi welfare convention)
 *
 * Per-program fields (some only used in project mode):
 *   image, title, description, link_label, link_href,
 *   raised, goal, currency, donate_label, donate_href
 *
 * Element ids:
 *   • background, container, eyebrow, heading, subheading, grid
 */

const ProgramSchema = z.object({
  image: imageValueSchema,
  title: nullSafeString("Program title"),
  description: nullSafeString(""),
  link_label: nullSafeString(""),
  link_href: nullSafeString("#"),
  // ─ Project-mode only ─
  raised: nullSafeNumber(0),
  goal: nullSafeNumber(0),
  currency: nullSafeString(""),
  donate_label: nullSafeString(""),
  donate_href: nullSafeString(""),
});

export const ProgramsGridSchema = z.object({
  eyebrow: nullSafeString(""),
  heading: nullSafeString("Our programs"),
  subheading: nullSafeString(""),
  columns: z.enum(["2", "3", "4"]).catch("3").default("3"),
  mode: z.enum(["card", "project"]).catch("card").default("card"),
  programs: z.array(ProgramSchema).default([]),
});

export type ProgramsGridSettings = z.infer<typeof ProgramsGridSchema>;

const COL_CLASS: Record<ProgramsGridSettings["columns"], string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

export default function ProgramsGrid({
  settings,
}: SectionComponentProps<ProgramsGridSettings>) {
  const safe = ProgramsGridSchema.parse(settings);

  return (
    <EngineElement
      el="background"
      kind="background"
      as="section"
      className="px-6 py-16 sm:py-20"
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
              className="mt-4 text-balance font-semibold tracking-tight"
              style={{
                fontFamily: "var(--jw-font-heading, inherit)",
                color: "var(--jw-section-heading, inherit)",
                fontSize:
                  "calc(clamp(1.85rem, 2.5vw + 1rem, 2.6rem) * var(--jw-section-heading-scale, 1))",
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
              className="mt-4 opacity-75"
              style={{
                fontSize: "calc(1rem * var(--jw-section-body-scale, 1))",
              }}
            >
              {safe.subheading}
            </EngineElement>
          )}
        </header>

        {safe.programs.length > 0 && (
          <EngineElement
            el="grid"
            kind="container"
            className={`mt-12 grid gap-6 ${COL_CLASS[safe.columns]}`}
          >
            {safe.programs.map((program, i) =>
              safe.mode === "project" ? (
                <ProjectCard key={i} program={program} />
              ) : (
                <ProgramCard key={i} program={program} />
              )
            )}
          </EngineElement>
        )}
      </EngineElement>
    </EngineElement>
  );
}

// ─── card mode ──────────────────────────────────────────────────────────

function ProgramCard({
  program,
}: {
  program: z.infer<typeof ProgramSchema>;
}) {
  const image = resolveImage(program.image);

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.18)]"
      style={{ borderColor: "rgba(0,0,0,0.07)" }}
    >
      <div
        className="aspect-[4/3] w-full overflow-hidden bg-foreground/5"
        style={{
          background: image
            ? `url("${image.url}") ${cssBackgroundPosition(
                image.position
              )} / ${cssBackgroundSize(image.fit)} no-repeat`
            : `linear-gradient(135deg, ${tokenVar("color.primary")} 0%, ${tokenVar("color.accent")} 100%)`,
        }}
      />

      <div className="flex flex-1 flex-col p-5">
        <h3
          className="text-base font-semibold leading-snug"
          style={{
            fontFamily: "var(--jw-font-heading, inherit)",
            color: "var(--jw-section-heading, inherit)",
          }}
        >
          {program.title}
        </h3>
        {program.description && (
          <p className="mt-2 flex-1 text-sm leading-relaxed opacity-80">
            {program.description}
          </p>
        )}
        {program.link_label && program.link_href && (
          <a
            href={program.link_href}
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
            style={{ color: tokenVar("color.primary") }}
          >
            {program.link_label}
            <span className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5">
              →
            </span>
          </a>
        )}
      </div>
    </article>
  );
}

// ─── project mode ───────────────────────────────────────────────────────

function ProjectCard({
  program,
}: {
  program: z.infer<typeof ProgramSchema>;
}) {
  const image = resolveImage(program.image);
  const goal = program.goal > 0 ? program.goal : 0;
  const raised = Math.max(0, program.raised);
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const currency = program.currency || "";

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-14px_rgba(0,0,0,0.22)]"
      style={{ borderColor: "rgba(0,0,0,0.07)" }}
    >
      <div className="relative">
        <div
          className="aspect-[4/3] w-full overflow-hidden bg-foreground/5"
          style={{
            background: image
              ? `url("${image.url}") ${cssBackgroundPosition(
                  image.position
                )} / ${cssBackgroundSize(image.fit)} no-repeat`
              : `linear-gradient(135deg, ${tokenVar(
                  "color.primary"
                )} 0%, ${tokenVar("color.accent")} 100%)`,
          }}
        />
        {/* % chip — top corner, gives the donation feel */}
        {goal > 0 && (
          <span
            className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-white shadow-md backdrop-blur"
            style={{
              background: `color-mix(in srgb, ${tokenVar(
                "color.primary"
              )} 88%, transparent)`,
            }}
          >
            <Heart className="h-3 w-3" fill="currentColor" />
            {pct}% funded
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3
          className="text-base font-semibold leading-snug"
          style={{
            fontFamily: "var(--jw-font-heading, inherit)",
            color: "var(--jw-section-heading, inherit)",
          }}
        >
          {program.title}
        </h3>
        {program.description && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed opacity-80">
            {program.description}
          </p>
        )}

        {/* Progress bar */}
        {goal > 0 && (
          <div className="mt-4">
            <div
              className="h-2 w-full overflow-hidden rounded-full"
              style={{
                background: "color-mix(in srgb, currentColor 8%, transparent)",
              }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${tokenVar(
                    "color.accent"
                  )}, color-mix(in srgb, ${tokenVar(
                    "color.accent"
                  )} 70%, ${tokenVar("color.primary")}))`,
                }}
              />
            </div>
            <div className="mt-2 flex items-baseline justify-between text-[11px] font-medium opacity-80">
              <span>
                <span className="font-semibold" style={{ color: tokenVar("color.primary") }}>
                  {currency}
                  {formatNumber(raised)}
                </span>{" "}
                raised
              </span>
              <span className="opacity-70">
                of {currency}
                {formatNumber(goal)}
              </span>
            </div>
          </div>
        )}

        {/* CTAs — donate primary, "learn more" secondary */}
        <div className="mt-4 flex items-center gap-2">
          {program.donate_label && (
            <a
              href={program.donate_href || "#"}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full px-4 text-[12.5px] font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
              style={{ background: tokenVar("color.accent") }}
            >
              {program.donate_label}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </a>
          )}
          {program.link_label && program.link_href && (
            <a
              href={program.link_href}
              className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-[12px] font-semibold transition-colors hover:bg-foreground/5"
              style={{ color: tokenVar("color.primary") }}
            >
              {program.link_label}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}
