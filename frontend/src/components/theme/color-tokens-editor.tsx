"use client";

import { useState, useTransition } from "react";
import { HexColorPicker } from "react-colorful";
import { Check, Loader2, Pipette, RotateCcw, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateWebsiteAction } from "@/lib/website-actions";

interface Props {
  websiteId: number;
  initialTokens: Record<string, string>;
}

interface ColorTokenDef {
  key: string;
  label: string;
  hint?: string;
  fallback: string;
}

/** The four base color tokens every theme consumes. New colours can be
 *  added later by extending this list — they automatically get a row + a
 *  preview swatch. */
const COLOR_TOKENS: ColorTokenDef[] = [
  {
    key: "color.primary",
    label: "Brand",
    hint: "Hero gradient start, primary buttons, focus rings.",
    fallback: "#20665c",
  },
  {
    key: "color.accent",
    label: "Accent",
    hint: "CTA buttons, gold highlights, hero gradient end.",
    fallback: "#c18f2c",
  },
  {
    key: "color.background",
    label: "Background",
    hint: "Default page background (most sections).",
    fallback: "#fbfaf7",
  },
  {
    key: "color.foreground",
    label: "Text",
    hint: "Default body text colour across the site.",
    fallback: "#1c2624",
  },
];

interface Palette {
  name: string;
  description: string;
  values: Record<string, string>;
}

/** Curated colour palettes — one-click apply. Hand-picked for Islamic
 *  welfare/scholarly aesthetics; can be expanded over time. */
const PALETTES: Palette[] = [
  {
    name: "Emerald & Gold",
    description: "Classical, warm, donation-friendly.",
    values: {
      "color.primary": "#20665c",
      "color.accent": "#c18f2c",
      "color.background": "#fbfaf7",
      "color.foreground": "#1c2624",
    },
  },
  {
    name: "Indigo & Ochre",
    description: "Dignified, scholarly, calm.",
    values: {
      "color.primary": "#2c3a72",
      "color.accent": "#d4a056",
      "color.background": "#f7f6f1",
      "color.foreground": "#1a1d2e",
    },
  },
  {
    name: "Mosque Teal",
    description: "Deep teal with warm sand accents.",
    values: {
      "color.primary": "#0e5050",
      "color.accent": "#dcb87d",
      "color.background": "#fbf7f0",
      "color.foreground": "#0e2424",
    },
  },
  {
    name: "Pure Minimal",
    description: "High-contrast monochrome with a single gold accent.",
    values: {
      "color.primary": "#111111",
      "color.accent": "#b8902f",
      "color.background": "#ffffff",
      "color.foreground": "#111111",
    },
  },
  {
    name: "Madinah",
    description: "Olive-green tones with terracotta highlights.",
    values: {
      "color.primary": "#3f5727",
      "color.accent": "#b04a2f",
      "color.background": "#f6f3ea",
      "color.foreground": "#2a2a1f",
    },
  },
  {
    name: "Night Crescent",
    description: "Deep navy with gold — for premium dark themes.",
    values: {
      "color.primary": "#13243f",
      "color.accent": "#d4a017",
      "color.background": "#f8f7f3",
      "color.foreground": "#13243f",
    },
  },
];

