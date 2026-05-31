"use client";

import { useState, useTransition } from "react";
import { Check, ImageIcon, Loader2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateWebsiteAction } from "@/lib/website-actions";
import { MediaPicker } from "@/components/media/media-picker";

interface Props {
  websiteId: number;
  initialLogo: string | null;
  initialFavicon: string | null;
  siteName: string;
}

/** Logo + favicon editor. Uses the existing MediaPicker for upload + library
 *  pick, then patches the website with the chosen public URLs. */
export function IdentityEditor({
  websiteId,
  initialLogo,
  initialFavicon,
  siteName,
}: Props) {
  const [logo, setLogo] = useState<string | null>(initialLogo);
  const [favicon, setFavicon] = useState<string | null>(initialFavicon);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const isDirty = logo !== initialLogo || favicon !== initialFavicon;

  const save = () => {
    startTransition(async () => {
      const res = await updateWebsiteAction(websiteId, {
        logo_path: logo,
        favicon_path: favicon,
      });
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
      <div className="grid gap-5 lg:grid-cols-2">
        <AssetCard
          label="Logo"
          hint="Shown in the header, footer, and sometimes on social previews. Use a transparent PNG or SVG ideally."
          value={logo}
          aspect="wide"
          onChange={setLogo}
        />
        <AssetCard
          label="Favicon"
          hint="The tiny icon on browser tabs. Use a square image ≥ 32×32. SVG or PNG."
          value={favicon}
          aspect="square"
          onChange={setFavicon}
        />
      </div>

      {/* Browser-tab preview */}
      <BrowserTabPreview favicon={favicon} siteName={siteName} />

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

function AssetCard({
  label,
  hint,
  value,
  aspect,
  onChange,
}: {
  label: string;
  hint: string;
  value: string | null;
  aspect: "wide" | "square";
  onChange: (next: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <h2 className="text-base font-semibold text-foreground">{label}</h2>
      <p className="mt-1 text-xs text-foreground-soft">{hint}</p>

      <div
        className={cn(
          "mt-4 grid place-items-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-background",
          aspect === "wide" ? "h-32" : "aspect-square w-32"
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt={label}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-brand px-3 text-xs font-semibold text-white shadow-sm hover:bg-brand-600"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          {value ? "Replace" : "Choose"} {label.toLowerCase()}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={({ url }) => onChange(url)}
        kind="image"
        currentUrl={value ?? null}
        title={`Choose ${label.toLowerCase()}`}
      />
    </div>
  );
}

function BrowserTabPreview({
  favicon,
  siteName,
}: {
  favicon: string | null;
  siteName: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <h2 className="text-base font-semibold text-foreground">Tab preview</h2>
      <p className="mt-1 text-xs text-foreground-soft">
        How your site looks in a browser tab. Updates instantly as you change
        the favicon.
      </p>

      <div className="mt-4 flex items-end overflow-hidden rounded-lg border border-border bg-paper">
        <div className="flex h-9 max-w-xs items-center gap-2 truncate rounded-t-md border-x border-t border-border bg-background px-3 text-xs font-medium text-foreground">
          {favicon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={favicon}
              alt=""
              className="h-3.5 w-3.5 shrink-0 object-contain"
            />
          ) : (
            <span className="h-3.5 w-3.5 shrink-0 rounded-sm bg-muted" />
          )}
          <span className="truncate">{siteName}</span>
        </div>
        <div className="ms-1 h-9 flex-1 border-b border-border" />
      </div>
    </div>
  );
}
