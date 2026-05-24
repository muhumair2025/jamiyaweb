"use client";

import { useFormContext } from "react-hook-form";
import { FieldShell, inputClass, useFieldError } from "./_field-shell";
import type { FieldWidgetProps } from "./types";

/** Single-line text. */
export function TextField({ config }: FieldWidgetProps) {
  const { register } = useFormContext();
  const hasError = useFieldError(config.id);

  return (
    <FieldShell config={config}>
      <input
        id={config.id}
        type="text"
        placeholder={config.placeholder}
        maxLength={config.maxLength}
        className={inputClass(hasError)}
        {...register(config.id)}
      />
    </FieldShell>
  );
}
