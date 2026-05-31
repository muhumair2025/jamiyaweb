import { z } from "zod";
import {
  Heart,
  HandHeart,
  BookOpen,
  Users,
  Sparkles,
  Award,
  Globe,
  Compass,
  Star,
  Calendar,
  GraduationCap,
  Home as HomeIcon,
  Briefcase,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";
import type { SectionComponentProps } from "@/engine/component-registry";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";
import { nullSafeString } from "../_helpers";

/**
 * Service pillars — the "خدماتنا" pattern that appears on every Saudi
 * welfare site: 4 columns of icon → title → short description cards.
 *
 * Three visual styles:
 *   • cards    — bordered, white card with soft shadow (default; institutional)
 *   • minimal  — no card chrome, just icon + text in a column
 *   • boxed    — solid brand-tinted background, white icon disc on top
 *
 * Element ids:
 *   • background, container, eyebrow, heading, subheading, grid
 *
 * Each pillar exposes the same field shape; per-pillar EngineElement ids
 * use the slot index (so styling pillar 1's title only affects pillar 1).
 */

const ICON_OPTIONS = [
  "Sparkles",
  "Heart",
  "HandHeart",
  "Award",
  "BookOpen",
  "Users",
  "Globe",
  "Compass",
  "Star",
  "Calendar",
  "GraduationCap",
  "Home",
  "Briefcase",
  "HeartHandshake",
] as const;

const ICONS: Record<(typeof ICON_OPTIONS)[number], LucideIcon> = {
  Sparkles,
  Heart,
  HandHeart,
  Award,
  BookOpen,
  Users,
  Globe,
  Compass,
  Star,
  Calendar,
  GraduationCap,
  Home: HomeIcon,
  Briefcase,
  HeartHandshake,
};

const PillarSchema = z.object({
  icon: z.enum(ICON_OPTIONS).catch("Sparkles").default("Sparkles"),
  title: nullSafeString("Service"),
  description: nullSafeString(""),
  link_label: nullSafeString(""),
  link_href: nullSafeString("#"),
});

export const ServicePillarsSchema = z.object({
  eyebrow: nullSafeString(""),
  heading: nullSafeString("What we offer"),
  subheading: nullSafeString(""),
  columns: z.enum(["2", "3", "4"]).catch("4").default("4"),
  style: z.enum(["cards", "minimal", "boxed"]).catch("cards").default("cards"),
  pillars: z.array(PillarSchema).default([]),
});

export type ServicePillarsSettings = z.infer<typeof ServicePillarsSchema>;

const COL_CLASS: Record<ServicePillarsSettings["columns"], string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

export default function ServicePillars({
  settings,
}: SectionComponentProps<ServicePillarsSettings>) {
  const safe = ServicePillarsSchema.parse(settings);

  return (
    <EngineElement
      el="background"
      kind="background"
      as="section"
      className="px-6 py-16 sm:py-20 lg:py-24"
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
                fontFamily: "var(--jw-font-body, inherit)",
                fontSize: "calc(1.05rem * var(--jw-section-body-scale, 1))",
              }}
            >
              {safe.subheading}
            </EngineElement>
          )}
        </header>

        {safe.pillars.length > 0 && (
          <EngineElement
            el="grid"
            kind="container"
            className={`mt-12 grid gap-5 ${COL_CLASS[safe.columns]}`}
          >
            {safe.pillars.map((pillar, i) => (
              <PillarCard
                key={i}
                index={i}
                pillar={pillar}
                style={safe.style}
              />
            ))}
          </EngineElement>
        )}
      </EngineElement>
    </EngineElement>
  );
}

// ────────────────────────────────────────────────────────────────────────

