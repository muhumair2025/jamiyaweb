"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Image as ImageIcon, Link as LinkIcon, X } from "lucide-react";
import { FieldShell, useFieldError } from "./_field-shell";
import { cn } from "@/lib/utils";
import type { FieldWidgetProps } from "./types";

/**
 * Image field — for v1 this accepts a URL. The real Media library upload
 * flow (Cloudflare R2) wires in later; the field shape stays the same.
 */
export function ImageField({ config }: FieldWidgetProps) {
  const { control } = useFormContext();
  const hasError = useFieldError(config.id);

  return (
    <FieldShell config={config}>
      <Controller
        control={control}
        name={config.id}
        render={({ field }) => {
          const url = (field.value as string) || "";
          return (
            <div
              className={cn(
                "flex flex-col gap-3 rounded-lg border bg-surface p-3 transition-all sm:flex-row sm:items-center",
                hasError ? "border-red-400" : "border-border"
              )}
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt="preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1">
                <div className="relative">
                  <LinkIcon className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="url"
                    dir="ltr"
                    value={url}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="https://…/image.jpg"
                    className="h-10 w-full rounded-md border border-border bg-background ps-9 pe-3 font-mono text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Paste a URL. Media library upload ships with the builder.
                </p>
              </div>

              {url && (
                <button
                  type="button"
                  onClick={() => field.onChange("")}
                  className="inline-flex h-9 items-center gap-1 self-stretch rounded-md px-3 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 sm:self-center"
                  aria-label="Clear image"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>
          );
        }}
      />
    </FieldShell>
  );
}
