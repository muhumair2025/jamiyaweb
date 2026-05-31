"use client";

import { Check } from "lucide-react";
import { useBuilderStore } from "@/builder/store";
import { getSectionVariants } from "@/engine/component-registry";
import { cn } from "@/lib/utils";

interface Props {
  sectionId: string;
  sectionSlug: string;
  /** Current `settings.variant` value (or null if not yet set). */
  currentVariant: string | null;
}

/**
 * Variants tab — visual gallery of the pre-built styles a section ships with.
 *
 * Clicking a card writes `settings.variant = id` via the same shallow-merge
 * `updateSettings` action the Content tab uses, so it slots into history
 * (undo/redo) and triggers the normal re-render.
 */
export function VariantsPanel({ sectionId, sectionSlug, currentVariant }: Props) {
  const updateSettings = useBuilderStore((s) => s.updateSettings);
  const variants = getSectionVariants(sectionSlug);

  if (variants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
        <p className="text-sm font-medium text-foreground">No variants yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          This section ships with a single layout.
        </p>
      </div>
    );
  }

  // Treat "no variant set" as the first variant — keeps existing pages stable.
  const activeId = currentVariant ?? variants[0]?.id ?? null;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Pick a layout style for this section. Your content, colours, and
        per-element tweaks carry across variants.
      </p>

      <div className="grid grid-cols-1 gap-3">
        {variants.map((variant) => {
          const isActive = variant.id === activeId;
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => {
                if (isActive) return;
                updateSettings(sectionId, { variant: variant.id });
              }}
              aria-pressed={isActive}
              className={cn(
                "group relative overflow-hidden rounded-xl border bg-card text-start transition-all",
                "hover:border-brand/60 hover:shadow-md",
                isActive
                  ? "border-brand shadow-[0_0_0_2px_rgba(32,102,92,0.18)]"
                  : "border-border"
              )}
            >
              {/* Thumbnail */}
              <div className="relative aspect-[5/3] w-full overflow-hidden bg-muted">
                {variant.thumbnail}

                {isActive && (
                  <span className="absolute end-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white shadow-md">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                )}
              </div>

              {/* Label + description */}
              <div className="px-3 py-2.5">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isActive ? "text-brand" : "text-foreground"
                  )}
                >
                  {variant.label}
                </p>
                {variant.description && (
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                    {variant.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
