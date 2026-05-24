"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { HeartHandshake, BookUser, Check, ArrowRight } from "lucide-react";
import { setWebsiteTypeAction } from "@/app/actions/auth";
import { initialAuthState } from "@/lib/auth-state";
import { cn } from "@/lib/utils";
import { FormBanner, SubmitButton } from "./form-primitives";

const OPTIONS = [
  { value: "welfare", icon: HeartHandshake },
  { value: "scholar", icon: BookUser },
] as const;

export function WebsiteTypeForm({ locale }: { locale: string }) {
  const t = useTranslations("onboarding.websiteType");
  const tOpts = useTranslations("onboarding.websiteType.options");
  const [selected, setSelected] = useState<string>("welfare");
  const [state, formAction] = useActionState(
    setWebsiteTypeAction,
    initialAuthState
  );

  return (
    <form action={formAction} className="grid gap-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="website_type" value={selected} />

      {state?.status === "error" && (
        <FormBanner status="error" message={state.message} />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {OPTIONS.map(({ value, icon: Icon }, i) => {
          const active = selected === value;
          return (
            <motion.button
              key={value}
              type="button"
              onClick={() => setSelected(value)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 + i * 0.08 }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border bg-surface p-6 text-start transition-all sm:p-7",
                active
                  ? "border-brand shadow-card ring-1 ring-brand/20"
                  : "border-border hover:border-brand/30 hover:shadow-soft"
              )}
              aria-pressed={active}
            >
              {/* Decorative bg on active */}
              {active && (
                <div
                  aria-hidden
                  className="absolute inset-0 -z-0 bg-gradient-to-br from-brand-50/60 to-transparent"
                />
              )}
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      "inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                      active
                        ? "bg-brand text-white"
                        : "bg-brand-50 text-brand"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
                      active
                        ? "border-brand bg-brand text-white"
                        : "border-border-strong bg-surface"
                    )}
                  >
                    {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {tOpts(`${value}.title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground-soft">
                  {tOpts(`${value}.desc`)}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <SubmitButton className="mt-2 h-12">
        {t("submit")}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
      </SubmitButton>
    </form>
  );
}
