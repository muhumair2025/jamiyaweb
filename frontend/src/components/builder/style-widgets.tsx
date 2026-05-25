"use client";

import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Image as ImageIcon, ImagePlus, Pipette, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaPicker } from "@/components/media/media-picker";

/**
 * Lightweight style-panel widgets — purpose-built for the builder's Style tab.
 * They're NOT React Hook Form widgets (the Style tab is a controlled form, not
 * a Zod-validated one).
 */

// ─── Shared shell ────────────────────────────────────────────────
export function StyleRow({
  label,
  hint,
  reset,
  children,
}: {
  label: string;
  hint?: string;
  reset?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[12px] font-semibold text-foreground">
          {label}
        </label>
        {reset && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`Reset ${label}`}
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ─── Segmented control ───────────────────────────────────────────
interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export function SegmentField<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  options: SegmentOption<T>[];
  value: T | undefined;
  onChange: (next: T | undefined) => void;
}) {
  return (
    <StyleRow
      label={label}
      hint={hint}
      reset={value !== undefined ? () => onChange(undefined) : undefined}
    >
      <div className="inline-flex w-full rounded-md border border-border bg-muted/40 p-0.5">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1.5 text-[11px] font-semibold transition-colors",
                active
                  ? "bg-surface text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={active}
            >
              {o.icon}
              {o.label}
            </button>
          );
        })}
      </div>
    </StyleRow>
  );
}

// ─── Unit input: slider + number + unit dropdown (Elementor-style) ──
export type CssUnit = "px" | "rem" | "em" | "%" | "vh" | "vw" | "";

export interface UnitRange {
  min: number;
  max: number;
  step: number;
}

const DEFAULT_RANGES: Record<CssUnit, UnitRange> = {
  px: { min: 0, max: 400, step: 1 },
  rem: { min: 0, max: 20, step: 0.1 },
  em: { min: 0, max: 10, step: 0.1 },
  "%": { min: 0, max: 200, step: 1 },
  vh: { min: 0, max: 100, step: 1 },
  vw: { min: 0, max: 100, step: 1 },
  "": { min: 0, max: 3, step: 0.05 }, // unitless (line-height, opacity-like)
};

interface UnitInputFieldProps {
  label: string;
  hint?: string;
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  /** Allowed units. First entry is the default when value is empty. */
  units?: CssUnit[];
  /** Override the default range for any unit. */
  ranges?: Partial<Record<CssUnit, UnitRange>>;
  /** Show the slider above the number+unit row. Default: true. */
  showSlider?: boolean;
  placeholder?: string;
}

/**
 * Single-value CSS length input — slider, numeric field, and unit dropdown
 * working as one widget. Outputs `${number}${unit}` (e.g. "1.5rem") or just
 * the number for unitless cases like line-height ("1.4").
 *
 * If the existing value can't be parsed (e.g. `calc()` or `var()`), the
 * widget falls back to a plain text input so the user can keep editing
 * the raw expression — no data loss.
 */
export function UnitInputField({
  label,
  hint,
  value,
  onChange,
  units = ["px", "rem", "em", "%"],
  ranges,
  showSlider = true,
  placeholder = "0",
}: UnitInputFieldProps) {
  const parsed = parseLength(value);
  const isParseable = parsed !== null;

  // If we can't parse, show a text input so the raw expression survives.
  if (value && !isParseable) {
    return (
      <StyleRow
        label={label}
        hint={hint}
        reset={() => onChange(undefined)}
      >
        <input
          type="text"
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value)}
          className="h-9 w-full rounded-md border border-border bg-surface px-3 font-mono text-[11px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
        />
        <p className="text-[10px] text-muted-foreground">
          Raw expression — clear to use slider.
        </p>
      </StyleRow>
    );
  }

  const num = parsed?.num ?? null;
  const unit: CssUnit = (parsed?.unit ?? units[0]) as CssUnit;
  const range = { ...DEFAULT_RANGES[unit], ...(ranges?.[unit] ?? {}) };

  const commit = (nextNum: number | null, nextUnit: CssUnit) => {
    if (nextNum === null || Number.isNaN(nextNum)) {
      onChange(undefined);
      return;
    }
    onChange(`${stripTrailingZero(nextNum)}${nextUnit}`);
  };

  return (
    <StyleRow
      label={label}
      hint={hint}
      reset={value !== undefined ? () => onChange(undefined) : undefined}
    >
      {/* Slider · number · unit all in one row. The slider flexes; the
          number and unit are fixed-width and never wrap. */}
      <div className="flex items-center gap-2">
        {showSlider && (
          <input
            type="range"
            min={range.min}
            max={range.max}
            step={range.step}
            value={num ?? range.min}
            onChange={(e) => commit(Number(e.target.value), unit)}
            className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-brand"
            aria-label={`${label} slider`}
          />
        )}
        <input
          type="number"
          inputMode="decimal"
          dir="ltr"
          value={num ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") return commit(null, unit);
            commit(Number(raw), unit);
          }}
          step={range.step}
          placeholder={placeholder}
          className="h-8 w-[58px] shrink-0 rounded-md border border-border bg-surface px-1.5 text-center font-mono text-[12px] shadow-soft outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          aria-label={`${label} value`}
        />
        {units.length > 1 ? (
          <select
            value={unit}
            onChange={(e) => commit(num, e.target.value as CssUnit)}
            className="h-8 w-[54px] shrink-0 rounded-md border border-border bg-surface px-1 text-center text-[11px] font-semibold shadow-soft outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            aria-label={`${label} unit`}
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {u === "" ? "—" : u}
              </option>
            ))}
          </select>
        ) : (
          <span className="inline-flex h-8 w-[40px] shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 font-mono text-[11px] font-semibold text-muted-foreground">
            {unit === "" ? "—" : unit}
          </span>
        )}
      </div>
    </StyleRow>
  );
}

