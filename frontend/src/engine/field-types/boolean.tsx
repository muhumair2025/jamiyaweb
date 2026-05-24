"use client";

import { Controller, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import type { FieldWidgetProps } from "./types";

/**
 * Visual toggle for booleans. Renders inline with its label rather than
 * using the standard FieldShell so the layout reads naturally for switches.
 */
export function BooleanField({ config }: FieldWidgetProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={config.id}
      render={({ field }) => {
        const checked = Boolean(field.value);
        return (
          <label
            className={cn(
              "flex cursor-pointer items-center justify-between gap-4 rounded-lg border bg-surface px-4 py-3 transition-colors",
              checked
                ? "border-brand/40 bg-brand-50/40"
                : "border-border hover:border-brand/30"
            )}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {config.label}
                {config.required && (
                  <span className="ms-1 text-red-500">*</span>
                )}
              </p>
              {config.help && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {config.help}
                </p>
              )}
            </div>
            <span
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                checked ? "bg-brand" : "bg-border-strong"
              )}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                  checked
                    ? "translate-x-5 rtl:-translate-x-5"
                    : "translate-x-0.5 rtl:-translate-x-0.5"
                )}
              />
            </span>
            <input
              type="checkbox"
              className="sr-only"
              checked={checked}
              onChange={(e) => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          </label>
        );
      }}
    />
  );
}