function PillarCard({
  pillar,
  style,
  index,
}: {
  pillar: z.infer<typeof PillarSchema>;
  style: ServicePillarsSettings["style"];
  index: number;
}) {
  const Icon = ICONS[pillar.icon] ?? Sparkles;
  const slot = index + 1;

  if (style === "boxed") {
    return (
      <EngineElement
        el={`pillar_${slot}_card`}
        kind="container"
        as="article"
        className="group flex flex-col items-start rounded-2xl p-6 transition-all"
        style={{
          background: `color-mix(in srgb, ${tokenVar("color.primary")} 92%, #000)`,
          color: "#fff",
        }}
      >
        <EngineElement
          el={`pillar_${slot}_icon`}
          kind="icon"
          as="span"
          className="inline-flex h-12 w-12 items-center justify-center rounded-xl"
          style={{
            background: tokenVar("color.accent"),
            color: "#fff",
          }}
        >
          <Icon className="h-6 w-6" />
        </EngineElement>

        <EngineElement
          el={`pillar_${slot}_title`}
          kind="heading"
          as="h3"
          className="mt-5 text-lg font-semibold leading-snug"
          style={{ fontFamily: "var(--jw-font-heading, inherit)" }}
        >
          {pillar.title}
        </EngineElement>

        {pillar.description && (
          <EngineElement
            el={`pillar_${slot}_desc`}
            kind="text"
            as="p"
            className="mt-2 text-sm leading-relaxed opacity-80"
          >
            {pillar.description}
          </EngineElement>
        )}

        {pillar.link_label && (
          <EngineElement
            el={`pillar_${slot}_link`}
            kind="button"
            as="a"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider"
            style={{ color: tokenVar("color.accent") }}
            {...({ href: pillar.link_href || "#" } as object)}
          >
            {pillar.link_label}
            <span className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5">
              →
            </span>
          </EngineElement>
        )}
      </EngineElement>
    );
  }

  if (style === "minimal") {
    return (
      <EngineElement
        el={`pillar_${slot}_card`}
        kind="container"
        as="article"
        className="group flex flex-col items-start"
      >
        <EngineElement
          el={`pillar_${slot}_icon`}
          kind="icon"
          as="span"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            background: `color-mix(in srgb, ${tokenVar("color.accent")} 14%, transparent)`,
            color: tokenVar("color.accent"),
          }}
        >
          <Icon className="h-6 w-6" />
        </EngineElement>

        <EngineElement
          el={`pillar_${slot}_title`}
          kind="heading"
          as="h3"
          className="mt-5 text-lg font-semibold leading-snug"
          style={{
            fontFamily: "var(--jw-font-heading, inherit)",
            color: "var(--jw-section-heading, inherit)",
          }}
        >
          {pillar.title}
        </EngineElement>

        {pillar.description && (
          <EngineElement
            el={`pillar_${slot}_desc`}
            kind="text"
            as="p"
            className="mt-2 text-sm leading-relaxed opacity-75"
          >
            {pillar.description}
          </EngineElement>
        )}

        {pillar.link_label && (
          <EngineElement
            el={`pillar_${slot}_link`}
            kind="button"
            as="a"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider"
            style={{ color: tokenVar("color.primary") }}
            {...({ href: pillar.link_href || "#" } as object)}
          >
            {pillar.link_label}
            <span className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5">
              →
            </span>
          </EngineElement>
        )}
      </EngineElement>
    );
  }

  // default: cards
  return (
    <EngineElement
      el={`pillar_${slot}_card`}
      kind="container"
      as="article"
      className="group relative flex flex-col items-start rounded-2xl border bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.18)]"
      style={{ borderColor: "rgba(0,0,0,0.07)" }}
    >
      {/* Brand-accent top edge on hover — subtle institutional touch */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-start scale-x-0 rounded-t-2xl transition-transform duration-500 group-hover:scale-x-100"
        style={{ background: tokenVar("color.accent") }}
      />

      <EngineElement
        el={`pillar_${slot}_icon`}
        kind="icon"
        as="span"
        className="inline-flex h-12 w-12 items-center justify-center rounded-xl"
        style={{
          background: `color-mix(in srgb, ${tokenVar("color.primary")} 10%, transparent)`,
          color: tokenVar("color.primary"),
        }}
      >
        <Icon className="h-6 w-6" />
      </EngineElement>

      <EngineElement
        el={`pillar_${slot}_title`}
        kind="heading"
        as="h3"
        className="mt-5 text-lg font-semibold leading-snug"
        style={{
          fontFamily: "var(--jw-font-heading, inherit)",
          color: "var(--jw-section-heading, inherit)",
        }}
      >
        {pillar.title}
      </EngineElement>

      {pillar.description && (
        <EngineElement
          el={`pillar_${slot}_desc`}
          kind="text"
          as="p"
          className="mt-2 flex-1 text-sm leading-relaxed opacity-75"
        >
          {pillar.description}
        </EngineElement>
      )}

      {pillar.link_label && (
        <EngineElement
          el={`pillar_${slot}_link`}
          kind="button"
          as="a"
          className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors"
          style={{ color: tokenVar("color.primary") }}
          {...({ href: pillar.link_href || "#" } as object)}
        >
          {pillar.link_label}
          <span className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5">
            →
          </span>
        </EngineElement>
      )}
    </EngineElement>
  );
}
