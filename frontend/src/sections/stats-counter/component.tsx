"use client";

import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import type { SectionComponentProps } from "@/engine/component-registry";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";
import { nullSafeNumber, nullSafeString } from "../_helpers";

/**
 * Stats counter — eyebrow + heading + grid of animated stats.
 *
 * Each stat: { number, suffix?, label, description? }
 * Numbers animate from 0 → target when the section scrolls into view.
 *
 * Element ids:
 *   • background   (kind: background)
 *   • container    (kind: container)
 *   • eyebrow      (kind: text)
 *   • heading      (kind: heading)
 *   • stats_grid   (kind: container) — the grid wrapper
 */

const StatSchema = z.object({
  number: nullSafeNumber(0),
  suffix: nullSafeString(""),
  label: nullSafeString(""),
  description: nullSafeString(""),
});

export const StatsCounterSchema = z.object({
  eyebrow: nullSafeString(""),
  heading: nullSafeString("Our impact"),
  subheading: nullSafeString(""),
  layout: z.enum(["cards", "minimal", "ribbon"]).catch("minimal").default("minimal"),
  stats: z.array(StatSchema).default([]),
});

export type StatsCounterSettings = z.infer<typeof StatsCounterSchema>;

export default function StatsCounter({
  settings,
}: SectionComponentProps<StatsCounterSettings>) {
  const safe = StatsCounterSchema.parse(settings);

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
        className="mx-auto max-w-6xl text-center"
      >
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
          <p
            className="mx-auto mt-4 max-w-2xl opacity-75"
            style={{
              fontFamily: "var(--jw-font-body, inherit)",
              fontSize: "calc(1.05rem * var(--jw-section-body-scale, 1))",
            }}
          >
            {safe.subheading}
          </p>
        )}

        {safe.stats.length > 0 && (
          <EngineElement
            el="stats_grid"
            kind="container"
            className={
              safe.layout === "ribbon"
                ? "mt-12 grid divide-x divide-current/10 overflow-hidden rounded-2xl border border-current/10 bg-white shadow-sm sm:grid-cols-2 md:grid-cols-4 rtl:divide-x-reverse"
                : "mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            }
          >
            {safe.stats.map((stat, i) => (
              <StatCard
                key={i}
                stat={stat}
                index={i}
                layout={safe.layout}
              />
            ))}
          </EngineElement>
        )}
      </EngineElement>
    </EngineElement>
  );
}

// ────────────────────────────────────────────────────────────────────────

function StatCard({
  stat,
  index,
  layout,
}: {
  stat: z.infer<typeof StatSchema>;
  index: number;
  layout: StatsCounterSettings["layout"];
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  // Animate when scrolled into view (once per mount). Uses
  // IntersectionObserver so we don't pay anything when offscreen.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const value = useCountUp(visible ? stat.number : 0, 1500, index * 120);

  const containerClass =
    layout === "cards"
      ? "rounded-2xl border bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      : layout === "ribbon"
        ? "px-6 py-8"
        : "px-2 py-4";

  const containerBorder =
    layout === "cards" ? "rgba(0,0,0,0.07)" : undefined;

  return (
    <div
      ref={ref}
      className={`group flex flex-col items-center text-center transition-all duration-700 ${containerClass}`}
      style={{
        borderColor: containerBorder,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <p
        className="flex items-baseline justify-center font-semibold leading-none tracking-tight"
        style={{
          color: tokenVar("color.primary"),
          fontFamily: "var(--jw-font-heading, inherit)",
          fontSize:
            "calc(clamp(2.5rem, 3.2vw + 1rem, 3.75rem) * var(--jw-section-heading-scale, 1))",
          letterSpacing: "-0.03em",
        }}
      >
        {formatNumber(value)}
        {stat.suffix && (
          <span
            className="ms-1 text-[0.55em] font-bold"
            style={{ color: tokenVar("color.accent") }}
          >
            {stat.suffix}
          </span>
        )}
      </p>

      {/* Gold underline — the signature welfare-site detail */}
      <span
        aria-hidden
        className="mt-3 block h-[2px] w-8 rounded-full transition-all group-hover:w-12"
        style={{ background: tokenVar("color.accent") }}
      />

      {stat.label && (
        <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] opacity-80">
          {stat.label}
        </p>
      )}
      {stat.description && (
        <p className="mt-1.5 max-w-[20ch] text-xs leading-relaxed opacity-60">
          {stat.description}
        </p>
      )}
    </div>
  );
}

/** Lerp from 0 to `target` over `duration` ms after `delay` ms.
 *  Returns the current frame value so React re-renders on each tick. */
function useCountUp(target: number, duration: number, delay: number): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    let frame = 0;
    let start: number | null = null;
    let cancelled = false;

    const tick = (now: number) => {
      if (cancelled) return;
      if (start === null) start = now;
      const elapsed = now - start - delay;
      if (elapsed < 0) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, elapsed / duration);
      // Ease-out cubic — feels snappy without overshoot
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [target, duration, delay]);

  return value;
}

/** Add thousands separators. `1234567` → `"1,234,567"`. */
function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}
