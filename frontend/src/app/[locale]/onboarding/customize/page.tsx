import { redirect } from "next/navigation";
import {
  Amiri,
  Cairo,
  Crimson_Pro,
  Fraunces,
  Markazi_Text,
  Playfair_Display,
  Reem_Kufi,
  Space_Grotesk,
} from "next/font/google";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OnboardingShell } from "@/components/auth/onboarding-shell";
import { CustomizeForm } from "@/components/auth/customize-form";
import { getCurrentUser } from "@/lib/auth";

// Typography fonts loaded once on this page — passed through as CSS variables
// so the preview "Aa" in each typography card uses its actual font.
// Latin set
const playfair = Playfair_Display({
  variable: "--font-typo-classical",
  subsets: ["latin"],
  weight: ["600", "700"],
});
const crimson = Crimson_Pro({
  variable: "--font-typo-editorial",
  subsets: ["latin"],
  weight: ["500", "700"],
});
const fraunces = Fraunces({
  variable: "--font-typo-display",
  subsets: ["latin"],
  weight: ["600", "800"],
});
const spaceGrotesk = Space_Grotesk({
  variable: "--font-typo-minimal",
  subsets: ["latin"],
  weight: ["500", "700"],
});
// Arabic set (mapped to the same five typography "moods" as the Latin set)
const amiri = Amiri({
  variable: "--font-typo-ar-classical",
  subsets: ["arabic"],
  weight: ["400", "700"],
});
const cairo = Cairo({
  variable: "--font-typo-ar-minimal",
  subsets: ["arabic"],
  weight: ["500", "700"],
});
const markazi = Markazi_Text({
  variable: "--font-typo-ar-editorial",
  subsets: ["arabic"],
  weight: ["500", "700"],
});
const reemKufi = Reem_Kufi({
  variable: "--font-typo-ar-display",
  subsets: ["arabic"],
  weight: ["500", "700"],
});

export default async function CustomizeOnboardingPage(
  props: PageProps<"/[locale]/onboarding/customize">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  // Must have completed earlier steps first
  if (!user.website_type) redirect(`/${locale}/onboarding/website-type`);
  if (!user.selected_theme_id) redirect(`/${locale}/onboarding/theme`);

  // Already finished? straight to dashboard
  if (user.onboarding_completed_at) {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations("onboarding.customize");
  const tSteps = await getTranslations("onboarding.steps");

  // Pre-fill site name from organization name captured at registration.
  const defaultSiteName = user.site_name ?? user.organization_name ?? "";

  const fontVars = [
    playfair.variable,
    crimson.variable,
    fraunces.variable,
    spaceGrotesk.variable,
    amiri.variable,
    cairo.variable,
    markazi.variable,
    reemKufi.variable,
  ].join(" ");

  return (
    <OnboardingShell
      locale={locale}
      current="customize"
      eyebrow={t("eyebrow")}
      title={t("title")}
      subtitle={t("subtitle")}
      stepLabels={{
        websiteType: tSteps("websiteType"),
        theme: tSteps("theme"),
        customize: tSteps("customize"),
      }}
    >
      <div className={fontVars}>
        <CustomizeForm locale={locale} defaultSiteName={defaultSiteName} />
      </div>
    </OnboardingShell>
  );
}
