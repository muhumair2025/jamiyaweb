"use client";

import { useFormContext } from "react-hook-form";
import type { FieldConfig } from "./types";

/**
 * Shared visual chrome — label, hint, error — used by every field widget.
 * Children supply the actual control (input/select/etc).
 */
export function FieldShell({
  config,
  children,
}: {
  config: FieldConfig;
  children: React.ReactNode;
}) {
  const {
    formState: { errors },
  } = useFormContext();
  const error = errors[config.id]?.message as string | undefined;

  return (
    <div className="grid gap-1.5">
      <label
        htmlFor={config.id}
        className="text-[13px] font-medium text-foreground"
      >
        {config.label}
        {config.required && <span className="ms-1 text-red-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : (
        config.help && (
          <p className="text-xs text-muted-foreground">{config.help}</p>
        )
      )}
    </div>
  );
}

export function inputClass(hasError: boolean): string {
  return [
    "w-full rounded-lg border bg-surface text-sm outline-none transition-all",
    "h-11 px-3",
    "placeholder:text-muted-foreground/70",
    "focus:ring-4",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-border focus:border-brand focus:ring-brand/10",
  ].join(" ");
}

export function useFieldError(id: string): boolean {
  const {
    formState: { errors },
  } = useFormContext();
  return !!errors[id];
}
