import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { LanguageSwitcher } from "./language-switcher";
import { MobileNav } from "./mobile-nav";
import { NavbarShell } from "./navbar-shell";
import type { Locale } from "@/i18n/routing";

interface Props {
  locale: Locale;
}

export async function Navbar({ locale }: Props) {
  const t = await getTranslations("nav");

  const links = [
    { href: `/${locale}/features`, label: t("features") },
    { href: `/${locale}/templates`, label: t("templates") },
    { href: `/${locale}/pricing`, label: t("pricing") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  return (
    <NavbarShell>
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-18">
        <Link
          href={`/${locale}`}
          className="group flex items-center gap-2"
          aria-label="JamiyaWeb home"
        >
          <Image
            src="/logo.png"
            alt="JamiyaWeb"
            width={160}
            height={44}
            priority
            className="h-9 w-auto transition-transform group-hover:scale-[1.02] lg:h-10"
          />
        </Link>

        <nav className="hidden lg:flex">
          <ul className="flex items-center gap-1 rounded-full border border-border/70 bg-surface/60 px-1.5 py-1 shadow-soft backdrop-blur">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-full px-4 py-1.5 text-sm font-medium text-foreground-soft transition-colors hover:bg-brand-50 hover:text-brand"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher currentLocale={locale} />
          <Link
            href={`/${locale}/login`}
            className="text-sm font-medium text-foreground-soft transition-colors hover:text-brand"
          >
            {t("signIn")}
          </Link>
          <Link
            href={`/${locale}/register`}
            className="group inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand-600 hover:shadow-card"
          >
            {t("getStarted")}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </Link>
        </div>

        <div className="lg:hidden">
          <MobileNav
            locale={locale}
            links={links}
            signInLabel={t("signIn")}
            getStartedLabel={t("getStarted")}
          />
        </div>
      </Container>
    </NavbarShell>
  );
}