export function ColorTokensEditor({ websiteId, initialTokens }: Props) {
  const [tokens, setTokens] = useState<Record<string, string>>(initialTokens);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [activePicker, setActivePicker] = useState<string | null>(null);

  const isDirty = !shallowEqual(tokens, initialTokens);

  const setToken = (key: string, value: string) => {
    setTokens((prev) => ({ ...prev, [key]: value }));
    setStatus("idle");
  };

  const resetToken = (key: string) => {
    setTokens((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setStatus("idle");
  };

  const applyPalette = (palette: Palette) => {
    setTokens((prev) => ({ ...prev, ...palette.values }));
    setStatus("idle");
  };

  const save = () => {
    startTransition(async () => {
      const res = await updateWebsiteAction(websiteId, { tokens });
      if (res.ok) {
        setStatus("saved");
        setError(null);
        setTimeout(() => setStatus("idle"), 2000);
      } else {
        setStatus("error");
        setError(res.message ?? "Save failed");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Editor + Preview side-by-side on wide screens */}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Token rows */}
        <div className="space-y-3 rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <h2 className="text-base font-semibold text-foreground">
            Colour tokens
          </h2>
          <p className="text-xs text-foreground-soft">
            Set the four base colours your theme builds on. Sections fall back
            to these whenever you don't override them at the element level.
          </p>

          <div className="mt-2 space-y-3">
            {COLOR_TOKENS.map((def) => (
              <TokenRow
                key={def.key}
                def={def}
                value={tokens[def.key] ?? def.fallback}
                isCustom={!!tokens[def.key]}
                pickerOpen={activePicker === def.key}
                onTogglePicker={() =>
                  setActivePicker((s) => (s === def.key ? null : def.key))
                }
                onChange={(v) => setToken(def.key, v)}
                onReset={() => resetToken(def.key)}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <Preview tokens={tokens} />
      </div>

      {/* Palettes */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <h2 className="text-base font-semibold text-foreground">
          Curated palettes
        </h2>
        <p className="mt-1 text-xs text-foreground-soft">
          One click applies all four tokens. You can still fine-tune individual
          values above afterwards.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PALETTES.map((palette) => (
            <PaletteCard
              key={palette.name}
              palette={palette}
              onClick={() => applyPalette(palette)}
            />
          ))}
        </div>
      </div>

      {/* Save bar */}
      <div className="sticky bottom-3 z-10 flex items-center justify-end gap-3 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-card backdrop-blur">
        {status === "saved" && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
            <Check className="h-3.5 w-3.5" />
            Saved
          </span>
        )}
        {status === "error" && (
          <span className="text-xs font-medium text-red-700">
            {error ?? "Save failed"}
          </span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={!isDirty || pending}
          className={cn(
            "inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-sm font-semibold transition-colors",
            isDirty && !pending
              ? "bg-foreground text-background hover:bg-brand"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          )}
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save changes
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────

function TokenRow({
  def,
  value,
  isCustom,
  pickerOpen,
  onTogglePicker,
  onChange,
  onReset,
}: {
  def: ColorTokenDef;
  value: string;
  isCustom: boolean;
  pickerOpen: boolean;
  onTogglePicker: () => void;
  onChange: (v: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">
          {def.label}
        </label>
        {isCustom && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      <div className="mt-2 flex items-stretch gap-2">
        <button
          type="button"
          onClick={onTogglePicker}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border shadow-soft transition-transform hover:scale-105"
          style={{ background: value }}
          aria-label="Open colour picker"
        >
          <Pipette className="h-3.5 w-3.5 text-white/80 drop-shadow" />
        </button>
        <input
          type="text"
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 flex-1 rounded-md border border-border bg-surface px-2.5 font-mono text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
        />
      </div>

      {pickerOpen && (
        <div className="mt-3">
          <HexColorPicker color={value} onChange={onChange} />
        </div>
      )}

      {def.hint && (
        <p className="mt-2 text-[11px] text-muted-foreground">{def.hint}</p>
      )}
    </div>
  );
}

function PaletteCard({
  palette,
  onClick,
}: {
  palette: Palette;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-xl border border-border bg-background p-3 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-card"
    >
      <div className="flex items-center gap-1">
        {Object.entries(palette.values).map(([k, v]) => (
          <span
            key={k}
            className={cn(
              "h-6 flex-1 rounded",
              k === "color.background" && "border border-border"
            )}
            style={{ background: v }}
          />
        ))}
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">
        {palette.name}
      </p>
      <p className="mt-0.5 text-[11px] text-foreground-soft">
        {palette.description}
      </p>
    </button>
  );
}

function Preview({ tokens }: { tokens: Record<string, string> }) {
  const primary = tokens["color.primary"] ?? "#20665c";
  const accent = tokens["color.accent"] ?? "#c18f2c";
  const background = tokens["color.background"] ?? "#fbfaf7";
  const foreground = tokens["color.foreground"] ?? "#1c2624";

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft lg:sticky lg:top-4 lg:self-start">
      <h2 className="text-base font-semibold text-foreground">Preview</h2>
      <div
        className="mt-3 overflow-hidden rounded-xl"
        style={{ background, color: foreground }}
      >
        <div
          className="px-5 py-6"
          style={{
            background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`,
            color: "#fff",
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
            Hero
          </p>
          <p className="mt-1 text-lg font-semibold">Your site title</p>
        </div>
        <div className="px-5 py-5">
          <p className="text-sm">Body text in your foreground colour.</p>
          <button
            type="button"
            className="mt-3 inline-flex h-9 items-center rounded-full px-4 text-xs font-semibold text-white shadow-sm"
            style={{ background: accent }}
            disabled
          >
            Donate now
          </button>
        </div>
      </div>
    </div>
  );
}

function shallowEqual(
  a: Record<string, string>,
  b: Record<string, string>
): boolean {
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  return ak.every((k) => a[k] === b[k]);
}
