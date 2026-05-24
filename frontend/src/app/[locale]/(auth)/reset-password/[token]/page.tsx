import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ResetForm } from "@/components/auth/reset-form";

export default async function ResetPasswordPage(
  props: PageProps<"/[locale]/reset-password/[token]">
) {
  const { locale, token } = await props.params;
  setRequestLocale(locale);

  const sp = await props.searchParams;
  const email = typeof sp?.email === "string" ? sp.email : "";

  if (!token || !email) notFound();

  const t = await getTranslations("auth.reset");

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight text-foreground sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-foreground-soft">{t("subtitle")}</p>

      <div className="mt-8">
        <ResetForm locale={locale} token={token} email={email} />
      </div>
    </div>
  );
}
