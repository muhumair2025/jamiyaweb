"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, ChevronDown, RotateCcw, Search, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FONTS,
  FONT_CATEGORIES,
  findFont,
  toCssFamily,
  type FontCategory,
  type FontEntry,
} from "@/engine/fonts/registry";
import { loadFont, loadFontByFamily, loadFonts } from "@/engine/fonts/loader";

interface FontPickerFieldProps {
  label: string;
  hint?: string;
  /** Stored value is a CSS font-family string like "'Cairo', sans-serif". */
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  /** Restrict the dropdown to Arabic-capable fonts only. */
  arabicOnly?: boolean;
}

/**
 * Font picker — opens a popover with category filter + searchable list of
 * font previews. Each row renders the family in its own typeface, so the
 * user sees what they're picking.
 *
 * Fonts load lazily: the visible rows trigger Google Fonts stylesheet
 * injection via the loader. The picked font's family is stored as-is (CSS
 * font-family value) so applyElementStyle can write it straight to inline
 * style without further processing.
 */
export function FontPickerField({
  label,
  hint,
  value,
  onChange,
  arabicOnly = false,
}: FontPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FontCategory | "all">(
    arabicOnly ? "arabic" : "all"
  );
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Currently-selected entry (parsed from stored CSS family string)
  const selected = useMemo(() => findFont(extractPrimaryFamily(value)), [value]);

  // Make sure the user's current font is loaded so the trigger button
  // can show the actual typeface.
  useEffect(() => {
    if (selected) loadFont(selected);
  }, [selected]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Filter list by category + search
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FONTS.filter((f) => {
      if (arabicOnly && !f.supportsArabic) return false;
      if (category !== "all" && f.category !== category) return false;
      if (q && !f.family.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, category, arabicOnly]);

  // Eagerly load the first chunk so previews render immediately when the
  // popover opens. Subsequent rows still load fine on hover/scroll.
  useEffect(() => {
    if (open) loadFonts(filtered.slice(0, 18));
  }, [open, filtered]);

  const pick = useCallback(
    (entry: FontEntry) => {
      loadFont(entry);
      onChange(toCssFamily(entry));
      setOpen(false);
    },
    [onChange]
  );

  const reset = () => onChange(undefined);

  const categories = arabicOnly
    ? FONT_CATEGORIES.filter((c) => c.value === "arabic")
    : FONT_CATEGORIES;

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[12px] font-semibold text-foreground">
          {label}
        </label>
        {value !== undefined && (
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

      <div className="relative" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-border bg-surface px-2.5 text-[12px] shadow-soft outline-none transition-colors hover:border-brand/40 focus:border-brand focus:ring-2 focus:ring-brand/15"
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <Type className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span
              className="truncate text-foreground"
              style={
                selected
                  ? { fontFamily: toCssFamily(selected) }
                  : undefined
              }
            >
              {selected?.family ?? "Inherit"}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <div className="absolute z-50 mt-1.5 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-surface shadow-elevated">
            {/* Search */}
            <div className="border-b border-border p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${arabicOnly ? "Arabic " : ""}fonts…`}
                  autoFocus
                  className="h-8 w-full rounded-md border border-border bg-background ps-7 pe-2 text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                />
              </div>
            </div>

            {/* Category chips */}
            {!arabicOnly && (
              <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-2">
                {categories.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors",
                      category === c.value
                        ? "bg-brand text-white"
                        : "text-foreground-soft hover:bg-muted/60"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}

            {/* Font list */}
            <div className="max-h-72 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-muted-foreground">
                  No fonts match.
                </p>
              ) : (
                filtered.map((entry) => (
                  <FontRow
                    key={entry.family}
                    entry={entry}
                    selected={selected?.family === entry.family}
                    onPick={() => pick(entry)}
                  />
                ))
              )}
            </div>

            {/* Inherit option */}
            <div className="border-t border-border p-2">
              <button
                type="button"
                onClick={reset}
                className="flex w-full items-center justify-between rounded-md px-2 py-2 text-xs font-medium text-foreground-soft transition-colors hover:bg-muted/60"
              >
                <span>— Inherit from theme —</span>
                {value === undefined && <Check className="h-3.5 w-3.5 text-brand" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────

function FontRow({
  entry,
  selected,
  onPick,
}: {
  entry: FontEntry;
  selected: boolean;
  onPick: () => void;
}) {
  const rowRef = useRef<HTMLButtonElement | null>(null);

  // Load the font's stylesheet the first time this row scrolls into view —
  // so the preview text actually renders in the right typeface.
  useEffect(() => {
    const el = rowRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      loadFontByFamily(entry.family);
      return;
    }
    const observer = new IntersectionObserver(
      ([item]) => {
        if (item.isIntersecting) {
          loadFontByFamily(entry.family);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [entry.family]);

  return (
    <button
      ref={rowRef}
      type="button"
      onClick={onPick}
      className={cn(
        "flex w-full items-center justify-between gap-3 px-3 py-2 text-start transition-colors hover:bg-muted/60",
        selected && "bg-brand-50/80"
      )}
    >
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-base text-foreground"
          style={{ fontFamily: toCssFamily(entry) }}
        >
          {entry.family}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {entry.category}
          {entry.supportsArabic ? " · arabic" : ""}
        </p>
      </div>
      {selected && <Check className="h-3.5 w-3.5 shrink-0 text-brand" />}
    </button>
  );
}

/**
 * Pull the primary family out of a CSS font-family string. Handles:
 *   "'Cairo', sans-serif"  → "Cairo"
 *   '"Open Sans", serif'   → "Open Sans"
 *   "Inter"                → "Inter"
 */
function extractPrimaryFamily(value: string | undefined | null): string | null {
  if (!value) return null;
  const first = value.split(",")[0].trim();
  return first.replace(/^['"]|['"]$/g, "");
}
