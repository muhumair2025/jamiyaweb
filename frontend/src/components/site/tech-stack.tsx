"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface Item {
  name: string;
  /** Inline SVG / text node for the logo */
  logo: React.ReactNode;
}

const ITEMS: Item[] = [
  {
    name: "Next.js",
    logo: (
      <span className="font-display text-xl font-bold tracking-tight text-foreground">
        next<span className="text-foreground/40">.js</span>
      </span>
    ),
  },
  {
    name: "React",
    logo: (
      <span className="inline-flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#149eca]" fill="currentColor">
          <circle cx="12" cy="12" r="2" />
          <path
            d="M12 5c4.97 0 9 3.13 9 7s-4.03 7-9 7-9-3.13-9-7 4.03-7 9-7z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M5.5 7.5c2.5-4.3 7.5-6 11-4s5 7 2.5 11.3-7.5 6-11 4-5-7-2.5-11.3z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M18.5 7.5c2.5 4.3 1.5 9.3-2 11.3s-8.5.3-11-4-1.5-9.3 2-11.3 8.5-.3 11 4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
        <span className="font-display text-lg font-semibold text-foreground">React</span>
      </span>
    ),
  },
  {
    name: "Laravel",
    logo: (
      <span className="font-display text-xl font-extrabold italic tracking-tight text-[#ef3b2d]">
        Laravel
      </span>
    ),
  },
  {
    name: "Tailwind",
    logo: (
      <span className="inline-flex items-center gap-1.5">
        <svg viewBox="0 0 32 19" className="h-5 w-8 text-[#38bdf8]" fill="currentColor">
          <path d="M16 0c-4.27 0-6.94 2.13-8 6.4 1.6-2.13 3.47-2.93 5.6-2.4 1.22.3 2.09 1.18 3.05 2.15C18.21 7.74 20.03 9.6 24 9.6c4.27 0 6.94-2.13 8-6.4-1.6 2.13-3.47 2.93-5.6 2.4-1.22-.3-2.09-1.18-3.05-2.15C21.79 1.86 19.97 0 16 0zM8 9.6c-4.27 0-6.94 2.13-8 6.4 1.6-2.13 3.47-2.93 5.6-2.4 1.22.3 2.09 1.18 3.05 2.15C10.21 17.34 12.03 19.2 16 19.2c4.27 0 6.94-2.13 8-6.4-1.6 2.13-3.47 2.93-5.6 2.4-1.22-.3-2.09-1.18-3.05-2.15C13.79 11.46 11.97 9.6 8 9.6z" />
        </svg>
        <span className="font-display text-lg font-semibold text-foreground">Tailwind</span>
      </span>
    ),
  },
  {
    name: "Sanctum",
    logo: (
      <span className="inline-flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>
        <span className="font-display text-lg font-semibold text-foreground">Sanctum</span>
      </span>
    ),
  },
  {
    name: "MySQL",
    logo: (
      <span className="inline-flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#00758f]" fill="currentColor">
          <ellipse cx="12" cy="4" rx="9" ry="2.5" />
          <path d="M3 4v6c0 1.4 4 2.5 9 2.5s9-1.1 9-2.5V4c0 1.4-4 2.5-9 2.5S3 5.4 3 4z" />
          <path d="M3 10v6c0 1.4 4 2.5 9 2.5s9-1.1 9-2.5v-6c0 1.4-4 2.5-9 2.5s-9-1.1-9-2.5z" opacity=".6" />
        </svg>
        <span className="font-display text-lg font-semibold text-foreground">MySQL</span>
      </span>
    ),
  },
  {
    name: "Filament",
    logo: (
      <span className="font-display text-xl font-extrabold italic tracking-tight text-[#f59e0b]">
        filament
      </span>
    ),
  },
  {
    name: "Motion",
    logo: (
      <span className="inline-flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-foreground" fill="currentColor">
          <path d="M4 2l16 10L4 22V2z" />
        </svg>
        <span className="font-display text-lg font-semibold text-foreground">Motion</span>
      </span>
    ),
  },
];

interface Props {
  title: string;
  subtitle: string;
  caption: string;
}

export function TechStack({ title, subtitle, caption }: Props) {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      {/* Soft background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-brand-50/20 to-background"
      />

      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: reduce ? 0 : 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-3 text-sm text-foreground-soft sm:text-base"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Logo grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
          }}
          className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-4"
        >
          {ITEMS.map((item) => (
            <motion.div
              key={item.name}
              variants={{
                hidden: { opacity: 0, y: reduce ? 0 : 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className={cn(
                "group flex h-20 items-center justify-center rounded-2xl border border-border bg-surface px-4 transition-all duration-300",
                "hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-card sm:h-24"
              )}
            >
              <span className="grayscale-[40%] transition-all duration-300 group-hover:grayscale-0">
                {item.logo}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Caption pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mx-auto mt-10 w-fit rounded-full border border-border bg-surface px-4 py-2 shadow-soft"
        >
          <p className="text-xs text-foreground-soft sm:text-sm">{caption}</p>
        </motion.div>
      </div>
    </section>
  );
}
