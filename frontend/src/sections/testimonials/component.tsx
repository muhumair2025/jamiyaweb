"use client";

import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import type { SectionComponentProps } from "@/engine/component-registry";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";
import { getImageUrl, imageValueSchema } from "@/engine/image-value";
import { nullSafeString } from "../_helpers";

/**
 * Testimonials — eyebrow + heading + repeater of testimonials.
 *
 * Layout choices:
 *   - "grid"     → cards in a 1-or-2-up grid (best for ≤ 4 testimonials)
 *   - "carousel" → one-at-a-time with dot pagination + arrow controls
 *
 * Each testimonial: { quote, author, role, avatar }
 */

const TestimonialSchema = z.object({
  quote: nullSafeString(""),
  author: nullSafeString(""),
  role: nullSafeString(""),
  avatar: imageValueSchema,
});

export const TestimonialsSchema = z.object({
  eyebrow: nullSafeString(""),
  heading: nullSafeString("What people are saying"),
  layout: z.enum(["grid", "carousel"]).catch("carousel").default("carousel"),
  testimonials: z.array(TestimonialSchema).default([]),
});

export type TestimonialsSettings = z.infer<typeof TestimonialsSchema>;

export default function Testimonials({
  settings,
}: SectionComponentProps<TestimonialsSettings>) {
  const safe = TestimonialsSchema.parse(settings);

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
        className="mx-auto max-w-5xl"
      >
        <header className="mx-auto max-w-2xl text-center">
          {safe.eyebrow && (
            <EngineElement
              el="eyebrow"
              kind="text"
              as="p"
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: tokenVar("color.primary") }}
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
                fontSize: "calc(2rem * var(--jw-section-heading-scale, 1))",
              }}
            >
              {safe.heading}
            </EngineElement>
          )}
        </header>

        <div className="mt-10">
          {safe.layout === "grid" ? (
            <Grid testimonials={safe.testimonials} />
          ) : (
            <Carousel testimonials={safe.testimonials} />
          )}
        </div>
      </EngineElement>
    </EngineElement>
  );
}

// ────────────────────────────────────────────────────────────────────────

type T = z.infer<typeof TestimonialSchema>;

function Grid({ testimonials }: { testimonials: T[] }) {
  if (testimonials.length === 0) return null;
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {testimonials.map((t, i) => (
        <TestimonialCard key={i} testimonial={t} />
      ))}
    </div>
  );
}

function Carousel({ testimonials }: { testimonials: T[] }) {
  const [active, setActive] = useState(0);
  const total = testimonials.length;
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-advance every 7s when not hovered
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || total < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % total), 7000);
    return () => clearInterval(t);
  }, [paused, total]);

  if (total === 0) return null;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative"
    >
      <div className="overflow-hidden rounded-3xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {testimonials.map((t, i) => (
            <div key={i} className="w-full shrink-0 px-1">
              <TestimonialCard testimonial={t} large />
            </div>
          ))}
        </div>
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => setActive((i) => (i - 1 + total) % total)}
            aria-label="Previous"
            className="absolute -start-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface shadow-card transition-colors hover:border-brand/40 sm:-start-4"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => setActive((i) => (i + 1) % total)}
            aria-label="Next"
            className="absolute -end-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface shadow-card transition-colors hover:border-brand/40 sm:-end-4"
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </button>

          <div className="mt-5 flex justify-center gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: active === i ? "24px" : "8px",
                  background:
                    active === i
                      ? tokenVar("color.primary")
                      : "rgba(0,0,0,0.2)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TestimonialCard({
  testimonial,
  large,
}: {
  testimonial: T;
  large?: boolean;
}) {
  return (
    <article
      className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8"
      style={{ borderColor: "rgba(0,0,0,0.08)" }}
    >
      <Quote
        className="h-6 w-6"
        style={{ color: tokenVar("color.accent") }}
        aria-hidden
      />
      <p
        className={`mt-3 leading-relaxed ${large ? "text-lg sm:text-xl" : "text-base"}`}
        style={{ fontFamily: "var(--jw-font-body, inherit)" }}
      >
        {testimonial.quote || "—"}
      </p>
      <div className="mt-5 flex items-center gap-3">
        {(() => {
          const avatarUrl = getImageUrl(testimonial.avatar);
          return avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={testimonial.author}
              className="h-11 w-11 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
              style={{ background: tokenVar("color.primary") }}
              aria-hidden
            >
              {(testimonial.author || "?").charAt(0).toUpperCase()}
            </div>
          );
        })()}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {testimonial.author}
          </p>
          {testimonial.role && (
            <p className="truncate text-xs opacity-70">{testimonial.role}</p>
          )}
        </div>
      </div>
    </article>
  );
}
