"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { HexColorPicker } from "react-colorful";
import { Pipette } from "lucide-react";
import { FieldShell, useFieldError } from "./_field-shell";
import { cn } from "@/lib/utils";
import type { FieldWidgetProps } from "./types";

/**
 * Colour picker — small swatch button + hex input. Clicking the swatch
 * opens a react-colorful HexColorPicker popover. Click-outside closes it.
 */
export function ColorField({ config }: FieldWidgetProps) {
  const { control } = useFormContext();
  const hasError = useFieldError(config.id);

  return (
    <FieldShell config={config}>
      <Controller
        control={control}
        name={config.id}
        render={({ field }) => (
          <ColorControl
            value={(field.value as string) || "#000000"}
            onChange={field.onChange}
            hasError={hasError}
          />
        )}
      />
    </FieldShell>
  );
}

function ColorControl({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const normalised = ensureHash(value);

  return (
    <div className="relative" ref={wrapRef}>
      <div
        className={cn(
          "flex h-11 items-center gap-2 rounded-lg border bg-surface px-2 transition-all",
          hasError ? "border-red-400" : "border-border"
        )}
      >
        <button
          type="button"
          aria-label="Open colour picker"
          onClick={() => setOpen((s) => !s)}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border shadow-soft transition-transform hover:scale-[1.04]"
          style={{ background: normalised }}
        >
          <Pipette className="h-3.5 w-3.5 text-white/80 drop-shadow" />
        </button>
        <input
          type="text"
          dir="ltr"
          value={normalised}
          onChange={(e) => onChange(e.target.value)}
          className="h-full flex-1 bg-transparent font-mono text-xs outline-none"
          placeholder="#20665c"
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-2 rounded-xl border border-border bg-surface p-3 shadow-elevated">
          <HexColorPicker color={normalised} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

function ensureHash(s: string): string {
  if (!s) return "#000000";
  return s.startsWith("#") ? s : `#${s}`;
}
