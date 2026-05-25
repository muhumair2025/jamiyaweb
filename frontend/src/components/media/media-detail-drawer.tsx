"use client";

import { useEffect, useState } from "react";
import { Copy, ExternalLink, Loader2, Save, Trash2, X } from "lucide-react";
import {
  formatBytes,
  updateMedia,
  type MediaItem,
} from "@/lib/media";

interface Props {
  item: MediaItem;
  onClose: () => void;
  onDelete: (id: number) => Promise<void> | void;
  onUpdated: (item: MediaItem) => void;
}

/** Slide-in panel for inspecting + editing a single media item. */
export function MediaDetailDrawer({
  item,
  onClose,
  onDelete,
  onUpdated,
}: Props) {
  const [alt, setAlt] = useState(item.alt ?? "");
  const [title, setTitle] = useState(item.title ?? "");
  const [folder, setFolder] = useState(item.folder ?? "");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  // Re-sync when the user opens a different item.
  useEffect(() => {
    setAlt(item.alt ?? "");
    setTitle(item.title ?? "");
    setFolder(item.folder ?? "");
  }, [item.id, item.alt, item.title, item.folder]);

  const dirty =
    (alt ?? "") !== (item.alt ?? "") ||
    (title ?? "") !== (item.title ?? "") ||
    (folder ?? "") !== (item.folder ?? "");

  const save = async () => {
    setBusy(true);
    try {
      const next = await updateMedia(item.id, {
        alt: alt || null,
        title: title || null,
        folder: folder || null,
      });
      onUpdated(next);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const ok = window.confirm("Delete this file? This cannot be undone.");
    if (!ok) return;
    setBusy(true);
    try {
      await onDelete(item.id);
    } finally {
      setBusy(false);
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked in older browsers — silently ignore.
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="flex-1 bg-foreground/40"
      />
      <aside className="flex h-full w-full max-w-md flex-col overflow-y-auto border-s border-border bg-background shadow-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            File details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted/60"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Preview */}
        <div className="grid place-items-center bg-foreground/5 p-6">
          {item.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={item.alt ?? item.original_filename ?? ""}
              className="max-h-72 w-auto rounded-md object-contain shadow-soft"
            />
          ) : (
            <div className="rounded-md border border-border bg-surface px-6 py-10 text-center text-sm uppercase tracking-wider text-muted-foreground">
              {item.kind}
            </div>
          )}
        </div>

        {/* Meta block */}
        <dl className="grid grid-cols-2 gap-3 border-b border-border px-5 py-4 text-xs">
          <Meta label="Filename" value={item.original_filename ?? "—"} />
          <Meta label="Size" value={formatBytes(item.size)} />
          <Meta
            label="Dimensions"
            value={
              item.width && item.height
                ? `${item.width} × ${item.height}`
                : "—"
            }
          />
          <Meta label="Type" value={item.mime} />
          <Meta
            label="Uploaded"
            value={item.created_at ? formatDate(item.created_at) : "—"}
          />
          <Meta label="Kind" value={item.kind} capitalize />
        </dl>

        {/* URL copy */}
        <div className="border-b border-border px-5 py-4">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Public URL
          </label>
          <div className="mt-1.5 flex items-stretch gap-1.5">
            <input
              readOnly
              value={item.url}
              dir="ltr"
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 rounded-md border border-border bg-muted/30 px-2.5 font-mono text-[11px] text-foreground"
            />
            <button
              type="button"
              onClick={copyUrl}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-surface px-3 text-xs font-semibold hover:border-brand/40 hover:text-brand"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-surface px-3 text-xs font-semibold hover:border-brand/40 hover:text-brand"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </a>
          </div>
        </div>

        {/* Editable fields */}
        <div className="flex-1 space-y-4 px-5 py-5">
          <Field label="Alt text" hint="Describes the image for screen readers and SEO.">
            <input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="A short description of this image…"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
          </Field>
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Optional display title"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
          </Field>
          <Field label="Folder" hint="Lowercase letters, numbers, dashes.">
            <input
              value={folder}
              onChange={(e) => setFolder(e.target.value.toLowerCase())}
              placeholder="logos, hero, blog…"
              className="h-10 w-full rounded-md border border-border bg-background px-3 font-mono text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
          </Field>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={save}
            disabled={!dirty || busy}
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-xs font-semibold text-white shadow-sm hover:bg-brand-600 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save changes
          </button>
        </div>
      </aside>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────

function Meta({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`mt-0.5 truncate text-xs font-medium text-foreground ${capitalize ? "capitalize" : ""}`}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && (
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
