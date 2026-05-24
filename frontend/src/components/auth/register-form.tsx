"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { registerAction } from "@/app/actions/auth";
import { initialAuthState } from "@/lib/auth-state";
import { COUNTRIES } from "@/lib/countries";
import {
  Field,
  FormBanner,
  PhoneField,
  SelectField,
  SubmitButton,
} from "./form-primitives";
import { Turnstile } from "./turnstile";

interface Props {
  locale: string;
}

export function RegisterForm({ locale }: Props) {
  const t = useTranslations("auth.register");
  const [state, formAction] = useActionState(registerAction, initialAuthState);

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <input type="hidden" name="locale" value={locale} />

      {state?.status === "error" && (
        <FormBanner status="error" message={state.message} />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="name"
          type="text"
          label={t("name")}
          placeholder={t("namePlaceholder")}
          autoComplete="name"
          required
          errors={state?.errors?.name}
        />
        <Field
          id="organization_name"
          type="text"
          label={t("organization")}
          placeholder={t("organizationPlaceholder")}
          autoComplete="organization"
          required
          errors={state?.errors?.organization_name}
        />
      </div>

      <Field
        id="email"
        type="email"
        label={t("email")}
        placeholder={t("emailPlaceholder")}
        autoComplete="email"
        required
        errors={state?.errors?.email}
      />

      <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr]">
        <PhoneField
          id="phone"
          label={t("phone")}
          placeholder={t("phonePlaceholder")}
          required
          errors={state?.errors?.phone}
        />
        <SelectField
          id="country"
          label={t("country")}
          placeholder={t("countryPlaceholder")}
          required
          options={COUNTRIES.map((c) => ({ value: c.label, label: c.label }))}
          errors={state?.errors?.country}
        />
      </div>

      <Field
        id="password"
        type="password"
        label={t("password")}
        placeholder={t("passwordPlaceholder")}
        autoComplete="new-password"
        required
        errors={state?.errors?.password}
        hint={t("passwordHint")}
      />

      <Turnstile locale={locale} />

      <SubmitButton className="mt-2">{t("submit")}</SubmitButton>

      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        {t("terms")}
      </p>
    </form>
  );
}
