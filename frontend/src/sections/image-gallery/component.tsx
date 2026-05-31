"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { X } from "lucide-react";
import type { SectionComponentProps } from "@/engine/component-registry";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";
import { getImageUrl, imageValueSchema } from "@/engine/image-value";
import { nullSafeString } from "../_helpers";

/**
 * Image gallery — eyebrow + heading + responsive grid of images, with
 * click-to-zoom lightbox. Each image: { image, caption, alt }
 *
 * Layout options:
 *   • "grid"    → uniform 3-column responsive grid (1/2/3 by breakpoint)
 *   • "masonry" → CSS columns for organic, photo-essay feel
 *
 * Element ids:
 *   • background  (kind: background)
 *   • container   (kind: container)
 *   • eyebrow     (kind: text)
 *   • heading     (kind: heading)
 *   • subheading  (kind: text)
 *   • grid        (kind: container)
 */

const GalleryItemSchema = z.object({
  image: imageValueSchema,
  caption: nullSafeString(""),
  alt: nullSafeString(""),
});

export const ImageGallerySchema = z.object({
  eyebrow: nullSafeString(""),
  heading: nullSafeString("Photo essay"),
  subheading: nullSafeString(""),
  layout: z.enum(["grid", "masonry"]).catch("grid").default("grid"),
  images: z.array(GalleryItemSchema).default([]),
});

export type ImageGallerySettings = z.infer<typeof ImageGallerySchema>;

type GalleryItem = z.infer<typeof GalleryItemSchema>;
/** Same as GalleryItem but with `image` narrowed to a non-empty URL string.
 *  Produced after the parent filters out items with no image. */
type ResolvedGalleryItem = Omit<GalleryItem, "image"> & { image: string };

export default function ImageGallery({
  settings,
}: SectionComponentProps<ImageGallerySettings>) {
  const safe = ImageGallerySchema.parse(settings);
  // Each item may carry either a plain URL string (legacy) or the rich
  // image-options object. Normalise to a URL string before render so the
  // `<img src>` and lightbox both work without per-call extraction.
  const items: ResolvedGalleryItem[] = safe.images
    .map((i) => ({ ...i, image: getImageUrl(i.image) }))
    .filter((i): i is ResolvedGalleryItem => !!i.image);

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
          {safe.subheading && (
            <EngineElement
              el="subheading"
              kind="text"
              as="p"
              className="mt-3 opacity-80"
              style={{
                fontSize: "calc(1rem * var(--jw-section-body-scale, 1))",
              }}
            >
              {safe.subheading}
            </EngineElement>
          )}
        </header>

        {items.length > 0 && (
          <Grid layout={safe.layout} items={items} />
        )}
      </EngineElement>
    </EngineElement>
  );
}

// ────────────────────────────────────────────────────────────────────────

function Grid({
  layout,
  items,
}: {
  layout: "grid" | "masonry";
  items: ResolvedGalleryItem[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // ESC closes the lightbox
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight")
        setOpenIndex((i) => (i === null ? 0 : (i + 1) % items.length));
      if (e.key === "ArrowLeft")
        setOpenIndex((i) =>
          i === null ? 0 : (i - 1 + items.length) % items.length
        );
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openIndex, items.length]);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    if (openIndex === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openIndex]);

  const isMasonry = layout === "masonry";

  return (
    <>
      <div
        className={
          isMasonry
            ? "mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4"
            : "mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {items.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenIndex(i)}
            className={
              isMasonry
                ? "group block w-full break-inside-avoid overflow-hidden rounded-2xl border bg-white"
                : "group block aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-white"
            }
            style={{ borderColor: "rgba(0,0,0,0.08)" }}
            aria-label={
              item.alt || item.caption || `Open image ${i + 1}`
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.alt || item.caption || ""}
              loading="lazy"
              className={
                isMasonry
                  ? "block h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]"
                  : "h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              }
            />
            {item.caption && (
              <span
                className={
                  isMasonry
                    ? "block px-3 py-2 text-xs opacity-75"
                    : "sr-only"
                }
              >
                {item.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {openIndex !== null && items[openIndex] && (
        <Lightbox
          item={items[openIndex]}
          onClose={() => setOpenIndex(null)}
          onPrev={() =>
            setOpenIndex((i) =>
              i === null ? 0 : (i - 1 + items.length) % items.length
            )
          }
          onNext={() =>
            setOpenIndex((i) => (i === null ? 0 : (i + 1) % items.length))
          }
          counter={`${openIndex + 1} / ${items.length}`}
        />
      )}
    </>
  );
}

function Lightbox({
  item,
  onClose,
  onPrev,
  onNext,
  counter,
}: {
  item: ResolvedGalleryItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  counter: string;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute end-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      <span className="absolute start-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
        {counter}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Previous image"
        className="absolute start-4 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <span className="text-2xl leading-none rtl:rotate-180">‹</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Next image"
        className="absolute end-4 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <span className="text-2xl leading-none rtl:rotate-180">›</span>
      </button>

      <figure
        className="max-h-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image ?? ""}
          alt={item.alt || item.caption || ""}
          className="max-h-[80vh] w-auto rounded-xl"
        />
        {item.caption && (
          <figcaption className="mt-3 text-center text-sm text-white/85">
            {item.caption}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
