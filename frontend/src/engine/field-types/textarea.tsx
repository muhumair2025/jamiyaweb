"use client";

import { useFormContext } from "react-hook-form";
import { FieldShell, useFieldError } from "./_field-shell";
import { cn } from "@/lib/utils";
import type { FieldWidgetProps } from "./types";

/** Multi-line text. */
export function TextareaField({ config }: FieldWidgetProps) {
  const { register } = useFormContext();
  const hasError = useFieldError(config.id);

  return (
    <FieldShell config={config}>
      <textarea
        id={config.id}
        rows={5}
        placeholder={config.placeholder}
        maxLength={config.maxLength}
        className={cn(
          "w-full rounded-lg border bg-surface px-3 py-2.5 text-sm outline-none transition-all",
          "placeholder:text-muted-foreground/70 focus:ring-4",
          hasError
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : "border-border focus:border-brand focus:ring-brand/10"
        )}
        {...register(config.id)}
      />
    </FieldShell>
  );
}
