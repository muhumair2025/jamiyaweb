"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { setThemeAction } from "@/app/actions/auth";
import { initialAuthState } from "@/lib/auth-state";
import { cn } from "@/lib/utils";
import { FormBanner, SubmitButton } from "./form-primitives";

export interface OnboardingTheme {
  /** DB slug — what the backend stores on `user.selected_theme_id`. */
  slug: string;
  name: string;
  tagline: string;
  /** Hex tokens used for the preview gradient + accent strip. */
  primary: string;
  accent: string;
  background: string;
  isDefault: boolean;
}

interface Props {
  locale: string;
  themes: OnboardingTheme[];
  initialSelected: string | null;
}

export function ThemeForm({ locale, themes, initialSelected }: Props) {
  const t = useTranslations("onboarding.theme");

  // Default selection priority: prior choice → DB default → first available.
  const defaultSlug =
    (initialSelected && themes.find((x) => x.slug === initialSelected)?.slug) ??
    themes.find((x) => x.isDefault)?.slug ??
    themes[0]?.slug ??
    "";

  const [selected, setSelected] = useState<string>(defaultSlug);
  const [state, formAction] = useActionState(setThemeAction, initialAuthState);

  // Empty state — no active themes seeded yet. Common during local dev
  // before the user runs `php artisan db:seed`.
  if (themes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
        <p className="text-base font-semibold text-foreground">
          No themes available
        </p>
        <p className="mt-2 text-sm text-foreground-soft">
          Run <code className="font-mono">php artisan db:seed</code> on the
          backend to install the theme catalogue, then refresh this page.
        </p>
      </div>
    );
  }

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
          const active = selected === theme.slug;
          return (
            <motion.button
              key={theme.slug}
              type="button"
              onClick={() => setSelected(theme.slug)}
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
              {/* Preview — gradient from the theme's own primary/accent tokens */}
              <div
                className="relative h-40 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
                }}
              >
                <div
                  aria-hidden
                  className="absolute inset-0 bg-arabesque opacity-40"
                />

                {/* Faux site card showing the theme's background colour */}
                <div
                  className="absolute inset-x-6 bottom-0 origin-bottom translate-y-3 overflow-hidden rounded-t-lg border border-white/20 shadow-elevated transition-transform duration-500 group-hover:-translate-y-1"
                  style={{ background: theme.background }}
                >
                  <div
                    className="border-b px-2 py-1"
                    style={{
                      borderColor: "rgba(0,0,0,0.08)",
                      background: "rgba(0,0,0,0.04)",
                    }}
                  >
                    <span className="inline-flex h-1 w-1 rounded-full bg-foreground/30" />
                  </div>
                  <div className="space-y-1 p-2">
                    <div
                      className="h-1.5 w-2/3 rounded"
                      style={{ background: theme.accent }}
                    />
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

                {active && (
                  <span className="absolute end-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white shadow-card">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                )}
              </div>

              {/* Meta */}
              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-foreground">
                    {theme.name}
                  </h3>
                  {theme.isDefault && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      Default
                    </span>
                  )}
                </div>
                {theme.tagline && (
                  <p className="mt-1 text-sm leading-relaxed text-foreground-soft">
                    {theme.tagline}
                  </p>
                )}

                {/* Color chips */}
                <div className="mt-3 flex items-center gap-1.5">
                  <ColorChip colour={theme.primary} />
                  <ColorChip colour={theme.accent} />
                  <ColorChip colour={theme.background} bordered />
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

function ColorChip({
  colour,
  bordered,
}: {
  colour: string;
  bordered?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "h-5 w-5 rounded-full",
        bordered ? "border border-border" : "shadow-soft"
      )}
      style={{ background: colour }}
    />
  );
}
