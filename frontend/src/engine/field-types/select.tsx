"use client";

import { useFormContext } from "react-hook-form";
import { FieldShell, useFieldError } from "./_field-shell";
import { cn } from "@/lib/utils";
import type { FieldWidgetProps } from "./types";

export function SelectField({ config }: FieldWidgetProps) {
  const { register } = useFormContext();
  const hasError = useFieldError(config.id);
  const options = config.options ?? [];

  return (
    <FieldShell config={config}>
      <div className="relative">
        <select
          id={config.id}
          className={cn(
            "h-11 w-full appearance-none rounded-lg border bg-surface px-3 pe-9 text-sm outline-none transition-all",
            "focus:ring-4",
            hasError
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-border focus:border-brand focus:ring-brand/10"
          )}
          {...register(config.id)}
        >
          {!config.required && <option value="">— None —</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          fill="currentColor"
          className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </FieldShell>
  );
}
