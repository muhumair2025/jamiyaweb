import { z } from "zod";
import type {
  SectionComponentProps,
  SectionVariant,
} from "@/engine/component-registry";
import { imageValueSchema } from "@/engine/image-value";
import { HeroClassic } from "./variants/classic";
import { HeroCinematic } from "./variants/cinematic";
import { HeroMinimal } from "./variants/minimal";
import { HeroSlider } from "./variants/slider";
import {
  ClassicThumbnail,
  CinematicThumbnail,
  MinimalThumbnail,
  SliderThumbnail,
} from "./variants/thumbnails";

/**
 * Hero — Basic
 *
 * Four pre-built visual variants ship with this section:
 *   • classic    — refined centered hero with eyebrow chip, gilded divider,
 *                  display heading, premium CTA. Trustworthy everyday hero.
 *   • cinematic  — full-bleed, near-viewport-height dramatic hero with a
 *                  display-scale title and a bottom row of subtitle + CTA.
 *   • minimal    — type-led, whitespace-driven, neutral surface, underline
 *                  CTA. Editorial feel; works perfectly without any image.
 *   • slider     — multi-slide carousel with autoplay, prev/next, dots,
 *                  and a progress hairline. Each slide gets its own
 *                  image + copy via `settings.slides`.
 *
 * The user picks one in the Variants tab; it's persisted in `settings.variant`.
 * Every variant exposes the same EngineElement ids (background, container,
 * eyebrow, title, subtitle, cta) so element-level style overrides — including
 * the background itself — survive a swap.
 */

/** One slide in the slider variant. */
const HeroSlideSchema = z.object({
  eyebrow: z.string().default(""),
  title: z.string().default(""),
  subtitle: z.string().default(""),
  cta_label: z.string().default(""),
  cta_href: z.string().default("#"),
  background_image: imageValueSchema,
});

export type HeroSlide = z.infer<typeof HeroSlideSchema>;

export const HeroBasicSchema = z.object({
  eyebrow: z.string().default(""),
  title: z.string().default("Your hero title goes here"),
  subtitle: z.string().default(""),
  cta_label: z.string().default(""),
  cta_href: z.string().default("#"),
  background_image: imageValueSchema,
  alignment: z.enum(["start", "center"]).default("center"),
  variant: z
    .enum(["classic", "cinematic", "minimal", "slider"])
    .default("classic"),

  // Slider-only fields. They're always present in the schema so the form
  // pipeline is stable, but they only have an effect when variant="slider".
  slides: z.array(HeroSlideSchema).default([]),
  autoplay: z.boolean().default(true),
  interval_ms: z.number().int().min(2000).max(20000).default(5500),
  transition: z.enum(["fade", "slide"]).default("fade"),
});

export type HeroBasicSettings = z.infer<typeof HeroBasicSchema>;

/** Variants exposed to the builder's Variants tab. */
export const heroBasicVariants: SectionVariant[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Refined, centered. The trustworthy everyday hero.",
    thumbnail: <ClassicThumbnail />,
  },
  {
    id: "cinematic",
    label: "Cinematic",
    description: "Full-bleed, display-scale. Dramatic editorial impact.",
    thumbnail: <CinematicThumbnail />,
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Clean, type-led, generous whitespace. Quiet confidence.",
    thumbnail: <MinimalThumbnail />,
  },
  {
    id: "slider",
    label: "Slider",
    description:
      "Multi-slide carousel with autoplay, dots, and a progress bar.",
    thumbnail: <SliderThumbnail />,
  },
];

export default function HeroBasic({
  settings,
}: SectionComponentProps<HeroBasicSettings>) {
  const safe = HeroBasicSchema.parse(settings);

  switch (safe.variant) {
    case "cinematic":
      return <HeroCinematic settings={safe} />;
    case "minimal":
      return <HeroMinimal settings={safe} />;
    case "slider":
      return <HeroSlider settings={safe} />;
    case "classic":
    default:
      return <HeroClassic settings={safe} />;
  }
}
