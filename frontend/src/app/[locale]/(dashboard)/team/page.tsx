import { getTranslations, setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default async function TeamPage(props: PageProps<"/[locale]/team">) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.pages.team");
  return <ComingSoon locale={locale} title={t("title")} desc={t("desc")} />;
}
