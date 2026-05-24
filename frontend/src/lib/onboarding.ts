import type { ApiUser } from "./api";

export type OnboardingStep =
  | "website-type"
  | "theme"
  | "customize"
  | "done";

export const ONBOARDING_STEPS: { id: OnboardingStep; index: number; label: string }[] = [
  { id: "website-type", index: 1, label: "Pick type" },
  { id: "theme", index: 2, label: "Choose theme" },
  { id: "customize", index: 3, label: "Customise" },
];

/**
 * Returns the first incomplete onboarding step for a user — or "done" when
 * every step is filled in. Used by post-auth redirects and protected pages.
 */
export function nextOnboardingStep(user: ApiUser): OnboardingStep {
  if (!user.website_type) return "website-type";
  if (!user.selected_theme_id) return "theme";
  if (!user.onboarding_completed_at) return "customize";
  return "done";
}

export function onboardingHref(locale: string, step: OnboardingStep): string {
  if (step === "done") return `/${locale}/dashboard`;
  return `/${locale}/onboarding/${step}`;
}

/** Convenience: where should the user go right now? */
export function postAuthHref(user: ApiUser, locale: string): string {
  return onboardingHref(locale, nextOnboardingStep(user));
}
