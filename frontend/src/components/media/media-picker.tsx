"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CheckCircle2,
  ImagePlus,
  Link as LinkIcon,
  Loader2,
  Search,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  listMedia,
  uploadMedia,
  type MediaItem,
  type MediaKind,
} from "@/lib/media";
import { MediaCard } from "./media-card";

interface Props {
  /** When provided, dialog is open; null/undefined means closed. */
  open: boolean;
  onClose: () => void;
  /** Called with the chosen URL (and optional MediaItem if the choice came
   *  from the library). */
  onSelect: (value: { url: string; item?: MediaItem }) => void;
  /** Constrain results to one kind. Defaults to "image" (most common
   *  caller is the image field). */
  kind?: MediaKind;
  /** Optional website scope. */
  websiteId?: number | null;
  /** Optional current value, used to seed the URL tab. */
  currentUrl?: string | null;
  /** Custom dialog title. */
  title?: string;
}

type Tab = "library" | "upload" | "url";

/**
 * Universal media picker. Three tabs:
 *
 *  1. Library — browse existing media; click to select.
 *  2. Upload  — drag/drop or click to upload, then auto-select.
 *  3. URL     — paste a remote URL (escape hatch for external assets).
 *
 * Returns a plain URL string via onSelect — image fields don't care where
 * the file lives, only how to fetch it.
 */
export function MediaPicker({
  open,
  onClose,
  onSelect,
  kind = "image",
  websiteId = null,
  currentUrl = null,
  title = "Choose media",
}: Props) {
  const [tab, setTab] = useState<Tab>("library");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [urlInput, setUrlInput] = useState(currentUrl ?? "");
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headingId = useId();

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setTab("library");
      setQuery("");
      setDebouncedQuery("");
      setUrlInput(currentUrl ?? "");
      setUploadErr(null);
    }
  }, [open, currentUrl]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch library items when on the library tab + filters change
  useEffect(() => {
    if (!open || tab !== "library") return;
    let cancelled = false;
    setLoading(true);
    listMedia({
      websiteId,
      kind,
      q: debouncedQuery || null,
      perPage: 60,
      page: 1,
    })
      .then((res) => {
        if (!cancelled) setItems(res.data);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, tab, debouncedQuery, kind, websiteId]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploadBusy(true);
      setUploadErr(null);
      try {
        const { data } = await uploadMedia({ file, websiteId });
        onSelect({ url: data.url, item: data });
        onClose();
      } catch (err) {
        setUploadErr(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploadBusy(false);
      }
    },
    [websiteId, onSelect, onClose]
  );

  const acceptAttr = useMemo(() => {
    switch (kind) {
      case "image":
        return "image/*";
      case "video":
        return "video/*";
      case "audio":
        return "audio/*";
      case "document":
        return "application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt";
      default:
        return "*/*";
    }
  }, [kind]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
      />

      {/* Dialog */}
      <div className="relative flex h-[min(85vh,720px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2
              id={headingId}
              className="text-base font-semibold text-foreground"
            >
              {title}
            </h2>
            <p className="text-xs text-foreground-soft">
              Pick from your library, upload a new file, or paste a URL.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-muted/60"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border px-4 pt-3">
          <TabBtn label="Library" active={tab === "library"} onClick={() => setTab("library")} />
          <TabBtn label="Upload" active={tab === "upload"} onClick={() => setTab("upload")} />
          <TabBtn label="URL" active={tab === "url"} onClick={() => setTab("url")} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-paper/60">
          {tab === "library" && (
            <div className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search…"
                    autoFocus
                    className="h-10 w-full rounded-md border border-border bg-background ps-9 pe-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setTab("upload")}
                  className="inline-flex h-10 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-semibold hover:border-brand/40 hover:text-brand"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload new
                </button>
              </div>

              {loading ? (
                <div className="grid place-items-center py-20 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="grid place-items-center py-20 text-center">
                  <ImagePlus className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    No matching files
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-foreground-soft">
                    Try a different search, or upload something new from the Upload tab.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                  {items.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      selected={false}
                      onToggleSelect={() => {}}
                      onOpen={() => {}}
                      onPick={() => {
                        onSelect({ url: item.url, item });
                        onClose();
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "upload" && (
            <UploadTab
              accept={acceptAttr}
              busy={uploadBusy}
              error={uploadErr}
              onFile={handleUpload}
              inputRef={fileInputRef}
            />
          )}

          {tab === "url" && (
            <div className="space-y-4 p-6">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Paste a URL
                </label>
                <div className="mt-2 flex items-stretch gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="url"
                      dir="ltr"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://…/image.jpg"
                      autoFocus
                      className="h-11 w-full rounded-md border border-border bg-background ps-9 pe-3 font-mono text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!urlInput.trim()}
                    onClick={() => {
                      onSelect({ url: urlInput.trim() });
                      onClose();
                    }}
                    className="inline-flex h-11 items-center gap-1.5 rounded-md bg-brand px-4 text-xs font-semibold text-white shadow-sm hover:bg-brand-600 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Use this URL
                  </button>
                </div>
              </div>
              {urlInput && (
                <div className="rounded-lg border border-border bg-surface p-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Preview
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={urlInput}
                    alt="preview"
                    className="max-h-64 max-w-full rounded-md object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────

function TabBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-brand text-brand"
          : "border-transparent text-foreground-soft hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

function UploadTab({
  accept,
  busy,
  error,
  onFile,
  inputRef,
}: {
  accept: string;
  busy: boolean;
  error: string | null;
  onFile: (f: File) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div className="grid place-items-center p-8">
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setHover(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setHover(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        className={cn(
          "grid w-full max-w-xl place-items-center rounded-2xl border-2 border-dashed px-8 py-16 text-center transition-colors",
          hover
            ? "border-brand bg-brand-50/60"
            : "border-border bg-surface/60"
        )}
      >
        {busy ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-brand" />
            <p className="mt-4 text-sm font-semibold text-foreground">
              Uploading…
            </p>
          </>
        ) : (
          <>
            <ImagePlus className="h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-sm font-semibold text-foreground">
              Drop a file here, or
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-3 inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-xs font-semibold text-white shadow-sm hover:bg-brand-600"
            >
              <Upload className="h-3.5 w-3.5" />
              Choose file
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) onFile(f);
              }}
            />
            <p className="mt-4 text-[11px] text-muted-foreground">
              Max 25 MB. JPG, PNG, GIF, WebP, AVIF, SVG…
            </p>
          </>
        )}
        {error && (
          <p className="mt-4 max-w-xs rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
