"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tier {
  key: "free" | "growth" | "institution";
  name: string;
  monthly: string;
  yearly: string;
  desc: string;
  cta: string;
  features: string[];
  highlighted?: boolean;
}

interface Props {
  locale: string;
  tiers: Tier[];
  labels: {
    monthly: string;
    yearly: string;
    save: string;
    perMonth: string;
    perYear: string;
    mostPopular: string;
    guarantee: string;
  };
}

export function PricingTiers({ locale, tiers, labels }: Props) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");

  return (
    <>
      {/* Billing toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1 shadow-soft">
          {(["monthly", "yearly"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setBilling(opt)}
              className={cn(
                "relative rounded-full px-5 py-2 text-sm font-medium transition-colors",
                billing === opt
                  ? "text-background"
                  : "text-foreground-soft hover:text-foreground"
              )}
            >
              {billing === opt && (
                <motion.span
                  layoutId="billing-pill"
                  className="absolute inset-0 -z-0 rounded-full bg-foreground"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-2">
                {opt === "monthly" ? labels.monthly : labels.yearly}
                {opt === "yearly" && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      billing === "yearly"
                        ? "bg-gold text-white"
                        : "bg-gold-50 text-gold-700"
                    )}
                  >
                    {labels.save}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tier cards */}
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => {
          const price = billing === "monthly" ? tier.monthly : tier.yearly;
          const period = billing === "monthly" ? labels.perMonth : labels.perYear;
          return (
            <div
              key={tier.key}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-surface p-7 shadow-soft transition-shadow hover:shadow-card sm:p-8",
                tier.highlighted
                  ? "border-brand bg-gradient-to-b from-brand-50/60 to-surface shadow-card"
                  : "border-border"
              )}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-card">
                  {labels.mostPopular}
                </span>
              )}

              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {tier.name}
                </h3>
              </div>
              <p className="mt-1 text-sm text-foreground-soft">{tier.desc}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <motion.span
                  key={price}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-5xl font-bold tracking-tight text-foreground"
                >
                  {price}
                </motion.span>
                <span className="text-sm text-muted-foreground">{period}</span>
              </div>

              <Link
                href={`/${locale}/register?plan=${tier.key}&billing=${billing}`}
                className={cn(
                  "group/btn mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold shadow-soft transition-all",
                  tier.highlighted
                    ? "bg-brand text-white hover:bg-brand-600"
                    : "border border-border bg-background text-foreground hover:border-brand/40 hover:text-brand"
                )}
              >
                {tier.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 rtl:rotate-180 rtl:group-hover/btn:-translate-x-0.5" />
              </Link>

              <ul className="mt-7 space-y-3 border-t border-border pt-6">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm text-foreground"
                  >
                    <span
                      className={cn(
                        "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                        tier.highlighted
                          ? "bg-brand text-white"
                          : "bg-brand-50 text-brand"
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-brand" />
        {labels.guarantee}
      </p>
    </>
  );
}
