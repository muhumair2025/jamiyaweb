"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { loginAction } from "@/app/actions/auth";
import { initialAuthState } from "@/lib/auth-state";
import { Field, FormBanner, SubmitButton } from "./form-primitives";
import { Turnstile } from "./turnstile";

interface Props {
  locale: string;
  resetSuccess?: boolean;
}

export function LoginForm({ locale, resetSuccess }: Props) {
  const t = useTranslations("auth.login");
  const [state, formAction] = useActionState(loginAction, initialAuthState);

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <input type="hidden" name="locale" value={locale} />

      {resetSuccess && (
        <FormBanner status="success" message={t("resetSuccess")} />
      )}

      {state?.status === "error" && (
        <FormBanner status="error" message={state.message} />
      )}

      <Field
        id="email"
        type="email"
        label={t("email")}
        placeholder={t("emailPlaceholder")}
        autoComplete="email"
        required
        errors={state?.errors?.email}
      />

      <Field
        id="password"
        type="password"
        label={t("password")}
        placeholder={t("passwordPlaceholder")}
        autoComplete="current-password"
        required
        errors={state?.errors?.password}
        rightAddon={
          <Link
            href={`/${locale}/forgot-password`}
            className="text-xs font-medium text-brand hover:underline"
          >
            {t("forgot")}
          </Link>
        }
      />

      <Turnstile locale={locale} />

      <SubmitButton className="mt-2">{t("submit")}</SubmitButton>
    </form>
  );
}
