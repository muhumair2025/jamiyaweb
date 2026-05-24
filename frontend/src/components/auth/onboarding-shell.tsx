import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { LogoutButton } from "@/components/auth/logout-button";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { cn } from "@/lib/utils";
import {
  ONBOARDING_STEPS,
  type OnboardingStep,
} from "@/lib/onboarding";
import type { Locale } from "@/i18n/routing";

interface Props {
  locale: string;
  /** Which step is currently active (controls stepper highlighting) */
  current: OnboardingStep;
  /** Page-level eyebrow above the title (e.g. "One quick question") */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Optional right-aligned helper text in the top bar */
  rightLabel?: string;
  /** Optional translated labels for the 3 steps */
  stepLabels?: { websiteType: string; theme: string; customize: string };
}

export function OnboardingShell({
  locale,
  current,
  eyebrow,
  title,
  subtitle,
  children,
  rightLabel,
  stepLabels,
}: Props) {
  const currentIndex =
    ONBOARDING_STEPS.find((s) => s.id === current)?.index ?? 1;

  const labels = stepLabels ?? {
    websiteType: "Pick type",
    theme: "Choose theme",
    customize: "Customise",
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* ── Top bar ── */}
      <header className="border-b border-border bg-surface/70 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link href={`/${locale}`} className="inline-flex items-center">
            <Image
              src="/logo.png"
              alt="JamiyaWeb"
              width={140}
              height={40}
              priority
              className="h-8 w-auto sm:h-9"
            />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            {rightLabel && (
              <span className="hidden text-xs font-medium text-muted-foreground lg:inline">
                {rightLabel}
              </span>
            )}
            <LanguageSwitcher currentLocale={locale as Locale} />
            <LogoutButton locale={locale} />
          </div>
        </Container>
      </header>

      <Container className="py-10 sm:py-16">
        <div className="mx-auto max-w-3xl">
          {/* ── Stepper ── */}
          <Stepper
            current={currentIndex}
            labels={[labels.websiteType, labels.theme, labels.customize]}
          />

          {/* ── Heading ── */}
          <div className="mt-10">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-widest text-brand">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 max-w-2xl text-base text-foreground-soft">
                {subtitle}
              </p>
            )}
          </div>

          {/* ── Body ── */}
          <div className="mt-10">{children}</div>
        </div>
      </Container>
    </div>
  );
}

function Stepper({
  current,
  labels,
}: {
  current: number;
  labels: string[];
}) {
  return (
    <ol
      className="flex w-full items-center gap-3 sm:gap-4"
      aria-label="Onboarding progress"
    >
      {labels.map((label, i) => {
        const index = i + 1;
        const isDone = index < current;
        const isActive = index === current;
        return (
          <li
            key={label}
            className="flex flex-1 items-center gap-3"
            aria-current={isActive ? "step" : undefined}
          >
            <span
              className={cn(
                "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold transition-colors",
                isDone
                  ? "bg-brand text-white"
                  : isActive
                  ? "bg-foreground text-background ring-4 ring-brand/10"
                  : "border border-border bg-surface text-muted-foreground"
              )}
            >
              {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : index}
            </span>
            <div className="hidden min-w-0 flex-1 sm:block">
              <p
                className={cn(
                  "truncate text-xs font-medium",
                  isActive
                    ? "text-foreground"
                    : isDone
                    ? "text-brand"
                    : "text-muted-foreground"
                )}
              >
                {label}
              </p>
            </div>
            {/* Connector */}
            {index < labels.length && (
              <span
                className={cn(
                  "h-px flex-1 rounded transition-colors",
                  isDone ? "bg-brand" : "bg-border"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
