import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import type { Locale } from "@/i18n/routing";

interface Props {
  locale: Locale;
}

export async function Footer({ locale }: Props) {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");

  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <Container className="py-16 sm:py-20">
        {/* Newsletter */}
        <div className="mb-16 grid gap-8 rounded-3xl border border-border bg-gradient-to-br from-brand-50/60 via-surface to-gold-50/30 p-8 sm:p-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {t("newsletterTitle")}
            </h3>
            <p className="mt-2 text-sm text-foreground-soft sm:text-base">
              {t("newsletterDesc")}
            </p>
          </div>
          <form className="flex flex-col gap-3 sm:flex-row lg:col-span-6">
            <input
              type="email"
              required
              placeholder={t("newsletterPlaceholder")}
              className="h-12 flex-1 rounded-full border border-border bg-background px-5 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
            <button
              type="submit"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background shadow-card transition-colors hover:bg-brand"
            >
              {t("newsletterCta")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </button>
          </form>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center"
            >
              <Image
                src="/logo.png"
                alt="JamiyaWeb"
                width={160}
                height={44}
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground-soft">
              {t("tagline")}
            </p>
            <p className="mt-6 font-arabic-auto text-base font-medium text-brand">
              بسم الله الرحمن الرحيم
            </p>
          </div>

          {/* Links */}
          <FooterCol title={t("product")} className="lg:col-span-2" links={[
            { href: `/${locale}/features`, label: tNav("features") },
            { href: `/${locale}/templates`, label: tNav("templates") },
            { href: `/${locale}/pricing`, label: tNav("pricing") },
          ]} />
          <FooterCol title={t("company")} className="lg:col-span-2" links={[
            { href: `/${locale}/about`, label: t("about") },
            { href: `/${locale}/contact`, label: tNav("contact") },
            { href: `/${locale}/blog`, label: t("blog") },
          ]} />
          <FooterCol title={t("resources")} className="lg:col-span-3" links={[
            { href: `/${locale}/docs`, label: t("docs") },
            { href: `/${locale}/support`, label: t("support") },
            { href: `/${locale}/privacy`, label: t("privacy") },
            { href: `/${locale}/terms`, label: t("terms") },
          ]} />
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} JamiyaWeb. {t("rights")}
          </p>
          <p className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            All systems operational
          </p>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({
  title,
  links,
  className,
}: {
  title: string;
  links: { href: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
        {title}
      </h4>
      <ul className="mt-4 space-y-3 text-sm text-foreground-soft">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="transition-colors hover:text-brand">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