/** Parse a CSS length like "1.5rem", "24px", "1.4" (unitless) into number + unit.
 *  Returns null for expressions we can't reduce (calc, var, etc). */
function parseLength(
  v: string | undefined
): { num: number; unit: CssUnit } | null {
  if (!v) return null;
  const m = v.trim().match(/^(-?\d*\.?\d+)\s*(px|rem|em|%|vh|vw)?$/i);
  if (!m) return null;
  return {
    num: Number(m[1]),
    unit: ((m[2] ?? "").toLowerCase() as CssUnit) || ("" as CssUnit),
  };
}

function stripTrailingZero(n: number): string {
  // 1.50 → "1.5"; 4 → "4"; preserves up to 3 decimals.
  return Number(n.toFixed(3)).toString();
}

// ─── Range slider with rem suffix ────────────────────────────────
export function RangeField({
  label,
  hint,
  value,
  onChange,
  min = 0,
  max = 8,
  step = 0.25,
  unit = "rem",
}: {
  label: string;
  hint?: string;
  /** String value like "2rem" or undefined. */
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  const numeric = parseValue(value, min);

  return (
    <StyleRow
      label={label}
      hint={hint}
      reset={value !== undefined ? () => onChange(undefined) : undefined}
    >
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={numeric}
          onChange={(e) => onChange(`${Number(e.target.value)}${unit}`)}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-brand"
        />
        <span className="inline-flex h-7 w-16 items-center justify-center rounded-md border border-border bg-surface font-mono text-[11px] text-foreground">
          {numeric}
          {unit}
        </span>
      </div>
    </StyleRow>
  );
}

/** Strip query/hash and return the last path segment, falling back to the
 *  full value if it doesn't look like a URL. Used by image widgets so the
 *  field doesn't blow out the sidebar with a 200-char public URL. */
function filenameFromUrl(value: string): string {
  try {
    const clean = value.split("?")[0].split("#")[0];
    const last = clean.split("/").filter(Boolean).pop();
    return last && last.length > 0 ? last : value;
  } catch {
    return value;
  }
}

function parseValue(v: string | undefined, fallback: number): number {
  if (!v) return fallback;
  const m = v.match(/^(-?\d*\.?\d+)/);
  return m ? Number(m[1]) : fallback;
}

// ─── Free-form text (for font-size, line-height, letter-spacing strings) ──
export function TextStyleField({
  label,
  hint,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  placeholder?: string;
  value: string | undefined;
  onChange: (next: string | undefined) => void;
}) {
  return (
    <StyleRow
      label={label}
      hint={hint}
      reset={value !== undefined ? () => onChange(undefined) : undefined}
    >
      <input
        type="text"
        dir="ltr"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? undefined : e.target.value)
        }
        placeholder={placeholder ?? "Inherit"}
        className="h-9 w-full rounded-md border border-border bg-surface px-3 font-mono text-[11px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
      />
    </StyleRow>
  );
}

// ─── Native select (for shadow, position, fit, font-weight enums) ─
export function SelectStyleField<T extends string>({
  label,
  hint,
  value,
  onChange,
  options,
  placeholder = "— Inherit —",
}: {
  label: string;
  hint?: string;
  value: T | undefined;
  onChange: (next: T | undefined) => void;
  options: { value: T; label: string }[];
  placeholder?: string;
}) {
  return (
    <StyleRow
      label={label}
      hint={hint}
      reset={value !== undefined ? () => onChange(undefined) : undefined}
    >
      <select
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? undefined : (e.target.value as T))
        }
        className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[12px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </StyleRow>
  );
}

