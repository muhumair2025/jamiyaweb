import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ForgotForm } from "@/components/auth/forgot-form";

export default async function ForgotPasswordPage(
  props: PageProps<"/[locale]/forgot-password">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations("auth.forgot");

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight text-foreground sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-foreground-soft">{t("subtitle")}</p>

      <div className="mt-8">
        <ForgotForm locale={locale} />
      </div>

      <p className="mt-7">
        <Link
          href={`/${locale}/login`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          {t("back")}
        </Link>
      </p>
    </div>
  );
}
