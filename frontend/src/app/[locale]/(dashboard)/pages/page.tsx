import { getTranslations, setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default async function PagesIndexPage(
  props: PageProps<"/[locale]/pages">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.pages.pagesIndex");
  return <ComingSoon locale={locale} title={t("title")} desc={t("desc")} />;
}
