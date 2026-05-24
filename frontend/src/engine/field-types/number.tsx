"use client";

import { useFormContext } from "react-hook-form";
import { FieldShell, inputClass, useFieldError } from "./_field-shell";
import type { FieldWidgetProps } from "./types";

export function NumberField({ config }: FieldWidgetProps) {
  const { register } = useFormContext();
  const hasError = useFieldError(config.id);

  return (
    <FieldShell config={config}>
      <input
        id={config.id}
        type="number"
        inputMode="decimal"
        placeholder={config.placeholder}
        min={config.min}
        max={config.max}
        step={config.step ?? 1}
        className={inputClass(hasError)}
        {...register(config.id, {
          setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
        })}
      />
    </FieldShell>
  );
}
