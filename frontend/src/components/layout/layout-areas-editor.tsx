"use client";

import { useState, useTransition } from "react";
import { Check, Globe, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionForm } from "@/engine/forms/section-form";
import type { SectionMeta } from "@/engine/types";
import { updateWebsiteAction } from "@/lib/website-actions";

interface SectionInstanceLike {
  id: string;
  type: string;
  settings: Record<string, unknown>;
  style?: Record<string, unknown>;
  elements?: Record<string, unknown>;
}

interface Props {
  websiteId: number;
  locale: string;
  headerMeta: SectionMeta | null;
  footerMeta: SectionMeta | null;
  initialHeader: SectionInstanceLike | null;
  initialFooter: SectionInstanceLike | null;
}

type Tab = "header" | "footer";

/** Two-tab editor for the site-wide header and footer. Each tab hosts the
 *  same `SectionForm` the per-page builder uses — so the editing experience
 *  matches everywhere. Save is independent per area. */
export function LayoutAreasEditor({
  websiteId,
  headerMeta,
  footerMeta,
  initialHeader,
  initialFooter,
}: Props) {
  const [tab, setTab] = useState<Tab>("header");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">
          Site layout
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Header &amp; footer
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-foreground-soft">
          Edit the global header and footer that appear on every published
          page. Changes propagate immediately once you save — no need to
          touch each page.
        </p>
      </header>

      {/* Tabs */}
      <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1 shadow-soft">
        <TabBtn
          active={tab === "header"}
          onClick={() => setTab("header")}
        >
          Header
          {initialHeader && <Dot />}
        </TabBtn>
        <TabBtn
          active={tab === "footer"}
          onClick={() => setTab("footer")}
        >
          Footer
          {initialFooter && <Dot />}
        </TabBtn>
      </div>

      {tab === "header" ? (
        <AreaEditor
          websiteId={websiteId}
          area="header"
          meta={headerMeta}
          initial={initialHeader}
        />
      ) : (
        <AreaEditor
          websiteId={websiteId}
          area="footer"
          meta={footerMeta}
          initial={initialFooter}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────

function TabBtn({
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
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
        active
          ? "bg-brand text-white shadow-sm"
          : "text-foreground-soft hover:bg-muted/60 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function Dot() {
  return (
    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
  );
}

// ────────────────────────────────────────────────────────────────────────

function AreaEditor({
  websiteId,
  area,
  meta,
  initial,
}: {
  websiteId: number;
  area: Tab;
  meta: SectionMeta | null;
  initial: SectionInstanceLike | null;
}) {
  const [draft, setDraft] = useState<Record<string, unknown>>(
    (initial?.settings as Record<string, unknown>) ??
      (meta?.default_settings ?? {})
  );
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<boolean>(!!initial);

  if (!meta) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        The <code className="font-mono">{`site-${area}`}</code> section is
        not registered in the database. Run{" "}
        <code className="font-mono">php artisan db:seed</code> to install it.
      </div>
    );
  }

  const save = () => {
    startTransition(async () => {
      // When disabled, send null to clear the area. When enabled, send a
      // full SectionInstance (id + type + settings). Existing id is
      // preserved so element-level overrides keyed by id survive saves.
      const payload = !enabled
        ? { [area]: null }
        : {
            [area]: {
              id: initial?.id ?? `${area}-${Math.random().toString(36).slice(2, 9)}`,
              type: meta.slug,
              settings: draft,
              style: initial?.style,
              elements: initial?.elements,
            },
          };

      const res = await updateWebsiteAction(websiteId, payload);
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
    <div className="space-y-4">
      {/* Enable toggle */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 shadow-soft">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Show {area} on every page
          </p>
          <p className="mt-0.5 text-xs text-foreground-soft">
            {enabled
              ? `The ${area} renders on the public site for all visitors.`
              : `The ${area} is hidden everywhere — pages render without it.`}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((v) => !v)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
            enabled ? "bg-brand" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-soft ring-0 transition-transform",
              enabled ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      {enabled && (
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-brand" />
            <h2 className="text-base font-semibold text-foreground">
              {meta.name}
            </h2>
          </div>

          <SectionForm
            section={meta}
            initialValues={draft}
            showSubmit={false}
            onChange={(values) => {
              setDraft(values);
              setStatus("idle");
            }}
          />
        </div>
      )}

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
          disabled={pending}
          className={cn(
            "inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-sm font-semibold transition-colors",
            !pending
              ? "bg-foreground text-background hover:bg-brand"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          )}
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save {area}
        </button>
      </div>
    </div>
  );
}

