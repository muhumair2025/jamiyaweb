import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { TemplatesGrid } from "@/components/site/templates-grid";

const TEMPLATES = [
  { key: "modernJamiya", category: "Jamiya", gradient: "from-brand-700 to-brand-900", isNew: true },
  { key: "scholarPortfolio", category: "scholar", gradient: "from-brand-600 to-brand-800" },
  { key: "welfareTrust", category: "welfare", gradient: "from-gold-600 to-gold-700" },
  { key: "mosqueCommunity", category: "mosque", gradient: "from-brand-700 to-brand-900" },
  { key: "darulIfta", category: "Jamiya", gradient: "from-gold-500 to-brand", isNew: true },
  { key: "quranAcademy", category: "Jamiya", gradient: "from-brand-500 to-brand-800" },
];

export default async function TemplatesPage(
  props: PageProps<"/[locale]/templates">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations("templates");
  const tItems = await getTranslations("templates.items");
  const tCats = await getTranslations("templates.categories");

  const categories = [
    { value: "all", label: tCats("all") },
    { value: "Jamiya", label: tCats("Jamiya") },
    { value: "scholar", label: tCats("scholar") },
    { value: "welfare", label: tCats("welfare") },
    { value: "mosque", label: tCats("mosque") },
  ];

  const items = Object.fromEntries(
    TEMPLATES.map((tpl) => [
      tpl.key,
      {
        name: tItems(`${tpl.key}.name`),
        desc: tItems(`${tpl.key}.desc`),
      },
    ])
  );

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

      {/* GRID */}
      <section className="pb-24 sm:pb-32">
        <Container>
          <Reveal>
            <TemplatesGrid
              locale={locale}
              templates={TEMPLATES}
              categories={categories}
              items={items}
              labels={{
                preview: t("preview"),
                useTemplate: t("useTemplate"),
                newBadge: t("newBadge"),
              }}
            />
          </Reveal>
        </Container>
      </section>
    </>
  );
}
