import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  Sparkles,
  LayoutTemplate,
  Globe,
  PenSquare,
  Languages,
  HeartHandshake,
  Quote,
  Star,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { HeroMockup } from "@/components/site/hero-mockup";
import { LogoMarquee } from "@/components/site/marquee";
import { Faq } from "@/components/site/faq";
import { TechStack } from "@/components/site/tech-stack";
import { cn } from "@/lib/utils";

export default async function HomePage(props: PageProps<"/[locale]">) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tBento = await getTranslations("home.bento");
  const tSteps = await getTranslations("home.steps");
  const testimonials = t.raw("testimonials") as {
    quote: string;
    name: string;
    role: string;
  }[];
  const faqItems = t.raw("faq") as { q: string; a: string }[];
  const steps = ["one", "two", "three", "four"] as const;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-paper pt-12 pb-24 sm:pt-16 sm:pb-32">
        <div
          aria-hidden
          className="absolute -top-40 start-1/2 -z-10 h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-gradient-to-b from-brand-100/70 via-gold-50/60 to-transparent blur-3xl"
        />
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
            {/* ── Copy ── */}
            <div className="text-center lg:col-span-6 lg:text-start">
              <Reveal direction="down" duration={0.5}>
                <Link
                  href={`/${locale}/templates`}
                  className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs font-medium text-foreground-soft shadow-soft backdrop-blur transition-colors hover:border-brand/40 hover:text-brand"
                >
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    <Sparkles className="h-2.5 w-2.5" />
                    {t("heroEyebrowDot")}
                  </span>
                  <span>{t("heroEyebrow")}</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                </Link>
              </Reveal>

              <Reveal delay={0.05}>
                <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[58px]">
                  {t("heroTitle")}{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 italic text-brand">
                      {t("heroTitleAccent")}
                    </span>
                    <svg
                      aria-hidden
                      viewBox="0 0 220 12"
                      className="absolute -bottom-2 start-0 z-0 h-2.5 w-full text-gold/70"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M2 8C40 2 100 2 218 6"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={0.12}>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground-soft sm:text-lg lg:mx-0 mx-auto">
                  {t("heroSubtitle")}
                </p>
              </Reveal>

              <Reveal delay={0.18}>
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap lg:items-start lg:justify-start justify-center">
                  <Link
                    href={`/${locale}/register`}
                    className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-brand px-2 ps-6 text-sm font-semibold text-white shadow-card transition-all hover:bg-brand-600 hover:shadow-elevated"
                  >
                    {t("heroCtaPrimary")}
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      {t("heroCtaBadge")}
                    </span>
                  </Link>
                  <Link
                    href={`/${locale}/templates`}
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-surface px-6 text-sm font-semibold text-foreground transition-colors hover:border-brand/40 hover:text-brand"
                  >
                    {t("heroCtaSecondary")}
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={0.24}>
                <p className="mt-5 text-xs text-muted-foreground">
                  {t("heroNote")}
                </p>
              </Reveal>
            </div>

            {/* ── Mockup ── */}
            <div className="lg:col-span-6">
              <HeroMockup
                url={t("mockup.url")}
                heroTitle={t("mockup.heroTitle")}
                heroSub={t("mockup.heroSub")}
                donateCta={t("mockup.donateCta")}
                studentsLabel={t("mockup.studentsLabel")}
                scholarsLabel={t("mockup.scholarsLabel")}
                yearsLabel={t("mockup.yearsLabel")}
                floatingChip={t("heroFloatingChip")}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* TRUSTED BY MARQUEE */}
      <section className="border-y border-border bg-background/60 py-10">
        <Container>
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("trustedBy")}
          </p>
          <div className="mt-6">
            <LogoMarquee
              items={[
                "Jamiya Arabia",
                "Darul Uloom",
                "Al‑Falah Trust",
                "Madina Academy",
                "Rahmah Welfare",
                "Masjid An‑Noor",
                "Al‑Huda Institute",
                "Iqra Madrasah",
              ]}
            />
          </div>
        </Container>
      </section>

      {/* BENTO FEATURES */}
      <section className="py-24 sm:py-32">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand">
                {t("featuresEyebrow")}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {t("featuresTitle")}{" "}
                <span className="text-foreground/40">
                  {t("featuresTitleAccent")}
                </span>
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-4 text-base text-foreground-soft">
                {t("featuresSubtitle")}
              </p>
            </Reveal>
          </div>

          <Stagger className="mt-14 grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {/* Tile 1: Themes (large) */}
            <StaggerItem className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-8 shadow-soft transition-all hover:shadow-card lg:col-span-3 lg:row-span-2">
              <div className="flex h-full flex-col">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand">
                  <LayoutTemplate className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-foreground">
                  {tBento("themesTitle")}
                </h3>
                <p className="mt-2 max-w-md text-sm text-foreground-soft">
                  {tBento("themesDesc")}
                </p>
                <div className="relative mt-auto pt-8">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      "from-brand-700 to-brand-900",
                      "from-gold-500 to-brand",
                      "from-brand-500 to-brand-700",
                    ].map((g, i) => (
                      <div
                        key={i}
                        className={cn(
                          "aspect-[3/4] rounded-xl bg-gradient-to-br shadow-soft transition-transform group-hover:-translate-y-1",
                          g
                        )}
                        style={{ transitionDelay: `${i * 60}ms` }}
                      >
                        <div className="h-1/3 rounded-t-xl bg-white/15" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </StaggerItem>

            {/* Tile 2: Builder */}
            <StaggerItem className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-7 shadow-soft transition-all hover:shadow-card lg:col-span-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-700">
                <PenSquare className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-foreground">
                {tBento("builderTitle")}
              </h3>
              <p className="mt-2 text-sm text-foreground-soft">
                {tBento("builderDesc")}
              </p>
              {/* Mini builder UI */}
              <div className="mt-6 grid grid-cols-5 gap-2">
                <div className="col-span-1 space-y-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-3 rounded-sm bg-foreground/5"
                    />
                  ))}
                </div>
                <div className="col-span-4 space-y-1.5">
                  <div className="h-3 rounded-sm bg-brand/20" />
                  <div className="h-3 w-4/5 rounded-sm bg-foreground/5" />
                  <div className="h-3 w-3/5 rounded-sm bg-foreground/5" />
                </div>
              </div>
            </StaggerItem>

            {/* Tile 3: RTL */}
            <StaggerItem className="group relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-brand-800 to-brand-900 p-7 text-white shadow-soft transition-all hover:shadow-card lg:col-span-2">
              <div
                aria-hidden
                className="absolute inset-0 bg-arabesque opacity-50"
              />
              <div className="relative">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-gold-200 backdrop-blur">
                  <Languages className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-xl font-semibold">
                  {tBento("rtlTitle")}
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  {tBento("rtlDesc")}
                </p>
                <p className="mt-5 font-arabic-auto text-2xl font-bold text-gold-200">
                  بسم الله
                </p>
              </div>
            </StaggerItem>

            {/* Tile 4: Donation */}
            <StaggerItem className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-7 shadow-soft transition-all hover:shadow-card lg:col-span-2">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-700">
                <HeartHandshake className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-foreground">
                {tBento("donationTitle")}
              </h3>
              <p className="mt-2 text-sm text-foreground-soft">
                {tBento("donationDesc")}
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold-50 px-3 py-1.5 text-xs font-semibold text-gold-700">
                $0 → $2,840
                <span className="inline-flex h-1.5 w-12 overflow-hidden rounded-full bg-gold-100">
                  <span className="h-full w-3/4 bg-gold" />
                </span>
              </div>
            </StaggerItem>

            {/* Tile 5: Domain */}
            <StaggerItem className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-7 shadow-soft transition-all hover:shadow-card lg:col-span-2">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand">
                <Globe className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-foreground">
                {tBento("domainTitle")}
              </h3>
              <p className="mt-2 text-sm text-foreground-soft">
                {tBento("domainDesc")}
              </p>
              <div
                className="mt-5 inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs font-mono text-foreground"
                dir="ltr"
              >
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Jamiya.org
              </div>
            </StaggerItem>
          </Stagger>
        </Container>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <Reveal>
                <p className="text-sm font-semibold uppercase tracking-widest text-brand">
                  {t("stepsEyebrow")}
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {t("stepsTitle")}
                </h2>
              </Reveal>
            </div>

            <Stagger className="space-y-4 lg:col-span-8" step={0.1}>
              {steps.map((s) => (
                <StaggerItem
                  key={s}
                  className="group flex gap-5 rounded-2xl border border-border bg-surface p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card sm:gap-7 sm:p-8"
                >
                  <span className="font-mono text-3xl font-bold text-brand/40 transition-colors group-hover:text-brand sm:text-4xl">
                    {tSteps(`${s}.n`)}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                      {tSteps(`${s}.t`)}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground-soft sm:text-base">
                      {tSteps(`${s}.d`)}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Container>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 sm:py-32">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand">
                {t("testimonialsEyebrow")}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {t("testimonialsTitle")}
              </h2>
            </Reveal>
          </div>

          <Stagger className="mt-14 grid gap-5 lg:grid-cols-3">
            {testimonials.map((te, i) => (
              <StaggerItem
                key={i}
                className={cn(
                  "relative flex flex-col rounded-2xl border border-border bg-surface p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card",
                  i === 1 && "lg:scale-[1.03] lg:border-brand/40"
                )}
              >
                <Quote className="h-7 w-7 text-brand/30" />
                <p className="mt-4 flex-1 text-base leading-relaxed text-foreground">
                  “{te.quote}”
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 font-semibold text-brand">
                    {te.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {te.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{te.role}</p>
                  </div>
                  <div className="ms-auto inline-flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        className="h-3.5 w-3.5 fill-gold text-gold"
                      />
                    ))}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* TECH STACK — alweb-inspired open-source logos */}
      <TechStack
        title={t("techStack.title")}
        subtitle={t("techStack.subtitle")}
        caption={t("techStack.caption")}
      />

      {/* FAQ */}
      <section className="py-24 sm:py-28">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Reveal>
                <p className="text-sm font-semibold uppercase tracking-widest text-brand">
                  {t("faqEyebrow")}
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {t("faqTitle")}
                </h2>
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <Reveal delay={0.12}>
                <Faq items={faqItems} />
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="pb-24 sm:pb-32">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 px-8 py-16 text-center text-white sm:px-12 sm:py-24">
              <div
                aria-hidden
                className="absolute inset-0 bg-arabesque opacity-40"
              />
              <div
                aria-hidden
                className="absolute -bottom-20 -end-20 h-72 w-72 rounded-full bg-gold/25 blur-3xl"
              />
              <div className="relative mx-auto max-w-2xl">
                <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
                  {t("ctaTitle")}
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-base text-white/75 sm:text-lg">
                  {t("ctaSubtitle")}
                </p>
                <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href={`/${locale}/register`}
                    className="group inline-flex h-12 items-center gap-2 rounded-full bg-gold px-6 text-sm font-semibold text-white shadow-card transition-transform hover:scale-[1.02]"
                  >
                    {t("ctaButton")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                  </Link>
                  <Link
                    href={`/${locale}/contact`}
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    {t("ctaSecondary")}
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
