import { z } from "zod";
import { Globe, Mail } from "lucide-react";
import type { SectionComponentProps } from "@/engine/component-registry";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";
import { TwitterIcon } from "@/components/brand-icons";
import {
  cssBackgroundPosition,
  cssBackgroundSize,
  imageValueSchema,
  resolveImage,
} from "@/engine/image-value";
import { nullSafeString } from "../_helpers";

/**
 * Team / Scholars section — eyebrow + heading + grid of people cards.
 *
 * Each person: { photo, name, role, bio, email?, twitter?, website? }
 *
 * Element ids:
 *   • background  (kind: background)
 *   • container   (kind: container)
 *   • eyebrow     (kind: text)
 *   • heading     (kind: heading)
 *   • subheading  (kind: text)
 *   • grid        (kind: container)
 */

const PersonSchema = z.object({
  photo: imageValueSchema,
  name: nullSafeString("Name"),
  role: nullSafeString(""),
  bio: nullSafeString(""),
  email: nullSafeString(""),
  twitter: nullSafeString(""),
  website: nullSafeString(""),
});

export const TeamSchema = z.object({
  eyebrow: nullSafeString(""),
  heading: nullSafeString("Meet the team"),
  subheading: nullSafeString(""),
  columns: z.enum(["2", "3", "4"]).catch("3").default("3"),
  people: z.array(PersonSchema).default([]),
});

export type TeamSettings = z.infer<typeof TeamSchema>;

const COL_CLASS: Record<TeamSettings["columns"], string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

export default function Team({
  settings,
}: SectionComponentProps<TeamSettings>) {
  const safe = TeamSchema.parse(settings);

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

        {safe.people.length > 0 && (
          <EngineElement
            el="grid"
            kind="container"
            className={`mt-12 grid gap-6 ${COL_CLASS[safe.columns]}`}
          >
            {safe.people.map((person, i) => (
              <PersonCard key={i} person={person} />
            ))}
          </EngineElement>
        )}
      </EngineElement>
    </EngineElement>
  );
}

// ────────────────────────────────────────────────────────────────────────

function PersonCard({ person }: { person: z.infer<typeof PersonSchema> }) {
  const initials = person.name
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const photo = resolveImage(person.photo);

  return (
    <article
      className="overflow-hidden rounded-2xl border bg-white text-center shadow-sm transition-shadow hover:shadow-md"
      style={{ borderColor: "rgba(0,0,0,0.08)" }}
    >
      <div
        className="aspect-[4/5] w-full overflow-hidden"
        style={{
          background: photo
            ? `url("${photo.url}") ${cssBackgroundPosition(
                photo.position
              )} / ${cssBackgroundSize(photo.fit)} no-repeat`
            : `linear-gradient(135deg, ${tokenVar("color.primary")} 0%, ${tokenVar("color.accent")} 100%)`,
        }}
      >
        {!photo && (
          <div className="grid h-full w-full place-items-center text-4xl font-bold text-white/80">
            {initials || "?"}
          </div>
        )}
      </div>

      <div className="p-5">
        <h3
          className="text-base font-semibold"
          style={{
            fontFamily: "var(--jw-font-heading, inherit)",
            color: "var(--jw-section-heading, inherit)",
          }}
        >
          {person.name}
        </h3>
        {person.role && (
          <p
            className="mt-0.5 text-xs font-semibold uppercase tracking-wider opacity-70"
            style={{ color: tokenVar("color.primary") }}
          >
            {person.role}
          </p>
        )}
        {person.bio && (
          <p className="mt-3 text-sm leading-relaxed opacity-80">
            {person.bio}
          </p>
        )}

        {(person.email || person.twitter || person.website) && (
          <div className="mt-4 flex justify-center gap-1.5">
            {person.email && (
              <SocialChip
                href={`mailto:${person.email}`}
                label={`Email ${person.name}`}
              >
                <Mail className="h-3.5 w-3.5" />
              </SocialChip>
            )}
            {person.twitter && (
              <SocialChip href={person.twitter} label="Twitter / X">
                <TwitterIcon className="h-3.5 w-3.5" />
              </SocialChip>
            )}
            {person.website && (
              <SocialChip href={person.website} label="Website">
                <Globe className="h-3.5 w-3.5" />
              </SocialChip>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function SocialChip({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-foreground/10"
      style={{
        background: "color-mix(in srgb, currentColor 6%, transparent)",
      }}
    >
      {children}
    </a>
  );
}
