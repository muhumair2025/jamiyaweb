"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useBuilderStore } from "@/builder/store";
import type { SectionMeta } from "@/engine/types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  catalog: SectionMeta[];
}

/**
 * Modal that lists every section the engine knows about. Picking one
 * creates a new SectionInstance with a fresh UUID + the section's
 * default settings, appends it to the page, and selects it.
 */
export function AddSectionDialog({ open, onClose, catalog }: Props) {
  const addSection = useBuilderStore((s) => s.addSection);

  // ESC + body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const [filter, setFilter] = useState<string>("all");
  const categories = Array.from(
    new Set(catalog.map((s) => s.category).filter(Boolean))
  ) as string[];

  const filtered =
    filter === "all" ? catalog : catalog.filter((s) => s.category === filter);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-foreground/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            className="fixed inset-x-0 top-1/2 z-[90] mx-auto w-[min(640px,92vw)] -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Add a section
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Pick a section from the catalogue.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground-soft hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Category filter */}
            {categories.length > 1 && (
              <div className="border-b border-border bg-background px-5 py-2">
                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    active={filter === "all"}
                    onClick={() => setFilter("all")}
                    label={`All (${catalog.length})`}
                  />
                  {categories.map((c) => (
                    <FilterChip
                      key={c}
                      active={filter === c}
                      onClick={() => setFilter(c)}
                      label={`${cap(c)} (${
                        catalog.filter((x) => x.category === c).length
                      })`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="grid max-h-[60vh] gap-2 overflow-y-auto p-4 sm:grid-cols-2">
              {filtered.length === 0 ? (
                <p className="col-span-full p-6 text-center text-sm text-muted-foreground">
                  No sections in this category.
                </p>
              ) : (
                filtered.map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => {
                      addSection({
                        id: crypto.randomUUID(),
                        type: s.slug,
                        settings: { ...(s.default_settings ?? {}) },
                      });
                      onClose();
                    }}
                    className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-start transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-card"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-[11px] font-bold uppercase tracking-wider text-brand">
                      {s.slug.split("-").map((p) => p.charAt(0)).join("").slice(0, 2)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {s.name}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                        {s.slug}
                      </p>
                      {s.category && (
                        <span className="mt-2 inline-flex rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          {s.category}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-foreground text-background"
          : "bg-surface text-foreground-soft hover:bg-muted"
      )}
    >
      {label}
    </button>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
