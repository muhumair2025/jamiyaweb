"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { forgotPasswordAction } from "@/app/actions/auth";
import { initialAuthState } from "@/lib/auth-state";
import { Field, FormBanner, SubmitButton } from "./form-primitives";
import { Turnstile } from "./turnstile";

export function ForgotForm({ locale }: { locale: string }) {
  const t = useTranslations("auth.forgot");
  const [state, formAction] = useActionState(
    forgotPasswordAction,
    initialAuthState
  );

  return (
    <form action={formAction} className="grid gap-5">
      {state?.status === "error" && (
        <FormBanner status="error" message={state.message} />
      )}
      {state?.status === "success" && (
        <FormBanner status="success" message={state.message} />
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

      <Turnstile locale={locale} />

      <SubmitButton>{t("submit")}</SubmitButton>
    </form>
  );
}
