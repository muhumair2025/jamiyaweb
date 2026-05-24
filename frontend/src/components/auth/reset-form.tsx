"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { resetPasswordAction } from "@/app/actions/auth";
import { initialAuthState } from "@/lib/auth-state";
import { Field, FormBanner, SubmitButton } from "./form-primitives";

interface Props {
  locale: string;
  token: string;
  email: string;
}

export function ResetForm({ locale, token, email }: Props) {
  const t = useTranslations("auth.register");
  const tReset = useTranslations("auth.reset");
  const [state, formAction] = useActionState(
    resetPasswordAction,
    initialAuthState
  );

  return (
    <form action={formAction} className="grid gap-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="token" value={token} />

      {state?.status === "error" && (
        <FormBanner status="error" message={state.message} />
      )}

      <Field
        id="email"
        type="email"
        label={tReset("email")}
        defaultValue={email}
        readOnly
        required
        errors={state?.errors?.email}
      />

      <Field
        id="password"
        type="password"
        label={tReset("password")}
        placeholder={t("passwordPlaceholder")}
        autoComplete="new-password"
        required
        errors={state?.errors?.password}
      />

      <Field
        id="password_confirmation"
        type="password"
        label={tReset("confirmPassword")}
        placeholder={t("passwordPlaceholder")}
        autoComplete="new-password"
        required
      />

      <SubmitButton>{tReset("submit")}</SubmitButton>
    </form>
  );
}
