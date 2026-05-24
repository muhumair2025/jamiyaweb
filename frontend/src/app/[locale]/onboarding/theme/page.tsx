import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OnboardingShell } from "@/components/auth/onboarding-shell";
import { ThemeForm } from "@/components/auth/theme-form";
import { getCurrentUser } from "@/lib/auth";
import { nextOnboardingStep, onboardingHref } from "@/lib/onboarding";
import { themesFor } from "@/lib/themes";

export default async function ThemeOnboardingPage(
  props: PageProps<"/[locale]/onboarding/theme">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  // Must have picked a website type first
  if (!user.website_type) {
    redirect(`/${locale}/onboarding/website-type`);
  }
  // Already finished? jump to next step / dashboard
  if (user.onboarding_completed_at) {
    redirect(onboardingHref(locale, nextOnboardingStep(user)));
  }

  const t = await getTranslations("onboarding.theme");
  const tSteps = await getTranslations("onboarding.steps");
  const themes = themesFor(user.website_type);

  return (
    <OnboardingShell
      locale={locale}
      current="theme"
      eyebrow={t("eyebrow")}
      title={t("title")}
      subtitle={t("subtitle")}
      stepLabels={{
        websiteType: tSteps("websiteType"),
        theme: tSteps("theme"),
        customize: tSteps("customize"),
      }}
    >
      <ThemeForm
        locale={locale}
        themes={themes}
        initialSelected={user.selected_theme_id}
      />
    </OnboardingShell>
  );
}
