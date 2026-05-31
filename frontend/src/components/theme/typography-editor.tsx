"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, Loader2, Save, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateWebsiteAction } from "@/lib/website-actions";
import { FontPickerField } from "@/components/builder/font-picker";
import { loadFontByFamily } from "@/engine/fonts/loader";

interface Props {
  websiteId: number;
  initialTokens: Record<string, string>;
}

interface FontPairing {
  name: string;
  description: string;
  heading: string;
  body: string;
  /** Whether this pairing pairs well with Arabic content. */
  arabic?: boolean;
}

/** Curated heading + body pairings — one click sets both tokens. */
const PAIRINGS: FontPairing[] = [
  {
    name: "Modern Editorial",
    description: "Tight serif headings + clean sans body.",
    heading: "'Playfair Display', serif",
    body: "'Inter', sans-serif",
  },
  {
    name: "Welfare Classic",
    description: "Warm serif + readable serif body.",
    heading: "'Merriweather', serif",
    body: "'Lora', serif",
  },
  {
    name: "Brand Minimal",
    description: "Geometric sans on both — confident and clean.",
    heading: "'Plus Jakarta Sans', sans-serif",
    body: "'Inter', sans-serif",
  },
  {
    name: "Scholarly",
    description: "Cardo headings + EB Garamond body. Bookish.",
    heading: "'Cardo', serif",
    body: "'EB Garamond', serif",
  },
  {
    name: "Arabic First (Cairo)",
    description: "Cairo for both — wide Arabic + Latin coverage.",
    heading: "'Cairo', sans-serif",
    body: "'Cairo', sans-serif",
    arabic: true,
  },
  {
    name: "Arabic Editorial (Amiri)",
    description: "Amiri headings + Cairo body. Traditional + modern.",
    heading: "'Amiri', serif",
    body: "'Cairo', sans-serif",
    arabic: true,
  },
  {
    name: "Display Welfare",
    description: "Bold DM Serif Display + DM Sans body.",
    heading: "'DM Serif Display', serif",
    body: "'DM Sans', sans-serif",
  },
];

const HEADING_KEY = "font.heading";
const BODY_KEY = "font.body";

export function TypographyEditor({ websiteId, initialTokens }: Props) {
  const [tokens, setTokens] = useState<Record<string, string>>(initialTokens);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Pre-load both fonts so the preview area renders in the right faces
  // as soon as the page mounts (or when the user picks new ones).
  useEffect(() => {
    loadFontByFamily(primaryFamily(tokens[HEADING_KEY]));
    loadFontByFamily(primaryFamily(tokens[BODY_KEY]));
  }, [tokens]);

  const isDirty = !shallowEqual(tokens, initialTokens);

  const setToken = (key: string, value: string | undefined) => {
    setTokens((prev) => {
      const next = { ...prev };
      if (value === undefined || value === "") delete next[key];
      else next[key] = value;
      return next;
    });
    setStatus("idle");
  };

  const applyPairing = (p: FontPairing) => {
    setTokens((prev) => ({
      ...prev,
      [HEADING_KEY]: p.heading,
      [BODY_KEY]: p.body,
    }));
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
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        {/* Pickers */}
        <div className="space-y-5 rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <div>
            <h2 className="flex items-center gap-1.5 text-base font-semibold text-foreground">
              <Type className="h-4 w-4 text-brand" />
              Typography tokens
            </h2>
            <p className="mt-1 text-xs text-foreground-soft">
              Heading and body fonts are applied across every section. Per-element
              overrides in the builder still win when set.
            </p>
          </div>

          <FontPickerField
            label="Heading font"
            hint="Used for H1–H4 across every section."
            value={tokens[HEADING_KEY]}
            onChange={(v) => setToken(HEADING_KEY, v)}
          />

          <FontPickerField
            label="Body font"
            hint="Used for paragraphs, lists and most UI text."
            value={tokens[BODY_KEY]}
            onChange={(v) => setToken(BODY_KEY, v)}
          />
        </div>

        {/* Preview */}
        <TypographyPreview tokens={tokens} />
      </div>

      {/* Pairings */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <h2 className="text-base font-semibold text-foreground">
          Curated pairings
        </h2>
        <p className="mt-1 text-xs text-foreground-soft">
          Tested heading + body combinations. One click applies both tokens.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PAIRINGS.map((p) => (
            <PairingCard
              key={p.name}
              pairing={p}
              onClick={() => applyPairing(p)}
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

function PairingCard({
  pairing,
  onClick,
}: {
  pairing: FontPairing;
  onClick: () => void;
}) {
  // Eagerly load the pairing's fonts so the preview text renders accurately
  // even before the user picks it.
  useEffect(() => {
    loadFontByFamily(primaryFamily(pairing.heading));
    loadFontByFamily(primaryFamily(pairing.body));
  }, [pairing.heading, pairing.body]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-xl border border-border bg-background p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-card"
    >
      <p
        className="truncate text-lg font-semibold text-foreground"
        style={{ fontFamily: pairing.heading }}
      >
        Aa
      </p>
      <p
        className="mt-0.5 truncate text-xs text-foreground-soft"
        style={{ fontFamily: pairing.body }}
      >
        The quick brown fox
      </p>
      <p className="mt-3 text-sm font-semibold text-foreground">
        {pairing.name}
      </p>
      <p className="mt-0.5 text-[11px] text-foreground-soft">
        {pairing.description}
      </p>
      {pairing.arabic && (
        <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
          Arabic-friendly
        </span>
      )}
    </button>
  );
}

function TypographyPreview({ tokens }: { tokens: Record<string, string> }) {
  const heading = tokens[HEADING_KEY] ?? "inherit";
  const body = tokens[BODY_KEY] ?? "inherit";

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft lg:sticky lg:top-4 lg:self-start">
      <h2 className="text-base font-semibold text-foreground">Preview</h2>

      <div className="mt-4 rounded-xl border border-border bg-background p-5">
        <p
          className="text-3xl font-semibold leading-tight text-foreground"
          style={{ fontFamily: heading }}
        >
          Donation transparency builds trust.
        </p>
        <p
          className="mt-3 text-sm leading-relaxed text-foreground-soft"
          style={{ fontFamily: body }}
        >
          Every rupee donated is tracked, audited and reported back to our
          community. We publish quarterly impact reports and live campaign
          totals so you always know where your gift goes.
        </p>
        <p
          dir="rtl"
          className="mt-4 text-base leading-relaxed text-foreground-soft"
          style={{ fontFamily: body }}
        >
          كل ريال يُتبرَّع به يُتتَبَّع ويُراجَع. الشفافية أساسٌ للثقة.
        </p>
      </div>
    </div>
  );
}

function primaryFamily(value: string | undefined | null): string | null {
  if (!value) return null;
  const first = value.split(",")[0].trim();
  return first.replace(/^['"]|['"]$/g, "");
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
