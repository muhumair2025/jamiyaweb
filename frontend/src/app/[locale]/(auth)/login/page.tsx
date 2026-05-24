import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage(props: PageProps<"/[locale]/login">) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const sp = await props.searchParams;
  const resetSuccess = sp?.reset === "1";

  const user = await getCurrentUser();
  if (user) {
    redirect(
      user.website_type
        ? `/${locale}/dashboard`
        : `/${locale}/onboarding/website-type`
    );
  }

  const t = await getTranslations("auth.login");

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight text-foreground sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-foreground-soft">{t("subtitle")}</p>

      <div className="mt-8">
        <LoginForm locale={locale} resetSuccess={resetSuccess} />
      </div>

      <p className="mt-7 text-sm text-foreground-soft">
        {t("noAccount")}{" "}
        <Link
          href={`/${locale}/register`}
          className="font-semibold text-brand hover:underline"
        >
          {t("signUp")}
        </Link>
      </p>
    </div>
  );
}
