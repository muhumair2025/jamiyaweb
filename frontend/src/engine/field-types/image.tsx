"use client";

import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Image as ImageIcon, ImagePlus, X } from "lucide-react";
import { FieldShell, useFieldError } from "./_field-shell";
import { cn } from "@/lib/utils";
import { MediaPicker } from "@/components/media/media-picker";
import type { FieldWidgetProps } from "./types";

/** Last path segment of a URL — used so the field doesn't display a
 *  200-character public storage URL that breaks the sidebar width. */
function filenameFromUrl(value: string): string {
  try {
    const clean = value.split("?")[0].split("#")[0];
    const last = clean.split("/").filter(Boolean).pop();
    return last && last.length > 0 ? last : value;
  } catch {
    return value;
  }
}

/**
 * Image field — opens the MediaPicker dialog which handles library
 * browsing, uploads, and URL paste in one place. The stored value is
 * always a plain URL string (see [[image-storage-decision]]: keep the
 * content_json portable, no DB joins at render).
 */
export function ImageField({ config }: FieldWidgetProps) {
  const { control } = useFormContext();
  const hasError = useFieldError(config.id);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <FieldShell config={config}>
      <Controller
        control={control}
        name={config.id}
        render={({ field }) => {
          const url = (field.value as string) || "";
          return (
            <>
              <div
                className={cn(
                  "flex flex-col gap-3 rounded-lg border bg-surface p-3 transition-all sm:flex-row sm:items-center",
                  hasError ? "border-red-400" : "border-border"
                )}
              >
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40 transition-colors hover:border-brand/50"
                  aria-label={url ? "Change image" : "Choose image"}
                >
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt="preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md bg-brand px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                    {url ? "Replace image" : "Choose image"}
                  </button>
                  {url && (
                    <p
                      dir="ltr"
                      className="mt-1.5 block w-full overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[10px] text-muted-foreground"
                      title={url}
                    >
                      {filenameFromUrl(url)}
                    </p>
                  )}
                  {!url && (
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      Pick from your library, upload new, or paste a URL.
                    </p>
                  )}
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

              <MediaPicker
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={({ url: nextUrl }) => field.onChange(nextUrl)}
                kind="image"
                currentUrl={url || null}
                title={`Choose ${config.label.toLowerCase()}`}
              />
            </>
          );
        }}
      />
    </FieldShell>
  );
}
