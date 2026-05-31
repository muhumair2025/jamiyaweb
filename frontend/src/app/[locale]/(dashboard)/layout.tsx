import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentWebsite } from "@/lib/websites";
import { nextOnboardingStep, onboardingHref } from "@/lib/onboarding";
import type { Locale } from "@/i18n/routing";

/**
 * Tenant admin shell — sidebar + topbar + content area.
 * Every page under (dashboard)/ inherits this layout.
 *
 * Auth + onboarding funnel run once here, so individual pages don't
 * need to repeat the redirect dance.
 */
export default async function DashboardLayout(
  props: LayoutProps<"/[locale]">
) {
  const { locale } = (await props.params) as { locale: Locale };
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  // Funnel through any incomplete onboarding step
  const step = nextOnboardingStep(user);
  if (step !== "done") redirect(onboardingHref(locale, step));

  const website = await getCurrentWebsite();

  // Edge case: user has `onboarding_completed_at` set but the website
  // creation failed (network blip, transient DB error during the auto-
  // provisioning step). Without a website, the dashboard is unusable —
  // sidebar context card, builder link, theme switcher all assume one
  // exists. Send the user back to the customise step so re-submitting
  // re-runs WebsiteCreator (idempotent — it no-ops if a website appears
  // in the meantime).
  if (!website) {
    redirect(`/${locale}/onboarding/customize?reason=missing-website`);
  }

  const websiteForNav = {
    id: website.id,
    site_name: website.site_name,
    subdomain: website.subdomain,
    status: website.status,
  };

  const userForNav = {
    name: user.name,
    email: user.email,
    organization_name: user.organization_name,
  };

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar locale={locale} website={websiteForNav} user={userForNav} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar locale={locale} website={websiteForNav} user={userForNav} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {props.children}
        </main>
      </div>
    </div>
  );
}
