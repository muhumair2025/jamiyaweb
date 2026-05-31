"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Menu, X, Phone, Mail, Globe, LogIn } from "lucide-react";
import type { SectionComponentProps } from "@/engine/component-registry";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";
import { getImageUrl, imageValueSchema } from "@/engine/image-value";
import { nullSafeBoolean, nullSafeString } from "../_helpers";

/**
 * Global site header — appears at the top of every page on the public
 * site. Stored separately from page content on the Website (header_json),
 * so editing it once updates the whole site.
 *
 * Layout: logo on the left, nav links centred (or right), optional CTA on
 * the far right. Collapses into a hamburger menu under sm breakpoint.
 *
 * Element ids:
 *   • background  (kind: background) — the <header> bar
 *   • logo        (kind: image)
 *   • nav         (kind: container)
 *   • cta         (kind: button)
 */

const LinkSchema = z.object({
  label: nullSafeString(""),
  href: nullSafeString("#"),
});

export const SiteHeaderSchema = z.object({
  logo: imageValueSchema,
  logo_text: nullSafeString(""),
  sticky: nullSafeBoolean(true),
  links: z.array(LinkSchema).default([]),
  cta_label: nullSafeString(""),
  cta_href: nullSafeString("#"),
  layout: z.enum(["center", "right"]).catch("right").default("right"),

  // ─── Utility bar (welfare-site pattern) ─────────────────────────
  // A thin strip ABOVE the main nav with phone/email/language/login.
  // Hidden on mobile to keep the burger menu the focus of attention.
  show_utility_bar: nullSafeBoolean(false),
  utility_phone: nullSafeString(""),
  utility_email: nullSafeString(""),
  utility_language_label: nullSafeString(""),
  utility_language_href: nullSafeString(""),
  utility_login_label: nullSafeString(""),
  utility_login_href: nullSafeString(""),
  utility_links: z.array(LinkSchema).default([]),
});

export type SiteHeaderSettings = z.infer<typeof SiteHeaderSchema>;

export default function SiteHeader({
  settings,
}: SectionComponentProps<SiteHeaderSettings>) {
  const safe = SiteHeaderSchema.parse(settings);
  const logoUrl = getImageUrl(safe.logo);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on resize past sm
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 640) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <EngineElement
      el="background"
      kind="background"
      as="header"
      className={`z-30 w-full ${safe.sticky ? "sticky top-0" : ""}`}
      style={{
        background: `var(--jw-section-bg, ${tokenVar("color.background")})`,
        color: `var(--jw-section-text, ${tokenVar("color.foreground")})`,
        borderBottom: `1px solid color-mix(in srgb, ${tokenVar("color.foreground")} 8%, transparent)`,
        backdropFilter: "saturate(180%) blur(8px)",
      }}
    >
      {/* Utility bar — sits above the main nav. Welfare-site convention:
          phone + email + language + login on a thin charcoal/brand strip. */}
      {safe.show_utility_bar &&
        (safe.utility_phone ||
          safe.utility_email ||
          safe.utility_language_label ||
          safe.utility_login_label ||
          safe.utility_links.length > 0) && (
          <EngineElement
            el="utility_bar"
            kind="container"
            className="hidden border-b text-[12px] sm:block"
            style={{
              background: `color-mix(in srgb, ${tokenVar("color.primary")} 96%, #000)`,
              color: `color-mix(in srgb, ${tokenVar("color.background")} 88%, transparent)`,
              borderColor: `color-mix(in srgb, ${tokenVar("color.foreground")} 14%, transparent)`,
            }}
          >
            <div className="mx-auto flex h-9 max-w-6xl items-center justify-between gap-6 px-6">
              {/* Start cluster — contact info */}
              <div className="inline-flex items-center gap-5 opacity-90">
                {safe.utility_phone && (
                  <a
                    href={`tel:${safe.utility_phone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-1.5 hover:opacity-100"
                  >
                    <Phone className="h-3 w-3 opacity-80" />
                    <span dir="ltr" className="font-mono">
                      {safe.utility_phone}
                    </span>
                  </a>
                )}
                {safe.utility_email && (
                  <a
                    href={`mailto:${safe.utility_email}`}
                    className="inline-flex items-center gap-1.5 hover:opacity-100"
                  >
                    <Mail className="h-3 w-3 opacity-80" />
                    {safe.utility_email}
                  </a>
                )}
              </div>

              {/* End cluster — utility links, language, login */}
              <div className="inline-flex items-center gap-4 opacity-90">
                {safe.utility_links.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    className="font-medium opacity-90 transition-opacity hover:opacity-100"
                  >
                    {link.label}
                  </a>
                ))}
                {safe.utility_language_label && (
                  <a
                    href={safe.utility_language_href || "#"}
                    className="inline-flex items-center gap-1 font-medium opacity-90 hover:opacity-100"
                  >
                    <Globe className="h-3 w-3" />
                    {safe.utility_language_label}
                  </a>
                )}
                {safe.utility_login_label && (
                  <a
                    href={safe.utility_login_href || "#"}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold transition-colors"
                    style={{
                      background: tokenVar("color.accent"),
                      color: "#fff",
                    }}
                  >
                    <LogIn className="h-3 w-3" />
                    {safe.utility_login_label}
                  </a>
                )}
              </div>
            </div>
          </EngineElement>
        )}

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        {/* Logo */}
        <a
          href="/"
          className="inline-flex shrink-0 items-center gap-2"
          aria-label="Home"
        >
          {logoUrl ? (
            <EngineElement el="logo" kind="image" as="span" className="inline-flex">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={safe.logo_text || "Logo"}
                className="h-8 w-auto"
              />
            </EngineElement>
          ) : (
            <span
              className="text-base font-bold tracking-tight"
              style={{
                fontFamily: "var(--jw-font-heading, inherit)",
                color: tokenVar("color.primary"),
              }}
            >
              {safe.logo_text || "Your site"}
            </span>
          )}
        </a>

        {/* Desktop nav */}
        <EngineElement
          el="nav"
          kind="container"
          as="nav"
          className={`hidden flex-1 items-center gap-1 sm:flex ${
            safe.layout === "center" ? "justify-center" : "justify-end"
          }`}
        >
          {safe.links.map((link, i) => (
            <a
              key={i}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium opacity-80 transition-colors hover:bg-foreground/5 hover:opacity-100"
            >
              {link.label}
            </a>
          ))}
        </EngineElement>

        {/* Desktop CTA */}
        {safe.cta_label && (
          <div className="hidden sm:block">
            <EngineElement
              el="cta"
              kind="button"
              as="a"
              className="inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
              style={{ background: tokenVar("color.accent") }}
              {...({ href: safe.cta_href || "#" } as object)}
            >
              {safe.cta_label}
            </EngineElement>
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((s) => !s)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="grid h-9 w-9 place-items-center rounded-md hover:bg-foreground/5 sm:hidden"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div
          className="border-t sm:hidden"
          style={{
            borderColor: `color-mix(in srgb, ${tokenVar("color.foreground")} 8%, transparent)`,
            background: `var(--jw-section-bg, ${tokenVar("color.background")})`,
          }}
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {safe.links.map((link, i) => (
              <a
                key={i}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium opacity-90 hover:bg-foreground/5"
              >
                {link.label}
              </a>
            ))}
            {safe.cta_label && (
              <a
                href={safe.cta_href || "#"}
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-white shadow-sm"
                style={{ background: tokenVar("color.accent") }}
              >
                {safe.cta_label}
              </a>
            )}
          </nav>
        </div>
      )}
    </EngineElement>
  );
}
