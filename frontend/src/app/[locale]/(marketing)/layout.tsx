import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import type { Locale } from "@/i18n/routing";

export default async function MarketingLayout(
  props: LayoutProps<"/[locale]">
) {
  const { locale } = (await props.params) as { locale: Locale };
  setRequestLocale(locale);

  return (
    <>
      <Navbar locale={locale} />
      <main className="flex-1">{props.children}</main>
      <Footer locale={locale} />
    </>
  );
}
