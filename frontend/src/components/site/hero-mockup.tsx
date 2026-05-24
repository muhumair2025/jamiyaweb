"use client";

import { motion } from "motion/react";
import { Heart, Users, BookOpen, GraduationCap } from "lucide-react";

interface Props {
  url: string;
  heroTitle: string;
  heroSub: string;
  donateCta: string;
  studentsLabel: string;
  scholarsLabel: string;
  yearsLabel: string;
  floatingChip?: string;
}

export function HeroMockup({
  url,
  heroTitle,
  heroSub,
  donateCta,
  studentsLabel,
  scholarsLabel,
  yearsLabel,
  floatingChip,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full"
    >
      {/* Soft brand glow */}
      <div
        aria-hidden
        className="absolute inset-x-8 -bottom-12 h-40 rounded-full bg-brand/30 blur-3xl"
      />

      {/* ─────── LAPTOP ─────── */}
      <div className="relative">
        {/* Screen */}
        <div className="relative overflow-hidden rounded-t-2xl border border-foreground/15 bg-surface shadow-elevated">
          {/* Title bar */}
          <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-3 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff6056]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c941]" />
            <div
              dir="ltr"
              className="mx-auto inline-flex max-w-[260px] items-center gap-1.5 truncate rounded-md bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground"
            >
              <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-brand" />
              {url}
            </div>
          </div>

          {/* Faux Jamiya site */}
          <div className="relative bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 px-6 py-8 sm:px-8 sm:py-10">
            <div aria-hidden className="absolute inset-0 bg-arabesque opacity-50" />
            <div className="relative grid gap-6 sm:grid-cols-5 sm:items-center">
              <div className="sm:col-span-3">
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/80 backdrop-blur">
                  Madrasah
                </span>
                <h3 className="mt-2 font-arabic-auto text-xl font-bold leading-tight text-white sm:text-2xl">
                  {heroTitle}
                </h3>
                <p className="mt-1.5 text-xs text-white/70 sm:text-sm">
                  {heroSub}
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-[11px] font-semibold text-white shadow-card sm:text-xs"
                >
                  <Heart className="h-3 w-3 fill-white" />
                  {donateCta}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:col-span-2">
                <Stat icon={Users} value="3.2K" label={studentsLabel} />
                <Stat icon={GraduationCap} value="48" label={scholarsLabel} />
                <Stat icon={BookOpen} value="60" label={yearsLabel} />
              </div>
            </div>
          </div>

          {/* Faux content rows */}
          <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-muted/30 p-3"
              >
                <div className="h-14 rounded bg-gradient-to-br from-brand-100 to-gold-50" />
                <div className="mt-2 h-2 w-3/4 rounded-full bg-foreground/10" />
                <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-foreground/5" />
              </div>
            ))}
          </div>
        </div>

        {/* Laptop base / hinge */}
        <div className="relative mx-auto h-3 w-[105%] -translate-x-[2.5%] rounded-b-2xl bg-gradient-to-b from-foreground/20 to-foreground/40" />
        <div className="mx-auto h-1.5 w-1/3 rounded-b-xl bg-foreground/15" />

        {/* ─────── iPHONE OVERLAY ─────── */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -bottom-8 end-2 hidden w-[160px] sm:block lg:end-4 lg:-bottom-10 lg:w-[180px]"
        >
          <div className="overflow-hidden rounded-[2rem] border-[10px] border-foreground bg-surface shadow-elevated">
            {/* Notch */}
            <div className="relative h-6 bg-foreground">
              <span className="absolute start-1/2 top-1.5 h-3 w-16 -translate-x-1/2 rounded-full bg-black" />
            </div>
            {/* Phone screen */}
            <div className="bg-background">
              {/* Status bar */}
              <div
                dir="ltr"
                className="flex items-center justify-between px-3 py-1 text-[8px] font-semibold text-foreground"
              >
                <span>9:41</span>
                <span className="inline-flex gap-0.5">
                  <span className="h-1.5 w-1 rounded-sm bg-foreground" />
                  <span className="h-1.5 w-1 rounded-sm bg-foreground" />
                  <span className="h-1.5 w-1 rounded-sm bg-foreground" />
                </span>
              </div>
              {/* App nav */}
              <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
                <span className="text-[8px] font-semibold uppercase tracking-wider text-brand">
                  Donate
                </span>
                <span className="inline-flex gap-0.5">
                  <span className="h-0.5 w-3 rounded bg-foreground/40" />
                </span>
              </div>
              {/* Hero block */}
              <div className="relative bg-gradient-to-br from-brand-700 to-brand-900 p-3 text-white">
                <div aria-hidden className="absolute inset-0 bg-arabesque opacity-40" />
                <div className="relative">
                  <p className="font-arabic-auto text-[11px] font-bold">
                    حملة رمضان
                  </p>
                  <p className="mt-0.5 text-[7px] text-white/70">
                    Ramadan campaign
                  </p>
                  <button
                    type="button"
                    className="mt-2 w-full rounded-full bg-gold px-2 py-0.5 text-[8px] font-bold text-white"
                  >
                    Donate
                  </button>
                </div>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-1 p-2">
                <div className="rounded bg-muted/50 p-1.5">
                  <p className="text-[10px] font-bold text-brand">$2.8K</p>
                  <p className="text-[7px] text-muted-foreground">Today</p>
                </div>
                <div className="rounded bg-muted/50 p-1.5">
                  <p className="text-[10px] font-bold text-gold-700">132</p>
                  <p className="text-[7px] text-muted-foreground">Donors</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating chip — bottom, alweb-style */}
      {floatingChip && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="mx-auto mt-12 w-fit rounded-full border border-border bg-surface px-4 py-2 shadow-card sm:mt-10"
        >
          <p className="inline-flex items-center gap-2 text-xs font-medium text-foreground sm:text-sm">
            <span className="inline-flex h-2 w-2 rounded-full bg-brand" />
            {floatingChip}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded bg-white/10 px-1 py-2 text-center backdrop-blur">
      <Icon className="mx-auto h-3 w-3 text-gold-200" />
      <p className="mt-0.5 text-xs font-bold text-white sm:text-sm">{value}</p>
      <p className="mt-0.5 text-[8px] uppercase tracking-wide text-white/60">
        {label}
      </p>
    </div>
  );
}
