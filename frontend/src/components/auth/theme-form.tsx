"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { setThemeAction } from "@/app/actions/auth";
import { initialAuthState } from "@/lib/auth-state";
import type { DummyTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { FormBanner, SubmitButton } from "./form-primitives";

interface Props {
  locale: string;
  themes: DummyTheme[];
  initialSelected: string | null;
}

export function ThemeForm({ locale, themes, initialSelected }: Props) {
  const t = useTranslations("onboarding.theme");
  const tThemes = useTranslations("onboarding.theme.themes");
  const [selected, setSelected] = useState<string>(
    initialSelected && themes.some((t) => t.id === initialSelected)
      ? initialSelected
      : themes[0]?.id ?? ""
  );
  const [state, formAction] = useActionState(setThemeAction, initialAuthState);

  return (
    <form action={formAction} className="grid gap-8">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="theme_id" value={selected} />

      {state?.status === "error" && (
        <FormBanner status="error" message={state.message} />
      )}

      {/* Theme grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        {themes.map((theme, i) => {
          const active = selected === theme.id;
          return (
            <motion.button
              key={theme.id}
              type="button"
              onClick={() => setSelected(theme.id)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.04 + i * 0.05 }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border bg-surface text-start transition-all",
                active
                  ? "border-brand shadow-card ring-1 ring-brand/20"
                  : "border-border hover:border-brand/30 hover:shadow-soft hover:-translate-y-0.5"
              )}
              aria-pressed={active}
            >
              {/* Preview */}
              <div
                className={cn(
                  "relative h-40 overflow-hidden bg-gradient-to-br",
                  theme.gradient
                )}
              >
                <div
                  aria-hidden
                  className="absolute inset-0 bg-arabesque opacity-50"
                />
                {/* Faux site card */}
                <div className="absolute inset-x-6 bottom-0 origin-bottom translate-y-3 overflow-hidden rounded-t-lg border border-white/20 bg-surface shadow-elevated transition-transform duration-500 group-hover:-translate-y-1">
                  <div className="border-b border-border bg-muted/60 px-2 py-1">
                    <span className="inline-flex h-1 w-1 rounded-full bg-foreground/30" />
                  </div>
                  <div className="space-y-1 p-2">
                    <div className={cn("h-1.5 w-2/3 rounded", theme.accent)} />
                    <div className="h-1 w-1/2 rounded bg-foreground/15" />
                    <div className="mt-1 grid grid-cols-3 gap-0.5">
                      {[0, 1, 2].map((j) => (
                        <div
                          key={j}
                          className="h-4 rounded bg-foreground/5"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {/* Selected indicator */}
                {active && (
                  <span className="absolute end-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white shadow-card">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                )}
              </div>

              {/* Meta */}
              <div className="p-5">
                <h3 className="text-base font-semibold text-foreground">
                  {tThemes(`${theme.id}.name`)}
                </h3>
                <p className="mt-1 text-sm text-foreground-soft">
                  {tThemes(`${theme.id}.tagline`)}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {theme.features.map((f) => (
                    <span
                      key={f}
                      className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Action bar */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/${locale}/onboarding/website-type`}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-border bg-surface px-5 text-sm font-medium text-foreground-soft transition-colors hover:border-brand/40 hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          {t("back")}
        </Link>
        <SubmitButton className="h-11 sm:w-auto sm:px-8">
          {t("submit")}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </SubmitButton>
      </div>
    </form>
  );
}