// ─── Percentage slider — stores 0..1 internally, displays 0..100 ──
export function PercentSliderField({
  label,
  hint,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  hint?: string;
  /** Stored as a fraction (0..1). UI shows percentages. */
  value: number | undefined;
  onChange: (next: number | undefined) => void;
  step?: number;
}) {
  const pct = Math.round(((value ?? 0) * 100) * 10) / 10;
  const commit = (nextPct: number) => {
    const clamped = Math.min(100, Math.max(0, nextPct));
    onChange(Number((clamped / 100).toFixed(3)));
  };

  return (
    <StyleRow
      label={label}
      hint={hint}
      reset={value !== undefined ? () => onChange(undefined) : undefined}
    >
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={100}
          step={step}
          value={pct}
          onChange={(e) => commit(Number(e.target.value))}
          className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-brand"
        />
        <input
          type="number"
          inputMode="numeric"
          dir="ltr"
          min={0}
          max={100}
          value={pct}
          onChange={(e) => {
            if (e.target.value === "") return onChange(undefined);
            commit(Number(e.target.value));
          }}
          className="h-8 w-[58px] shrink-0 rounded-md border border-border bg-surface px-1.5 text-center font-mono text-[12px] shadow-soft outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
        />
        <span className="inline-flex h-8 w-[40px] shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 font-mono text-[11px] font-semibold text-muted-foreground">
          %
        </span>
      </div>
    </StyleRow>
  );
}

// ─── Numeric slider (for opacity 0..1, no unit) ──────────────────
export function NumberSliderField({
  label,
  hint,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.05,
}: {
  label: string;
  hint?: string;
  value: number | undefined;
  onChange: (next: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const v = value ?? max;
  return (
    <StyleRow
      label={label}
      hint={hint}
      reset={value !== undefined ? () => onChange(undefined) : undefined}
    >
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={v}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-brand"
        />
        <span className="inline-flex h-7 w-12 items-center justify-center rounded-md border border-border bg-surface font-mono text-[11px] text-foreground">
          {Math.round(v * 100) / 100}
        </span>
      </div>
    </StyleRow>
  );
}

// ─── Image picker (opens MediaPicker dialog) ─────────────────────
export function ImageStyleField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string | undefined;
  onChange: (next: string | undefined) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <StyleRow
      label={label}
      hint={hint}
      reset={value !== undefined ? () => onChange(undefined) : undefined}
    >
      <div className="flex items-stretch gap-2 rounded-md border border-border bg-surface p-1.5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded border border-border bg-muted/40 transition-colors hover:border-brand/50"
          aria-label={value ? "Replace image" : "Choose image"}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-7 w-fit items-center gap-1 rounded-md bg-brand px-2.5 text-[11px] font-semibold text-white hover:bg-brand-600"
          >
            <ImagePlus className="h-3 w-3" />
            {value ? "Replace" : "Choose image"}
          </button>
          {value && (
            <p
              dir="ltr"
              className="block w-full overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[10px] text-muted-foreground"
              title={value}
            >
              {filenameFromUrl(value)}
            </p>
          )}
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="inline-flex h-7 w-7 items-center justify-center self-start rounded text-muted-foreground hover:bg-red-50 hover:text-red-600"
            aria-label="Clear image"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={({ url }) => onChange(url)}
        kind="image"
        currentUrl={value || null}
        title={`Choose ${label.toLowerCase()}`}
      />
    </StyleRow>
  );
}

// ─── Color picker (popover) ──────────────────────────────────────
export function StyleColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string | undefined;
  onChange: (next: string | undefined) => void;
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

  const hex = value || "";

  return (
    <StyleRow
      label={label}
      hint={hint}
      reset={value !== undefined ? () => onChange(undefined) : undefined}
    >
      <div className="relative" ref={wrapRef}>
        <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-2">
          <button
            type="button"
            aria-label="Open colour picker"
            onClick={() => setOpen((s) => !s)}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border shadow-soft transition-transform hover:scale-[1.04]"
            style={{ background: hex || "transparent" }}
          >
            {hex ? (
              <Pipette className="h-3 w-3 text-white/80 drop-shadow" />
            ) : (
              <span className="text-[8px] text-muted-foreground">+</span>
            )}
          </button>
          <input
            type="text"
            dir="ltr"
            value={hex}
            onChange={(e) =>
              onChange(e.target.value === "" ? undefined : e.target.value)
            }
            placeholder="Inherit"
            className="h-full flex-1 bg-transparent font-mono text-[11px] outline-none"
          />
        </div>

        {open && (
          <div className="absolute z-50 mt-2 rounded-xl border border-border bg-surface p-3 shadow-elevated">
            <HexColorPicker
              color={hex || "#20665c"}
              onChange={(c) => onChange(c)}
            />
          </div>
        )}
      </div>
    </StyleRow>
  );
}
