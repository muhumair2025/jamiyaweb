import { getTranslations, setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default async function BillingPage(
  props: PageProps<"/[locale]/billing">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.pages.billing");
  return <ComingSoon locale={locale} title={t("title")} desc={t("desc")} />;
}
