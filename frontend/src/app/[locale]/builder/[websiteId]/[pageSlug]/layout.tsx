import { setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import type { Locale } from "@/i18n/routing";

/**
 * Builder layout — intentionally bare. No dashboard sidebar, no marketing
 * navbar. The 3-pane builder fills the whole viewport.
 *
 * Auth + ownership guard happens in the page (we need websiteId to check).
 */
export default async function BuilderLayout(
  props: LayoutProps<"/[locale]/builder/[websiteId]/[pageSlug]">
) {
  const { locale } = (await props.params) as { locale: Locale };
  setRequestLocale(locale);
  return (
    <NextIntlClientProvider>
      <div className="h-screen w-screen overflow-hidden bg-paper">
        {props.children}
      </div>
    </NextIntlClientProvider>
  );
}
