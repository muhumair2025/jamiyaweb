import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { PricingTiers } from "@/components/site/pricing-tiers";
import { Faq } from "@/components/site/faq";

const TIER_KEYS = ["free", "growth", "institution"] as const;

export default async function PricingPage(
  props: PageProps<"/[locale]/pricing">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations("pricing");

  const tiers = TIER_KEYS.map((key) => ({
    key,
    name: t(`tiers.${key}.name`),
    monthly: t(`tiers.${key}.monthly`),
    yearly: t(`tiers.${key}.yearly`),
    desc: t(`tiers.${key}.desc`),
    cta: t(`tiers.${key}.cta`),
    features: t.raw(`tiers.${key}.features`) as string[],
    highlighted: key === "growth",
  }));

  const faqItems = t.raw("faq") as { q: string; a: string }[];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-paper pt-16 pb-12 sm:pt-24 sm:pb-16">
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

      {/* PRICING */}
      <section className="pb-20">
        <Container>
          <Reveal>
            <PricingTiers
              locale={locale}
              tiers={tiers}
              labels={{
                monthly: t("monthly"),
                yearly: t("yearly"),
                save: t("save"),
                perMonth: t("perMonth"),
                perYear: t("perYear"),
                mostPopular: t("mostPopular"),
                guarantee: t("guarantee"),
              }}
            />
          </Reveal>
        </Container>
      </section>

      {/* FAQ */}
      <section className="pb-24 sm:pb-32">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Reveal>
                <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {t("faqTitle")}
                </h2>
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <Reveal delay={0.1}>
                <Faq items={faqItems} />
              </Reveal>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
