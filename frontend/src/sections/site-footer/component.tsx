import { z } from "zod";
import { Mail, Phone, Landmark, BadgeCheck, MapPin } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import type { SectionComponentProps } from "@/engine/component-registry";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";
import { getImageUrl, imageValueSchema } from "@/engine/image-value";
import { nullSafeBoolean, nullSafeString } from "../_helpers";

// ── Inline brand SVGs ──
// Lucide-react dropped brand icons over trademark concerns, so we ship our
// own minimal versions for the six platforms the footer's social repeater
// supports. Paths are from each brand's official mark; sized via the
// surrounding container so `className` controls width/height.
type IconProps = { className?: string } & SVGProps<SVGSVGElement>;
const SVG_PROPS = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true as const,
};

function Facebook(props: IconProps) {
  return (
    <svg {...SVG_PROPS} {...props}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function Instagram(props: IconProps) {
  return (
    <svg {...SVG_PROPS} {...props} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function Twitter(props: IconProps) {
  // "X" logo (post-rebrand). Single mark.
  return (
    <svg {...SVG_PROPS} {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231ZM17.083 19.77h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function Youtube(props: IconProps) {
  return (
    <svg {...SVG_PROPS} {...props}>
      <path d="M23.5 6.2a3 3 0 0 0-2.11-2.13C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.39.57A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.11 2.13C4.5 20.5 12 20.5 12 20.5s7.5 0 9.39-.57A3 3 0 0 0 23.5 17.8 31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.75 15.5v-7l6.5 3.5-6.5 3.5Z" />
    </svg>
  );
}

function Linkedin(props: IconProps) {
  return (
    <svg {...SVG_PROPS} {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

/**
 * Global site footer — appears at the bottom of every page on the public
 * site. Stored on the Website (footer_json).
 *
 * Layout: logo + tagline on the left, N nav columns (repeater), social
 * icons, copyright line at the bottom.
 *
 * Element ids:
 *   • background  (kind: background)
 *   • brand       (kind: container)
 *   • columns     (kind: container)
 *   • social      (kind: container)
 *   • copyright   (kind: text)
 */

const LinkSchema = z.object({
  label: nullSafeString(""),
  href: nullSafeString("#"),
});

const ColumnSchema = z.object({
  heading: nullSafeString("Column"),
  links: z.array(LinkSchema).default([]),
});

const SocialSchema = z.object({
  platform: z
    .enum(["facebook", "instagram", "twitter", "youtube", "linkedin", "email"])
    .catch("facebook")
    .default("facebook"),
  href: nullSafeString("#"),
});

export const SiteFooterSchema = z.object({
  logo: imageValueSchema,
  tagline: nullSafeString(""),
  contact_email: nullSafeString(""),
  contact_phone: nullSafeString(""),
  address: nullSafeString(""),
  columns: z.array(ColumnSchema).default([]),
  socials: z.array(SocialSchema).default([]),
  copyright: nullSafeString(""),
  show_brand_strip: nullSafeBoolean(true),

  // ─── Trust strip — Saudi welfare-site convention ──────────────
  // A row of regulatory + bank info above the main copyright. These
  // are the credibility signals donors look for first.
  iban: nullSafeString(""),
  bank_name: nullSafeString(""),
  license_number: nullSafeString(""),
  license_authority: nullSafeString(""),
  regulatory_note: nullSafeString(""),
});

export type SiteFooterSettings = z.infer<typeof SiteFooterSchema>;

const SOCIAL_ICONS: Record<
  z.infer<typeof SocialSchema>["platform"],
  ComponentType<{ className?: string }>
> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  email: Mail,
};

const SOCIAL_LABELS: Record<
  z.infer<typeof SocialSchema>["platform"],
  string
> = {
  facebook: "Facebook",
  instagram: "Instagram",
  twitter: "Twitter / X",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  email: "Email",
};

export default function SiteFooter({
  settings,
}: SectionComponentProps<SiteFooterSettings>) {
  const safe = SiteFooterSchema.parse(settings);
  const logoUrl = getImageUrl(safe.logo);
  const year = new Date().getFullYear();
  const copyright = safe.copyright.replace("{year}", String(year));

  return (
    <EngineElement
      el="background"
      kind="background"
      as="footer"
      className="relative w-full overflow-hidden"
      style={{
        background: `var(--jw-section-bg, color-mix(in srgb, ${tokenVar("color.foreground")} 96%, ${tokenVar("color.primary")} 4%))`,
        color: `var(--jw-section-text, color-mix(in srgb, ${tokenVar("color.background")} 92%, ${tokenVar("color.primary")} 8%))`,
      }}
    >
      {safe.show_brand_strip && (
        <span
          className="absolute inset-x-0 top-0 h-1"
          style={{
            background: `linear-gradient(90deg, ${tokenVar("color.primary")} 0%, ${tokenVar("color.accent")} 100%)`,
          }}
          aria-hidden
        />
      )}

      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_2fr]">
          {/* Brand block */}
          <EngineElement el="brand" kind="container">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Logo"
                className="h-10 w-auto"
              />
            ) : null}
            {safe.tagline && (
              <p className="mt-3 max-w-sm text-sm leading-relaxed opacity-80">
                {safe.tagline}
              </p>
            )}

            {(safe.contact_email || safe.contact_phone || safe.address) && (
              <ul className="mt-5 space-y-1.5 text-sm">
                {safe.contact_email && (
                  <li>
                    <a
                      href={`mailto:${safe.contact_email}`}
                      className="inline-flex items-center gap-2 hover:underline"
                    >
                      <Mail className="h-3.5 w-3.5 opacity-70" />
                      {safe.contact_email}
                    </a>
                  </li>
                )}
                {safe.contact_phone && (
                  <li>
                    <a
                      href={`tel:${safe.contact_phone.replace(/\s+/g, "")}`}
                      className="inline-flex items-center gap-2 hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5 opacity-70" />
                      <span dir="ltr" className="font-mono">
                        {safe.contact_phone}
                      </span>
                    </a>
                  </li>
                )}
                {safe.address && (
                  <li className="inline-flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-70" />
                    <span className="whitespace-pre-line opacity-90">
                      {safe.address}
                    </span>
                  </li>
                )}
              </ul>
            )}
          </EngineElement>

          {/* Nav columns */}
          {safe.columns.length > 0 && (
            <EngineElement
              el="columns"
              kind="container"
              className="grid gap-8 sm:grid-cols-2 md:grid-cols-3"
            >
              {safe.columns.map((col, i) => (
                <div key={i}>
                  <p
                    className="text-[11px] font-bold uppercase tracking-widest opacity-70"
                    style={{ fontFamily: "var(--jw-font-heading, inherit)" }}
                  >
                    {col.heading}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {col.links.map((link, j) => (
                      <li key={j}>
                        <a
                          href={link.href}
                          className="text-sm opacity-85 transition-opacity hover:opacity-100 hover:underline"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </EngineElement>
          )}
        </div>

        {/* Trust strip — IBAN + license + regulatory note. Welfare-site
            convention: donors look here for credibility signals. */}
        {(safe.iban ||
          safe.license_number ||
          safe.regulatory_note) && (
          <EngineElement
            el="trust_strip"
            kind="container"
            className="mt-10 grid gap-4 rounded-2xl p-5 sm:grid-cols-2 lg:grid-cols-3"
            style={{
              background: "color-mix(in srgb, currentColor 6%, transparent)",
              border:
                "1px solid color-mix(in srgb, currentColor 10%, transparent)",
            }}
          >
            {safe.iban && (
              <div className="inline-flex items-start gap-2.5">
                <span
                  className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                  style={{
                    background: `color-mix(in srgb, ${tokenVar(
                      "color.accent"
                    )} 20%, transparent)`,
                    color: tokenVar("color.accent"),
                  }}
                >
                  <Landmark className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                    {safe.bank_name || "Bank IBAN"}
                  </p>
                  <p
                    dir="ltr"
                    className="mt-0.5 break-all font-mono text-[12.5px]"
                  >
                    {safe.iban}
                  </p>
                </div>
              </div>
            )}

            {safe.license_number && (
              <div className="inline-flex items-start gap-2.5">
                <span
                  className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                  style={{
                    background: `color-mix(in srgb, ${tokenVar(
                      "color.accent"
                    )} 20%, transparent)`,
                    color: tokenVar("color.accent"),
                  }}
                >
                  <BadgeCheck className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                    {safe.license_authority || "License"}
                  </p>
                  <p className="mt-0.5 text-[12.5px]">{safe.license_number}</p>
                </div>
              </div>
            )}

            {safe.regulatory_note && (
              <p className="text-[12px] leading-relaxed opacity-75 sm:col-span-2 lg:col-span-1">
                {safe.regulatory_note}
              </p>
            )}
          </EngineElement>
        )}

        {/* Divider + bottom bar */}
        <div
          className="mt-10 border-t pt-6"
          style={{
            borderColor: "color-mix(in srgb, currentColor 12%, transparent)",
          }}
        >
          <div className="flex flex-col-reverse items-start justify-between gap-4 sm:flex-row sm:items-center">
            <EngineElement
              el="copyright"
              kind="text"
              as="p"
              className="text-xs opacity-70"
            >
              {copyright || `© ${year} All rights reserved.`}
            </EngineElement>

            {safe.socials.length > 0 && (
              <EngineElement
                el="social"
                kind="container"
                className="flex items-center gap-1.5"
              >
                {safe.socials.map((s, i) => {
                  const Icon = SOCIAL_ICONS[s.platform];
                  return (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={SOCIAL_LABELS[s.platform]}
                      className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-foreground/10"
                      style={{
                        background: "color-mix(in srgb, currentColor 8%, transparent)",
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </EngineElement>
            )}
          </div>
        </div>
      </div>
    </EngineElement>
  );
}
