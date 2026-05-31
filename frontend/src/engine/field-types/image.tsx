"use client";

import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Image as ImageIcon, ImagePlus, X } from "lucide-react";
import { FieldShell, useFieldError } from "./_field-shell";
import { ImageOptions } from "./image-options";
import { cn } from "@/lib/utils";
import { MediaPicker } from "@/components/media/media-picker";
import {
  getImageUrl,
  resolveImage,
  type ImageValue,
  type ImageValueObject,
} from "@/engine/image-value";
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
 * Image field — opens the MediaPicker dialog for browsing/upload/URL paste,
 * then renders an "Image options" sub-panel beneath the picker with controls
 * for fit, 9-point position, and overlay (colour + opacity).
 *
 * **Value shape:** either a plain URL string (legacy / freshly picked) or
 * the rich object `{ url, fit?, position?, overlay_color?, overlay_opacity? }`.
 * Section components normalise via `resolveImage()` so both shapes render
 * the same way. The widget upgrades a string → object on the first option
 * change, never mutates URL-only values silently.
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
          const value = field.value as ImageValue;
          const url = getImageUrl(value) ?? "";
          const resolved = resolveImage(value);

          /** Write the rich object form back to the field. */
          const setObject = (next: ImageValueObject) => field.onChange(next);

          /** Clear: drop back to empty string so legacy consumers stay happy. */
          const clear = () => field.onChange("");

          /** Pick: keep the value as a plain URL string until the user
           *  touches an option control — that way unchanged data round-trips
           *  to the DB in its original (cheaper) string form. */
          const pick = (nextUrl: string) => field.onChange(nextUrl);

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
                    onClick={clear}
                    className="inline-flex h-9 items-center gap-1 self-stretch rounded-md px-3 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 sm:self-center"
                    aria-label="Clear image"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </button>
                )}
              </div>

              {/* Options panel — fit, 9-point position, overlay colour + opacity.
                  Shown only when there's an image to customise. */}
              {resolved && (
                <ImageOptions resolved={resolved} onChange={setObject} />
              )}

              <MediaPicker
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={({ url: nextUrl }) => pick(nextUrl)}
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
