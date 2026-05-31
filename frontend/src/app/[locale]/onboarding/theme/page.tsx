import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OnboardingShell } from "@/components/auth/onboarding-shell";
import { ThemeForm, type OnboardingTheme } from "@/components/auth/theme-form";
import { apiFetch } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { nextOnboardingStep, onboardingHref } from "@/lib/onboarding";

interface ApiTheme {
  id: number;
  slug: string;
  name: string;
  version: string | null;
  preview_url: string | null;
  manifest: Record<string, unknown> | null;
  tokens: Record<string, { default: string }> | null;
  supported_types: string[] | null;
  is_default: boolean;
}

export default async function ThemeOnboardingPage(
  props: PageProps<"/[locale]/onboarding/theme">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  if (!user.website_type) {
    redirect(`/${locale}/onboarding/website-type`);
  }
  if (user.onboarding_completed_at) {
    redirect(onboardingHref(locale, nextOnboardingStep(user)));
  }

  const t = await getTranslations("onboarding.theme");
  const tSteps = await getTranslations("onboarding.steps");

  // Real themes from the database, filtered by the user's site type.
  // Public endpoint — no auth needed for the catalogue.
  const apiThemes = await apiFetch<{ data: ApiTheme[] }>(
    `/api/themes?website_type=${encodeURIComponent(user.website_type)}`
  )
    .then((r) => r.data)
    .catch(() => [] as ApiTheme[]);

  const themes: OnboardingTheme[] = apiThemes.map((t) => ({
    slug: t.slug,
    name: t.name,
    tagline: extractDescription(t.manifest),
    primary: tokenValue(t.tokens, "color.primary") ?? "#1f6452",
    accent: tokenValue(t.tokens, "color.accent") ?? "#c18f2c",
    background: tokenValue(t.tokens, "color.background") ?? "#fbf7ee",
    isDefault: t.is_default,
  }));

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

function tokenValue(
  tokens: Record<string, { default: string }> | null,
  key: string
): string | null {
  return tokens?.[key]?.default ?? null;
}

function extractDescription(manifest: Record<string, unknown> | null): string {
  const d = manifest?.description;
  return typeof d === "string" ? d : "";
}
