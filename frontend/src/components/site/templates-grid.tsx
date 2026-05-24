"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface Template {
  key: string;
  category: string;
  gradient: string;
  isNew?: boolean;
}

interface Props {
  locale: string;
  templates: Template[];
  categories: { value: string; label: string }[];
  items: Record<string, { name: string; desc: string }>;
  labels: {
    preview: string;
    useTemplate: string;
    newBadge: string;
  };
}

export function TemplatesGrid({
  locale,
  templates,
  categories,
  items,
  labels,
}: Props) {
  const [active, setActive] = useState("all");

  const filtered = useMemo(
    () =>
      active === "all"
        ? templates
        : templates.filter((t) => t.category === active),
    [active, templates]
  );

  return (
    <>
      {/* Filter pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((c) => {
          const isActive = active === c.value;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => setActive(c.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-foreground bg-foreground text-background shadow-soft"
                  : "border-border bg-surface text-foreground-soft hover:border-brand/40 hover:text-brand"
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <motion.div
        layout
        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((tpl) => {
            const it = items[tpl.key];
            return (
              <motion.article
                key={tpl.key}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface shadow-soft transition-shadow hover:shadow-card"
              >
                {/* Preview */}
                <div className="relative overflow-hidden">
                  <div
                    className={cn(
                      "relative h-56 bg-gradient-to-br",
                      tpl.gradient
                    )}
                  >
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-arabesque opacity-50"
                    />
                    {/* Faux site */}
                    <div className="absolute inset-x-8 bottom-0 origin-bottom translate-y-3 overflow-hidden rounded-t-xl border border-white/20 bg-surface shadow-elevated transition-transform duration-500 group-hover:-translate-y-1">
                      <div className="border-b border-border bg-muted/60 px-3 py-1.5">
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-foreground/30" />
                      </div>
                      <div className="space-y-1.5 p-3">
                        <div className="h-1.5 w-2/3 rounded bg-foreground/15" />
                        <div className="h-1 w-1/2 rounded bg-foreground/10" />
                        <div className="mt-2 grid grid-cols-3 gap-1">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="h-6 rounded bg-foreground/5"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {tpl.isNew && (
                    <span className="absolute top-3 end-3 rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-card">
                      {labels.newBadge}
                    </span>
                  )}
                </div>

                {/* Meta */}
                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
                      {categories.find((c) => c.value === tpl.category)?.label}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-foreground">
                    {it.name}
                  </h3>
                  <p className="mt-1 text-sm text-foreground-soft">{it.desc}</p>

                  <div className="mt-5 flex items-center gap-2">
                    <Link
                      href={`/${locale}/templates/${tpl.key}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-xs font-semibold text-foreground transition-colors hover:border-brand/40 hover:text-brand"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {labels.preview}
                    </Link>
                    <Link
                      href={`/${locale}/register?template=${tpl.key}`}
                      className="group/btn inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-foreground px-3.5 text-xs font-semibold text-background transition-colors hover:bg-brand"
                    >
                      {labels.useTemplate}
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 rtl:-scale-x-100" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
