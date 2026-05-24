import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OnboardingShell } from "@/components/auth/onboarding-shell";
import { WebsiteTypeForm } from "@/components/auth/website-type-form";
import { getCurrentUser } from "@/lib/auth";
import { nextOnboardingStep, onboardingHref } from "@/lib/onboarding";

export default async function WebsiteTypeOnboardingPage(
  props: PageProps<"/[locale]/onboarding/website-type">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  // Already chose? jump to the next incomplete step
  if (user.website_type) {
    redirect(onboardingHref(locale, nextOnboardingStep(user)));
  }

  const t = await getTranslations("onboarding.websiteType");
  const tSteps = await getTranslations("onboarding.steps");

  return (
    <OnboardingShell
      locale={locale}
      current="website-type"
      eyebrow={t("eyebrow")}
      title={t("title")}
      subtitle={t("subtitle")}
      stepLabels={{
        websiteType: tSteps("websiteType"),
        theme: tSteps("theme"),
        customize: tSteps("customize"),
      }}
    >
      <WebsiteTypeForm locale={locale} />
    </OnboardingShell>
  );
}
