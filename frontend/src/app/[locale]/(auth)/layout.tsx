import Image from "next/image";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Quote } from "lucide-react";
import type { Locale } from "@/i18n/routing";

export default async function AuthLayout(props: LayoutProps<"/[locale]">) {
  const { locale } = (await props.params) as { locale: Locale };
  setRequestLocale(locale);

  const t = await getTranslations("auth.common");
  const tPanel = await getTranslations("auth.panel");

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* ───────── Form column ───────── */}
      <div className="relative flex min-h-screen flex-col bg-background">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-5 sm:px-10 sm:py-7">
          <Link href={`/${locale}`} className="inline-flex items-center">
            <Image
              src="/logo.png"
              alt="JamiyaWeb"
              width={140}
              height={40}
              priority
              className="h-8 w-auto sm:h-9"
            />
          </Link>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-brand"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            <span className="hidden sm:inline">{t("backToSite")}</span>
          </Link>
        </header>

        {/* Form body */}
        <div className="flex flex-1 items-center justify-center px-5 pb-10 sm:px-10 sm:pb-16">
          <div className="w-full max-w-[440px]">{props.children}</div>
        </div>
      </div>

      {/* ───────── Brand panel (desktop only) ───────── */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 lg:block">
        <div
          aria-hidden
          className="absolute inset-0 bg-arabesque opacity-40"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -end-32 h-96 w-96 rounded-full bg-gold/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -top-40 -start-32 h-96 w-96 rounded-full bg-brand-300/15 blur-3xl"
        />

        <div className="relative flex h-full flex-col justify-between p-12 text-white xl:p-16">
          {/* Top — Arabic greeting */}
          <div>
            <p className="font-arabic-auto text-3xl font-bold text-gold-200">
              بسم الله الرحمن الرحيم
            </p>
            <p className="mt-2 text-sm text-white/60">
              In the name of Allah, the Most Gracious, the Most Merciful.
            </p>
          </div>

          {/* Middle — testimonial */}
          <figure className="max-w-md">
            <Quote className="h-8 w-8 text-gold/70" />
            <blockquote className="mt-4 text-2xl font-medium leading-snug text-white xl:text-[26px]">
              {tPanel("quote")}
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-base font-semibold text-gold-200 backdrop-blur">
                {tPanel("quoteAuthor").charAt(0)}
              </span>
              <div>
                <p className="text-sm font-semibold">
                  {tPanel("quoteAuthor")}
                </p>
                <p className="text-xs text-white/60">{tPanel("quoteRole")}</p>
              </div>
            </figcaption>
          </figure>

          {/* Bottom — stats strip */}
          <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-6">
            <Stat value={tPanel("stat1")} label={tPanel("stat1Label")} />
            <Stat value={tPanel("stat2")} label={tPanel("stat2Label")} />
            <Stat value={tPanel("stat3")} label={tPanel("stat3Label")} />
          </div>
        </div>
      </aside>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-gold-200 xl:text-3xl">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-white/60">
        {label}
      </p>
    </div>
  );
}
