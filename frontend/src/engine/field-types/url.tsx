"use client";

import { useFormContext } from "react-hook-form";
import { Link as LinkIcon } from "lucide-react";
import { FieldShell, useFieldError, inputClass } from "./_field-shell";
import { cn } from "@/lib/utils";
import type { FieldWidgetProps } from "./types";

/** URL / href input with a small leading link icon. */
export function UrlField({ config }: FieldWidgetProps) {
  const { register } = useFormContext();
  const hasError = useFieldError(config.id);

  return (
    <FieldShell config={config}>
      <div className="relative">
        <LinkIcon className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id={config.id}
          type="url"
          inputMode="url"
          placeholder={config.placeholder ?? "https://…"}
          className={cn(inputClass(hasError), "ps-9 font-mono text-xs")}
          {...register(config.id)}
        />
      </div>
    </FieldShell>
  );
}
