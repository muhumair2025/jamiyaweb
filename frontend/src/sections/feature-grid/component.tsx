import { z } from "zod";
import {
  Heart,
  Sparkles,
  Award,
  BookOpen,
  Users,
  Star,
  Compass,
  HandHeart,
  Globe,
  Mail,
  Phone,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import type { SectionComponentProps } from "@/engine/component-registry";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";

/**
 * Feature grid — 3 columns of icon + title + description.
 *
 * For now the section has 3 fixed slots (feature_1_*, feature_2_*,
 * feature_3_*). Once the engine supports repeater fields, we'll switch
 * to a single `features` array.
 *
 * Element ids exposed to the editor:
 *   • background        (kind: background)
 *   • container         (kind: container)
 *   • eyebrow           (kind: text)
 *   • heading           (kind: heading)
 *   • subheading        (kind: text)
 *   • feature_N_card    (kind: container)  — the whole card box
 *   • feature_N_icon    (kind: icon)
 *   • feature_N_title   (kind: heading)
 *   • feature_N_desc    (kind: text)
 *     where N ∈ {1, 2, 3}
 */

const ICON_OPTIONS = [
  "Sparkles",
  "Heart",
  "Award",
  "BookOpen",
  "Users",
  "Star",
  "Compass",
  "HandHeart",
  "Globe",
  "Mail",
  "Phone",
  "Calendar",
] as const;

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Heart,
  Award,
  BookOpen,
  Users,
  Star,
  Compass,
  HandHeart,
  Globe,
  Mail,
  Phone,
  Calendar,
};

const IconEnum = z.enum(ICON_OPTIONS);

export const FeatureGridSchema = z.object({
  eyebrow: z.string().default(""),
  heading: z.string().default("What we offer"),
  subheading: z.string().default(""),

  feature_1_icon: IconEnum.default("Sparkles"),
  feature_1_title: z.string().default("First feature"),
  feature_1_desc: z.string().default("Short description of the first feature."),

  feature_2_icon: IconEnum.default("Heart"),
  feature_2_title: z.string().default("Second feature"),
  feature_2_desc: z.string().default("Short description of the second feature."),

  feature_3_icon: IconEnum.default("Award"),
  feature_3_title: z.string().default("Third feature"),
  feature_3_desc: z.string().default("Short description of the third feature."),
});

export type FeatureGridSettings = z.infer<typeof FeatureGridSchema>;

type FeatureSlot = 1 | 2 | 3;

export default function FeatureGrid({
  settings,
}: SectionComponentProps<FeatureGridSettings>) {
  const s = FeatureGridSchema.parse(settings);

  const features: { slot: FeatureSlot; icon: string; title: string; desc: string }[] = [
    { slot: 1, icon: s.feature_1_icon, title: s.feature_1_title, desc: s.feature_1_desc },
    { slot: 2, icon: s.feature_2_icon, title: s.feature_2_title, desc: s.feature_2_desc },
    { slot: 3, icon: s.feature_3_icon, title: s.feature_3_title, desc: s.feature_3_desc },
  ];

  return (
    <EngineElement
      el="background"
      kind="background"
      as="section"
      className="px-6 py-16 sm:py-24"
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
        {(s.eyebrow || s.heading) && (
          <div className="mx-auto max-w-2xl text-center">
            {s.eyebrow && (
              <EngineElement
                el="eyebrow"
                kind="text"
                as="p"
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: tokenVar("color.primary") }}
              >
                {s.eyebrow}
              </EngineElement>
            )}
            {s.heading && (
              <EngineElement
                el="heading"
                kind="heading"
                as="h2"
                className="mt-3 text-balance font-semibold tracking-tight"
                style={{
                  fontFamily: `var(--jw-font-heading, inherit)`,
                  color: "var(--jw-section-heading, inherit)",
                  fontSize: "calc(1.875rem * var(--jw-section-heading-scale, 1))",
                }}
              >
                {s.heading}
              </EngineElement>
            )}
            {s.subheading && (
              <EngineElement
                el="subheading"
                kind="text"
                as="p"
                className="mt-3 opacity-80"
                style={{
                  fontSize: "calc(1rem * var(--jw-section-body-scale, 1))",
                }}
              >
                {s.subheading}
              </EngineElement>
            )}
          </div>
        )}

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {features.map((f) => {
            const Icon = ICONS[f.icon] ?? ImageIcon;
            return (
              <EngineElement
                key={f.slot}
                el={`feature_${f.slot}_card`}
                kind="container"
                as="article"
                className="rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                style={{ borderColor: "rgba(0,0,0,0.08)" }}
              >
                <EngineElement
                  el={`feature_${f.slot}_icon`}
                  kind="icon"
                  as="span"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{
                    background: `color-mix(in srgb, ${tokenVar("color.primary")} 12%, transparent)`,
                    color: tokenVar("color.primary"),
                  }}
                >
                  <Icon className="h-5 w-5" />
                </EngineElement>

                <EngineElement
                  el={`feature_${f.slot}_title`}
                  kind="heading"
                  as="h3"
                  className="mt-4 text-base font-semibold"
                  style={{ fontFamily: `var(--jw-font-heading, inherit)` }}
                >
                  {f.title}
                </EngineElement>

                <EngineElement
                  el={`feature_${f.slot}_desc`}
                  kind="text"
                  as="p"
                  className="mt-1.5 text-sm leading-relaxed opacity-80"
                >
                  {f.desc}
                </EngineElement>
              </EngineElement>
            );
          })}
        </div>
      </EngineElement>
    </EngineElement>
  );
}
