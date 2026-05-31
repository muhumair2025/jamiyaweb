"use client";

import {
  IMAGE_FITS,
  IMAGE_POSITIONS_GRID,
  type ImageFit,
  type ImagePosition,
  type ImageValueObject,
  type ResolvedImage,
} from "@/engine/image-value";
import { cn } from "@/lib/utils";

interface Props {
  /** Resolved image (with all options filled in). */
  resolved: ResolvedImage;
  /** Called with the new rich-object value when any control changes. */
  onChange: (next: ImageValueObject) => void;
}

/**
 * Tiny control cluster shown beneath an image picker:
 *   • Fit       — segmented buttons (cover / contain / fill / scale-down / none)
 *   • Position  — 9-point grid of dots (top-left … bottom-right)
 *   • Overlay   — color swatch + opacity slider
 *
 * The widget always works against the resolved object form. The caller
 * (`ImageField`) converts a legacy string URL into the object form on the
 * first edit, so this widget never sees `string`.
 */
export function ImageOptions({ resolved, onChange }: Props) {
  const set = <K extends keyof ImageValueObject>(
    key: K,
    value: ImageValueObject[K]
  ) => {
    onChange({
      url: resolved.url,
      fit: resolved.fit,
      position: resolved.position,
      overlay_color: resolved.overlay_color,
      overlay_opacity: resolved.overlay_opacity,
      [key]: value,
    });
  };

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Image options
      </p>

      {/* ── Fit ─────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-foreground">Fit</label>
        <div className="flex flex-wrap gap-1">
          {IMAGE_FITS.map((opt) => (
            <FitButton
              key={opt.value}
              active={resolved.fit === opt.value}
              onClick={() => set("fit", opt.value)}
            >
              {opt.label}
            </FitButton>
          ))}
        </div>
      </div>

      {/* ── Position (9-point grid) ─────────────────────────── */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-foreground">
          Position
        </label>
        <div className="inline-grid grid-cols-3 gap-0.5 rounded-md border border-border bg-card p-1">
          {IMAGE_POSITIONS_GRID.flat().map((pos) => (
            <PositionDot
              key={pos}
              position={pos}
              active={resolved.position === pos}
              onClick={() => set("position", pos)}
            />
          ))}
        </div>
      </div>

      {/* ── Overlay ─────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-foreground">
          Overlay
        </label>
        <div className="flex items-center gap-3">
          {/* Colour swatch — type=color is concise; pairs with opacity slider */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={resolved.overlay_color ?? "#000000"}
              onChange={(e) => set("overlay_color", e.target.value)}
              aria-label="Overlay colour"
              className="h-7 w-9 cursor-pointer rounded border border-border bg-card p-0.5"
            />
            {resolved.overlay_color && (
              <button
                type="button"
                onClick={() => set("overlay_color", null)}
                className="text-[10px] font-medium text-muted-foreground hover:text-red-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-1 items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={Math.round(resolved.overlay_opacity * 100)}
              onChange={(e) =>
                set("overlay_opacity", Number(e.target.value) / 100)
              }
              aria-label="Overlay opacity"
              className="flex-1 accent-brand"
            />
            <span className="w-9 text-end text-[10px] font-mono tabular-nums text-muted-foreground">
              {Math.round(resolved.overlay_opacity * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
function FitButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-7 items-center rounded-md border px-2.5 text-[11px] font-semibold transition-colors",
        active
          ? "border-brand bg-brand text-white shadow-sm"
          : "border-border bg-card text-foreground hover:border-brand/50"
      )}
    >
      {children}
    </button>
  );
}

function PositionDot({
  position,
  active,
  onClick,
}: {
  position: ImagePosition;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Position ${position}`}
      aria-pressed={active}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded transition-colors",
        active ? "bg-brand/15" : "hover:bg-muted"
      )}
    >
      <span
        className={cn(
          "block rounded-full transition-all",
          active ? "h-2.5 w-2.5 bg-brand" : "h-1.5 w-1.5 bg-muted-foreground/40"
        )}
      />
    </button>
  );
}

/** Helper: used by ImageField to keep these out of unused exports. */
export type { ImageFit, ImagePosition };
