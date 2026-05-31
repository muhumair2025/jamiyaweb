import { setRequestLocale } from "next-intl/server";
import { ThemeTabs } from "@/components/theme/theme-tabs";

/**
 * Theme dashboard layout — shared chrome (heading + sub-tab nav) for every
 * `/dashboard/theme/*` route. Individual tabs (overview, switch, colors,
 * typography, identity) render in `props.children` below.
 */
export default async function ThemeLayout(
  props: LayoutProps<"/[locale]/theme">
) {
  const { locale } = (await props.params) as { locale: string };
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">
          Design
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Theme
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-foreground-soft">
          Global design controls — switch themes, customise colours and
          typography, set your logo and favicon. Changes apply to every page
          on your site.
        </p>
      </header>

      <ThemeTabs locale={locale} />

      <div>{props.children}</div>
    </div>
  );
}
