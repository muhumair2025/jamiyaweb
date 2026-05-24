import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { LogoutButton } from "@/components/auth/logout-button";
import { getCurrentUser } from "@/lib/auth";
import { nextOnboardingStep, onboardingHref } from "@/lib/onboarding";

export default async function DashboardPage(
  props: PageProps<"/[locale]/dashboard">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  // Funnel through any incomplete onboarding step
  const step = nextOnboardingStep(user);
  if (step !== "done") redirect(onboardingHref(locale, step));

  const verified = !!user.email_verified_at;

  return (
    <div className="min-h-screen bg-paper">
      {/* Top bar */}
      <header className="border-b border-border bg-surface/80 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link href={`/${locale}`} className="flex items-center">
            <Image
              src="/logo.png"
              alt="JamiyaWeb"
              width={140}
              height={40}
              priority
              className="h-9 w-auto"
            />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-foreground-soft sm:inline">
              {user.name}
            </span>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <LogoutButton locale={locale} />
          </div>
        </Container>
      </header>

      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Assalamu alaikum, {user.name.split(" ")[0]} 👋
            </h1>
            <p className="mt-2 text-base text-foreground-soft">
              Your account is set up. Builder, themes and tenant creation come
              next — this is a placeholder so you can verify auth end-to-end.
            </p>
          </div>

          {/* Verification banner */}
          <div
            className={`flex items-start gap-3 rounded-2xl border p-5 ${
              verified
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {verified ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {verified
                  ? "Email verified"
                  : "Please verify your email"}
              </p>
              <p className="mt-1 text-sm">
                {verified
                  ? "You're all set. You can publish websites on a custom domain on the Growth plan."
                  : "We sent a verification link to your inbox. Click it to verify your account."}
              </p>
              {!verified && (
                <Link
                  href={`/${locale}/verify-email`}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold underline"
                >
                  Open verification page
                </Link>
              )}
            </div>
          </div>

          {/* Account summary */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8">
            <h2 className="text-lg font-semibold text-foreground">
              Your account
            </h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <Detail label="Name" value={user.name} />
              <Detail label="Email" value={user.email} />
              <Detail label="Website type" value={user.website_type ?? "—"} />
              <Detail
                label="Status"
                value={verified ? "Verified" : "Unverified"}
              />
            </dl>
          </div>

          {/* Next step placeholder */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand-800 to-brand-900 p-6 text-white shadow-card sm:p-8">
            <div
              aria-hidden
              className="absolute inset-0 bg-arabesque opacity-40"
            />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
                <Sparkles className="h-3 w-3" />
                Coming next
              </span>
              <h3 className="mt-3 text-xl font-semibold">
                Choose a theme and create your first website
              </h3>
              <p className="mt-2 text-sm text-white/75">
                Once the theme engine ships, you'll pick a template and your
                site goes live on a free .jamiyaweb.com subdomain.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
