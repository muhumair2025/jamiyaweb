"use client";

import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Heart, Sparkles, TrendingUp } from "lucide-react";
import type { SectionComponentProps } from "@/engine/component-registry";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";
import { nullSafeNumber, nullSafeString } from "../_helpers";

/**
 * Donation widget — campaign card with goal + raised progress bar +
 * quick-pick amounts + donate button.
 *
 * Donations infra (payment gateway, real-time progress) hooks in later —
 * for now `raised` is a static authored value the editor sets. Once the
 * payments backend ships, swap to a `useDonationCampaign(campaignId)` hook
 * that fetches live totals.
 *
 * Element ids:
 *   • background    (kind: background)
 *   • container     (kind: container)
 *   • eyebrow       (kind: text)
 *   • heading       (kind: heading)
 *   • description   (kind: text)
 *   • progress      (kind: container) — progress bar wrapper
 *   • cta           (kind: button)
 */

export const DonationWidgetSchema = z.object({
  eyebrow: nullSafeString("Active campaign"),
  heading: nullSafeString("Help us reach our goal"),
  description: nullSafeString(""),
  currency: nullSafeString("PKR"),
  goal: nullSafeNumber(1000000),
  raised: nullSafeNumber(0),
  cta_label: nullSafeString("Donate now"),
  cta_href: nullSafeString("#donate"),
  layout: z.enum(["card", "banner"]).catch("card").default("card"),
  /** Suggested amounts as a comma-separated string in the schema; parsed
   *  to numbers at render time. */
  quick_amounts: nullSafeString("500, 1000, 5000, 10000"),
});

export type DonationWidgetSettings = z.infer<typeof DonationWidgetSchema>;

export default function DonationWidget({
  settings,
}: SectionComponentProps<DonationWidgetSettings>) {
  const safe = DonationWidgetSchema.parse(settings);

  const goal = Math.max(1, safe.goal);
  const raised = Math.max(0, Math.min(goal, safe.raised));
  const pct = Math.round((raised / goal) * 100);

  const quickAmounts = safe.quick_amounts
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
    .slice(0, 6);

  const isBanner = safe.layout === "banner";

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
        className={`mx-auto ${isBanner ? "max-w-5xl" : "max-w-2xl"}`}
      >
        <div
          className={`relative overflow-hidden rounded-3xl border bg-white shadow-card ${
            isBanner ? "grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center" : "p-6 sm:p-8"
          }`}
          style={{ borderColor: "rgba(0,0,0,0.08)" }}
        >
          {/* Brand stripe */}
          <span
            className="absolute inset-x-0 top-0 h-1.5"
            style={{
              background: `linear-gradient(90deg, ${tokenVar("color.primary")} 0%, ${tokenVar("color.accent")} 100%)`,
            }}
            aria-hidden
          />

          <div className="min-w-0">
            {safe.eyebrow && (
              <EngineElement
                el="eyebrow"
                kind="text"
                as="span"
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"
                style={{
                  background: `color-mix(in srgb, ${tokenVar("color.accent")} 18%, transparent)`,
                  color: tokenVar("color.accent"),
                }}
              >
                <Sparkles className="h-3 w-3" />
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
                  fontSize: "calc(1.875rem * var(--jw-section-heading-scale, 1))",
                }}
              >
                {safe.heading}
              </EngineElement>
            )}

            {safe.description && (
              <EngineElement
                el="description"
                kind="text"
                as="p"
                className="mt-3 leading-relaxed opacity-80"
                style={{
                  fontFamily: "var(--jw-font-body, inherit)",
                  fontSize: "calc(1rem * var(--jw-section-body-scale, 1))",
                }}
              >
                {safe.description}
              </EngineElement>
            )}

            {/* Progress */}
            <EngineElement
              el="progress"
              kind="container"
              className="mt-5"
            >
              <div className="flex items-end justify-between text-sm">
                <p>
                  <span
                    className="text-2xl font-bold tracking-tight"
                    style={{
                      color: tokenVar("color.primary"),
                      fontFamily: "var(--jw-font-heading, inherit)",
                    }}
                  >
                    {formatCurrency(raised, safe.currency)}
                  </span>
                  <span className="ms-1 text-xs opacity-70">
                    raised of {formatCurrency(goal, safe.currency)}
                  </span>
                </p>
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold"
                  style={{ color: tokenVar("color.primary") }}
                >
                  <TrendingUp className="h-3 w-3" />
                  {pct}%
                </span>
              </div>
              <ProgressBar pct={pct} />
            </EngineElement>

            {/* Quick amounts */}
            {quickAmounts.length > 0 && !isBanner && (
              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-widest opacity-70">
                  Quick amounts
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {quickAmounts.map((amount) => (
                    <a
                      key={amount}
                      href={`${safe.cta_href}?amount=${amount}`}
                      className="rounded-full border bg-surface px-3 py-1.5 text-sm font-semibold transition-colors hover:border-current"
                      style={{ borderColor: "rgba(0,0,0,0.12)" }}
                    >
                      {formatCurrency(amount, safe.currency)}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          {safe.cta_label && (
            <div className={isBanner ? "" : "mt-6"}>
              <EngineElement
                el="cta"
                kind="button"
                as="a"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] sm:w-auto"
                style={{
                  background: tokenVar("color.accent"),
                }}
                {...({ href: safe.cta_href } as object)}
              >
                <Heart className="h-4 w-4" />
                {safe.cta_label}
              </EngineElement>
            </div>
          )}
        </div>
      </EngineElement>
    </EngineElement>
  );
}

// ────────────────────────────────────────────────────────────────────────

/** Animates the bar fill in once it scrolls into view. */
function ProgressBar({ pct }: { pct: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setAnimatedPct(pct);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setAnimatedPct(pct);
          observer.disconnect();
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [pct]);

  return (
    <div
      ref={ref}
      className="mt-2 h-2.5 w-full overflow-hidden rounded-full"
      style={{ background: "rgba(0,0,0,0.06)" }}
    >
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `${animatedPct}%`,
          background: `linear-gradient(90deg, ${tokenVar("color.primary")} 0%, ${tokenVar("color.accent")} 100%)`,
        }}
      />
    </div>
  );
}

function formatCurrency(amount: number, currency: string): string {
  // Avoid Intl.NumberFormat's currency mode (locale-specific glyphs) — we
  // want the editor's chosen currency code rendered as-is.
  return `${currency} ${amount.toLocaleString("en-US")}`;
}
