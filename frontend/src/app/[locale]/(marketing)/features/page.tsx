import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Check,
  Sparkles,
  PenSquare,
  BookOpen,
  Server,
  ArrowRight,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type GroupKey = "design" | "builder" | "content" | "infra";

const ICONS = {
  design: Sparkles,
  builder: PenSquare,
  content: BookOpen,
  infra: Server,
} as const;

export default async function FeaturesPage(
  props: PageProps<"/[locale]/features">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations("features");
  const tGroups = await getTranslations("features.groups");

  const groups: GroupKey[] = ["design", "builder", "content", "infra"];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-paper pt-16 pb-14 sm:pt-24 sm:pb-20">
        <div
          aria-hidden
          className="absolute -top-20 start-1/2 -z-10 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-brand-100/70 to-transparent blur-3xl"
        />
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand">
                {t("eyebrow")}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
                {t("title")}{" "}
                <span className="italic text-brand">{t("titleAccent")}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground-soft">
                {t("subtitle")}
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ALTERNATING FEATURE GROUPS */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="space-y-24 sm:space-y-32">
            {groups.map((key, i) => {
              const Icon = ICONS[key];
              const bullets = tGroups.raw(`${key}.bullets`) as string[];
              const reversed = i % 2 === 1;
              return (
                <Reveal key={key} direction="up">
                  <div
                    className={cn(
                      "grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16",
                      reversed && "lg:[&>*:first-child]:order-2"
                    )}
                  >
                    {/* Copy */}
                    <div className="lg:col-span-5">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand">
                        <Icon className="h-3.5 w-3.5" />
                        {tGroups(`${key}.tag`)}
                      </span>
                      <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        {tGroups(`${key}.title`)}
                      </h2>
                      <p className="mt-4 text-base leading-relaxed text-foreground-soft">
                        {tGroups(`${key}.desc`)}
                      </p>
                      <ul className="mt-6 space-y-3">
                        {bullets.map((b) => (
                          <li
                            key={b}
                            className="flex items-start gap-3 text-sm text-foreground sm:text-base"
                          >
                            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand">
                              <Check className="h-3 w-3" />
                            </span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Visual */}
                    <div className="lg:col-span-7">
                      <FeatureVisual featureKey={key} />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="pt-24 pb-24 sm:pt-32 sm:pb-32">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-10 text-center sm:p-16">
              <div
                aria-hidden
                className="absolute inset-0 bg-arabesque opacity-30"
              />
              <div className="relative">
                <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Built for Islamic institutions.
                  <br />
                  <span className="text-brand">Used by the Ummah.</span>
                </h2>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href={`/${locale}/register`}
                    className="group inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background shadow-card transition-all hover:bg-brand"
                  >
                    Start free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                  </Link>
                  <Link
                    href={`/${locale}/templates`}
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-semibold text-foreground hover:border-brand/40 hover:text-brand"
                  >
                    Browse templates
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

function FeatureVisual({ featureKey }: { featureKey: GroupKey }) {
  if (featureKey === "design") {
    return (
      <div className="relative">
        <div
          aria-hidden
          className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-brand-100/40 to-gold-50/40 blur-2xl"
        />
        <div className="grid grid-cols-3 gap-4">
          {[
            "from-brand-700 to-brand-900",
            "from-gold-500 to-brand",
            "from-brand-500 to-brand-700",
          ].map((g, i) => (
            <div
              key={i}
              className={cn(
                "aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-gradient-to-br shadow-card",
                g
              )}
            >
              <div className="h-1/3 bg-white/15 backdrop-blur" />
              <div className="space-y-2 p-3">
                <div className="h-2 w-3/4 rounded bg-white/30" />
                <div className="h-1.5 w-1/2 rounded bg-white/20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (featureKey === "builder") {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-foreground/20" />
          <span className="h-2 w-2 rounded-full bg-foreground/20" />
          <span className="h-2 w-2 rounded-full bg-foreground/20" />
        </div>
        <div className="grid grid-cols-12 gap-0">
          <div className="col-span-3 border-e border-border bg-muted/30 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sections
            </p>
            <div className="mt-3 space-y-1.5">
              {["Hero", "About", "Scholars", "Donate", "Footer"].map((s, i) => (
                <div
                  key={s}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs",
                    i === 0
                      ? "bg-brand text-white shadow-soft"
                      : "text-foreground/70 hover:bg-surface"
                  )}
                >
                  <span className="inline-flex h-1 w-1 rounded-full bg-current" />
                  {s}
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-9 p-5">
            <div className="rounded-lg bg-gradient-to-br from-brand-700 to-brand-900 p-5 text-white">
              <div className="h-2.5 w-2/3 rounded bg-white/40" />
              <div className="mt-2 h-1.5 w-1/2 rounded bg-white/25" />
              <div className="mt-3 h-6 w-24 rounded-full bg-gold/80" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="aspect-square rounded bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (featureKey === "content") {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Fatwa
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              Ruling on combining prayers while travelling
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Mufti Suhaib · 3 min read
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-gradient-to-br from-brand-800 to-brand-900 p-5 text-white shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-200">
              Class
            </p>
            <p className="mt-2 text-sm font-medium">
              Tajweed for beginners — Mondays 7pm
            </p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              12 seats left
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-gold-50/60 p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-700">
              Donation
            </p>
            <p className="mt-2 text-base font-semibold text-foreground">
              Ramadan Iftar Drive
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gold-100">
              <div className="h-full w-3/4 bg-gold" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              $2,840 of $4,000 raised
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Book
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              Riyadh as‑Saliheen — Full text
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF · 412 pages
            </p>
          </div>
        </div>
      </div>
    );
  }

  // infra
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-brand-50 to-gold-50 blur-2xl"
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 rounded-2xl border border-border bg-surface p-6 shadow-card" dir="ltr">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Custom domain
          </p>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-foreground p-4 font-mono text-sm text-background">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              Jamiya-arabia.org
            </div>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-300">
              SSL · Active
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Uptime
          </p>
          <p className="mt-2 text-3xl font-bold text-brand">99.98%</p>
          <p className="mt-1 text-xs text-muted-foreground">Last 30 days</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Global CDN
          </p>
          <p className="mt-2 text-3xl font-bold text-brand">280+</p>
          <p className="mt-1 text-xs text-muted-foreground">Edge locations</p>
        </div>
      </div>
    </div>
  );
}
