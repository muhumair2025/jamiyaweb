import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage(
  props: PageProps<"/[locale]/register">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (user) {
    redirect(
      user.website_type
        ? `/${locale}/dashboard`
        : `/${locale}/onboarding/website-type`
    );
  }

  const t = await getTranslations("auth.register");

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight text-foreground sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-foreground-soft">{t("subtitle")}</p>

      <div className="mt-8">
        <RegisterForm locale={locale} />
      </div>

      <p className="mt-7 text-sm text-foreground-soft">
        {t("haveAccount")}{" "}
        <Link
          href={`/${locale}/login`}
          className="font-semibold text-brand hover:underline"
        >
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
