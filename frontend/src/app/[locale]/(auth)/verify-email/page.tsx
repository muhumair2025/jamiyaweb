import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2, MailCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { ResendVerificationButton } from "@/components/auth/resend-verification-button";

export default async function VerifyEmailPage(
  props: PageProps<"/[locale]/verify-email">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const sp = await props.searchParams;
  const justVerified = sp?.verified === "1";

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  const t = await getTranslations("auth.verify");
  const isVerified = !!user.email_verified_at;
  const dashHref = user.website_type
    ? `/${locale}/dashboard`
    : `/${locale}/onboarding/website-type`;

  return (
    <div>
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand">
        {isVerified ? (
          <CheckCircle2 className="h-6 w-6" />
        ) : (
          <MailCheck className="h-6 w-6" />
        )}
      </span>
      <h1 className="mt-5 text-[28px] font-semibold tracking-tight text-foreground sm:text-3xl">
        {isVerified ? t("verifiedTitle") : t("title")}
      </h1>
      <p className="mt-2 text-sm text-foreground-soft">
        {isVerified
          ? t("verifiedSubtitle")
          : t("subtitle", { email: user.email })}
      </p>
      {justVerified && !isVerified && (
        <p className="mt-2 text-xs text-amber-600">
          Refresh the page in a moment to reflect the new status.
        </p>
      )}

      <div className="mt-8 grid gap-3">
        {isVerified ? (
          <Link
            href={dashHref}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-semibold text-background shadow-soft transition-colors hover:bg-brand"
          >
            {t("goToDashboard")}
          </Link>
        ) : (
          <ResendVerificationButton />
        )}
      </div>
    </div>
  );
}
