import { getTranslations, setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default async function LanguagesPage(
  props: PageProps<"/[locale]/languages">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.pages.languages");
  return <ComingSoon locale={locale} title={t("title")} desc={t("desc")} />;
}
