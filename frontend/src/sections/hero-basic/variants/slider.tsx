"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";
import {
  cssBackgroundPosition,
  cssBackgroundSize,
  resolveImage,
} from "@/engine/image-value";
import type { HeroBasicSettings, HeroSlide } from "../component";

/**
 * Slider hero — multi-slide carousel.
 *
 *  • Autoplay (configurable interval, pauses on hover / focus / touch).
 *  • Crossfade or horizontal slide transition (settings.transition).
 *  • Prev / next arrows + pagination dots.
 *  • RTL: arrows flip; dot order reads start→end naturally because flexbox
 *    direction follows `dir`.
 *  • Keyboard: ← / → step slides when the slider has focus.
 *  • Mobile: controls scale down, dots become tap-friendly.
 *  • If `settings.slides` is empty, falls back to a single synthetic slide
 *    built from the top-level fields — so the variant is always renderable.
 *
 * Element ids exposed to the editor (shared across slides — styling them
 * applies to every slide):
 *   • background, container, eyebrow, title, subtitle, cta
 */
export function HeroSlider({ settings }: { settings: HeroBasicSettings }) {
  // Build the effective slides list — fall back to a single slide derived
  // from the top-level settings when the user hasn't added any.
  const slides: HeroSlide[] = useMemo(() => {
    const explicit = settings.slides ?? [];
    if (explicit.length > 0) return explicit;
    return [
      {
        eyebrow: settings.eyebrow ?? "",
        title: settings.title ?? "",
        subtitle: settings.subtitle ?? "",
        cta_label: settings.cta_label ?? "",
        cta_href: settings.cta_href ?? "#",
        background_image: settings.background_image ?? null,
      },
    ];
  }, [settings]);

  const count = slides.length;
  const isCenter = settings.alignment === "center";
  const transition = settings.transition ?? "fade";
  const autoplay = settings.autoplay !== false;
  const intervalMs = Math.max(2000, settings.interval_ms ?? 5500);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const goTo = useCallback(
    (idx: number) => {
      if (count === 0) return;
      setActive(((idx % count) + count) % count);
    },
    [count]
  );
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  // Autoplay
  useEffect(() => {
    if (!autoplay || paused || count < 2) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % count);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [autoplay, paused, intervalMs, count]);

  // Keyboard nav — only when the slider (or a child) has focus
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return (
    <EngineElement
      el="background"
      kind="background"
      as="section"
      className="relative isolate overflow-hidden"
      style={{
        background: `var(--jw-section-bg, ${tokenVar("color.primary")})`,
        color: "var(--jw-section-text, #ffffff)",
      }}
    >
      <div
        ref={rootRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Hero slider"
        className="relative min-h-[88vh] outline-none lg:min-h-[92vh]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {/* Slides — absolutely stacked. Fade transition uses opacity; slide
            transition uses a horizontal translate on a track. */}
        {transition === "slide" ? (
          <div
            className="absolute inset-0 flex transition-transform duration-700 ease-[cubic-bezier(0.4,0.0,0.2,1)] rtl:flex-row-reverse"
            style={{
              width: `${count * 100}%`,
              transform: `translateX(${
                // In RTL the visual order is reversed by flex-row-reverse,
                // so we flip the translate direction too.
                (typeof document !== "undefined" &&
                document.documentElement.dir === "rtl"
                  ? active
                  : -active) * (100 / count)
              }%)`,
            }}
          >
            {slides.map((slide, i) => (
              <SlideContent
                key={i}
                slide={slide}
                isActive={i === active}
                isCenter={isCenter}
                inFlexTrack
                widthPct={100 / count}
              />
            ))}
          </div>
        ) : (
          slides.map((slide, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-700 ease-out"
              style={{
                opacity: i === active ? 1 : 0,
                pointerEvents: i === active ? "auto" : "none",
              }}
              aria-hidden={i !== active}
            >
              <SlideContent
                slide={slide}
                isActive={i === active}
                isCenter={isCenter}
              />
            </div>
          ))
        )}

        {/* Controls — prev / next arrows. Hidden on the smallest screens to
            keep the slide content breathing room; users can swipe / tap dots. */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous slide"
              className="absolute start-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-black/50 sm:inline-flex md:start-5"
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next slide"
              className="absolute end-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-black/50 sm:inline-flex md:end-5"
            >
              <ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </button>
          </>
        )}

        {/* Pagination dots — tap-friendly on mobile, subtle on desktop */}
        {count > 1 && (
          <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-center gap-2 sm:bottom-8">
            {slides.map((_, i) => {
              const isActiveDot = i === active;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={isActiveDot ? "true" : undefined}
                  className="group flex h-8 w-8 items-center justify-center"
                >
                  <span
                    className="block rounded-full transition-all"
                    style={{
                      width: isActiveDot ? "28px" : "8px",
                      height: "8px",
                      background: isActiveDot
                        ? tokenVar("color.accent")
                        : "rgba(255,255,255,0.55)",
                    }}
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* Autoplay progress bar — fills over `intervalMs` then resets */}
        {autoplay && !paused && count > 1 && (
          <div
            key={`${active}-${intervalMs}`}
            aria-hidden
            className="absolute inset-x-0 bottom-0 z-20 h-[3px] origin-start"
            style={{
              background: tokenVar("color.accent"),
              animation: `jw-slider-progress ${intervalMs}ms linear forwards`,
            }}
          />
        )}

        {/* Inline keyframes for the progress bar (scoped via the unique key). */}
        <style>{`@keyframes jw-slider-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
      </div>
    </EngineElement>
  );
}

// ─── Slide content ────────────────────────────────────────────────
// Renders one slide's image + text stack. All slides share the same
// EngineElement ids (eyebrow, title, subtitle, cta, container) so editing
// any of them in the builder applies the override to every slide.
function SlideContent({
  slide,
  isActive,
  isCenter,
  inFlexTrack = false,
  widthPct,
}: {
  slide: HeroSlide;
  isActive: boolean;
  isCenter: boolean;
  inFlexTrack?: boolean;
  widthPct?: number;
}) {
  const image = resolveImage(slide.background_image);

  return (
    <div
      className={
        inFlexTrack
          ? "relative h-full shrink-0"
          : "relative flex h-full w-full flex-col"
      }
      style={inFlexTrack && widthPct ? { width: `${widthPct}%` } : undefined}
      // The slide track uses inline-flex; restore vertical centering.
      {...(inFlexTrack ? { "data-jw-slide": "" } : {})}
    >
      {/* Slide background image — separate from EngineElement "background"
          (which wraps the whole section). Each slide carries its own
          picture + per-image fit/position from the Content tab. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: image
            ? `url("${image.url}") ${cssBackgroundPosition(
                image.position
              )} / ${cssBackgroundSize(image.fit)} no-repeat`
            : `linear-gradient(135deg, ${tokenVar(
                "color.primary"
              )} 0%, color-mix(in srgb, ${tokenVar(
                "color.primary"
              )} 60%, #000) 100%)`,
          // Slight ken-burns when the slide is active for cinematic motion.
          transform: isActive ? "scale(1.04)" : "scale(1)",
          transition: "transform 8s ease-out",
        }}
      />

      {/* Per-slide user overlay — picked in the slide's image options */}
      {image && image.overlay_color && image.overlay_opacity > 0 && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: image.overlay_color,
            opacity: image.overlay_opacity,
          }}
        />
      )}

      {/* Strong readable overlay — always on top of the per-slide overlay
          so the text remains legible even when the user picked a light tint */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 30%, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.8) 100%)",
        }}
      />

      {/* Content stack */}
      <div
        className={`relative z-10 flex h-full min-h-[88vh] w-full flex-col px-6 py-20 sm:py-24 lg:min-h-[92vh] ${
          isCenter ? "items-center justify-center text-center" : "justify-end"
        }`}
      >
        <EngineElement
          el="container"
          kind="container"
          className={`mx-auto w-full max-w-5xl ${
            isCenter ? "text-center" : "text-start"
          }`}
          style={{ fontFamily: `var(--jw-font-heading, inherit)` }}
        >
          {slide.eyebrow && (
            <EngineElement
              el="eyebrow"
              kind="text"
              as="span"
              className="inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.3em] opacity-90"
            >
              <span
                aria-hidden
                className="h-px w-8"
                style={{ background: tokenVar("color.accent") }}
              />
              {slide.eyebrow}
            </EngineElement>
          )}

          {slide.title && (
            <EngineElement
              el="title"
              kind="heading"
              as="h1"
              className="mt-5 text-balance font-semibold leading-[1] tracking-tight"
              style={{
                color: "var(--jw-section-heading, #ffffff)",
                fontSize:
                  "calc(clamp(2.5rem, 6vw + 0.5rem, 6rem) * var(--jw-section-heading-scale, 1))",
                letterSpacing: "-0.03em",
                textShadow: "0 2px 30px rgba(0,0,0,0.4)",
              }}
            >
              {slide.title}
            </EngineElement>
          )}

          {slide.subtitle && (
            <EngineElement
              el="subtitle"
              kind="text"
              as="p"
              className={`mt-5 max-w-2xl leading-relaxed opacity-90 ${
                isCenter ? "mx-auto" : ""
              }`}
              style={{
                fontFamily: `var(--jw-font-body, inherit)`,
                fontSize:
                  "calc(clamp(0.98rem, 0.3vw + 0.9rem, 1.15rem) * var(--jw-section-body-scale, 1))",
              }}
            >
              {slide.subtitle}
            </EngineElement>
          )}

          {slide.cta_label && (
            <div
              className={`mt-8 flex flex-wrap items-center gap-3 ${
                isCenter ? "justify-center" : "justify-start"
              }`}
            >
              <EngineElement
                el="cta"
                kind="button"
                as="a"
                className="group inline-flex h-12 items-center gap-2.5 rounded-full px-7 text-[13.5px] font-semibold tracking-wide shadow-[0_12px_36px_-10px_rgba(0,0,0,0.55)] transition-all hover:-translate-y-0.5"
                style={{
                  background: tokenVar("color.accent"),
                  color: "#fff",
                }}
                {...({ href: slide.cta_href || "#" } as object)}
              >
                {slide.cta_label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
              </EngineElement>
            </div>
          )}
        </EngineElement>
      </div>
    </div>
  );
}
