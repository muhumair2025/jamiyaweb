"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  CheckCircle2,
  Filter,
  ImagePlus,
  Loader2,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  bulkDeleteMedia,
  deleteMedia,
  formatBytes,
  kindFromMime,
  listMedia,
  uploadMedia,
  type MediaItem,
  type MediaKind,
  type MediaListMeta,
} from "@/lib/media";
import { MediaCard } from "./media-card";
import { MediaDetailDrawer } from "./media-detail-drawer";

interface Props {
  initialItems: MediaItem[];
  initialMeta: MediaListMeta;
  websiteId: number | null;
}

const KIND_FILTERS: { value: MediaKind | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "document", label: "Documents" },
  { value: "audio", label: "Audio" },
];

/** Client shell for the media library page. Holds list state, upload queue
 *  and selection state. SSR delivers the first page; everything after is
 *  client-driven for snappy interactions. */
export function MediaLibrary({ initialItems, initialMeta, websiteId }: Props) {
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [meta, setMeta] = useState<MediaListMeta>(initialMeta);
  const [kind, setKind] = useState<MediaKind | "all">("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selection, setSelection] = useState<Set<number>>(new Set());
  const [detailFor, setDetailFor] = useState<MediaItem | null>(null);
  const [uploads, setUploads] = useState<UploadEntry[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Reload list when filters change
  const reload = useCallback(
    async (opts: { keepSelection?: boolean } = {}) => {
      setIsLoading(true);
      try {
        const res = await listMedia({
          websiteId,
          kind: kind === "all" ? null : kind,
          q: debouncedQuery || null,
          page: 1,
          perPage: 60,
        });
        setItems(res.data);
        setMeta(res.meta);
        if (!opts.keepSelection) setSelection(new Set());
      } finally {
        setIsLoading(false);
      }
    },
    [websiteId, kind, debouncedQuery]
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  // ── Upload handling ─────────────────────────────────────────────────
  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (!files.length) return;

      const entries: UploadEntry[] = files.map((file) => ({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        file,
        status: "pending",
      }));
      setUploads((u) => [...entries, ...u]);

      for (const entry of entries) {
        setUploads((u) =>
          u.map((e) => (e.id === entry.id ? { ...e, status: "uploading" } : e))
        );
        try {
          const { data, deduped } = await uploadMedia({
            file: entry.file,
            websiteId,
          });
          setItems((prev) => {
            // Avoid duplicates if dedupe returned an existing item
            const exists = prev.some((p) => p.id === data.id);
            return exists ? prev : [data, ...prev];
          });
          setUploads((u) =>
            u.map((e) =>
              e.id === entry.id ? { ...e, status: "done", deduped, item: data } : e
            )
          );
          // Auto-clear successful uploads after a moment
          setTimeout(() => {
            setUploads((u) => u.filter((e) => e.id !== entry.id));
          }, 1800);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Upload failed";
          setUploads((u) =>
            u.map((e) =>
              e.id === entry.id
                ? { ...e, status: "error", error: message }
                : e
            )
          );
        }
      }
    },
    [websiteId]
  );

  // ── Drag-and-drop (whole page) ──────────────────────────────────────
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) {
      dragCounter.current += 1;
      setIsDragging(true);
    }
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDragging(false);
      dragCounter.current = 0;
    }
  };
  const onDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) e.preventDefault();
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files?.length) {
      void handleFiles(e.dataTransfer.files);
    }
  };

  // ── Selection + bulk actions ────────────────────────────────────────
  const toggleSelected = (id: number) => {
    setSelection((sel) => {
      const next = new Set(sel);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelection(new Set());

  const handleBulkDelete = () => {
    if (selection.size === 0) return;
    const ids = Array.from(selection);
    const confirmed = window.confirm(
      `Delete ${ids.length} item${ids.length === 1 ? "" : "s"}? This cannot be undone.`
    );
    if (!confirmed) return;
    startTransition(async () => {
      try {
        await bulkDeleteMedia(ids);
        setItems((prev) => prev.filter((p) => !ids.includes(p.id)));
        clearSelection();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Bulk delete failed");
      }
    });
  };

  const handleDeleteOne = async (id: number) => {
    try {
      await deleteMedia(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
      setSelection((sel) => {
        const next = new Set(sel);
        next.delete(id);
        return next;
      });
      if (detailFor?.id === id) setDetailFor(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleUpdated = (next: MediaItem) => {
    setItems((prev) => prev.map((p) => (p.id === next.id ? next : p)));
    setDetailFor(next);
  };

  const totalLabel = useMemo(() => {
    if (meta.total === 0) return "No items";
    if (meta.total === 1) return "1 item";
    return `${meta.total} items`;
  }, [meta.total]);

  // ──────────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            Library
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Media library
          </h1>
          <p className="mt-2 text-sm text-foreground-soft">
            {totalLabel} · drag &amp; drop files anywhere, or click upload.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background shadow-card transition-colors hover:bg-brand"
        >
          <Upload className="h-4 w-4" />
          Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Filter + search bar */}
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-soft">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          Filter
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {KIND_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setKind(f.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                kind === f.value
                  ? "bg-brand text-white"
                  : "text-foreground-soft hover:bg-muted/60"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="ms-auto flex min-w-[200px] flex-1 items-center gap-2 sm:flex-initial">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search filename, alt or title…"
              className="h-9 w-full rounded-md border border-border bg-background ps-9 pe-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
          </div>
        </div>
      </div>

      {/* Selection toolbar */}
      {selection.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-brand/30 bg-brand-50/60 px-4 py-2.5">
          <CheckCircle2 className="h-4 w-4 text-brand" />
          <p className="text-sm font-medium text-foreground">
            {selection.size} selected
          </p>
          <button
            type="button"
            onClick={clearSelection}
            className="ms-auto text-xs font-medium text-foreground-soft hover:text-foreground"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={isPending}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-red-600 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete selected
          </button>
        </div>
      )}

      {/* Upload status strip */}
      {uploads.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {uploads.map((u) => (
            <UploadRow key={u.id} entry={u} />
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="mt-6">
        {isLoading && items.length === 0 ? (
          <div className="grid place-items-center py-20 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState onPick={() => inputRef.current?.click()} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                selected={selection.has(item.id)}
                onToggleSelect={() => toggleSelected(item.id)}
                onOpen={() => setDetailFor(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drag overlay */}
      {isDragging && (
        <div className="pointer-events-none fixed inset-0 z-40 grid place-items-center bg-foreground/40 backdrop-blur-sm">
          <div className="rounded-2xl border-2 border-dashed border-white bg-background/80 px-10 py-8 text-center shadow-card">
            <ImagePlus className="mx-auto h-10 w-10 text-brand" />
            <p className="mt-3 text-base font-semibold text-foreground">
              Drop to upload
            </p>
            <p className="text-xs text-muted-foreground">
              Files will be uploaded to your media library
            </p>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {detailFor && (
        <MediaDetailDrawer
          item={detailFor}
          onClose={() => setDetailFor(null)}
          onDelete={handleDeleteOne}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────

function EmptyState({ onPick }: { onPick: () => void }) {
  return (
    <div className="grid place-items-center rounded-2xl border-2 border-dashed border-border bg-surface/50 px-8 py-20 text-center">
      <ImagePlus className="h-10 w-10 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        Your library is empty
      </h3>
      <p className="mt-1 max-w-sm text-sm text-foreground-soft">
        Upload images, videos and documents to use them in your site. Drop files
        anywhere on this page, or click the button below.
      </p>
      <button
        type="button"
        onClick={onPick}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-card hover:bg-brand-600"
      >
        <Upload className="h-4 w-4" />
        Upload your first file
      </button>
    </div>
  );
}

// ── Types + sub-components ──────────────────────────────────────────────

interface UploadEntry {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  deduped?: boolean;
  item?: MediaItem;
}

function UploadRow({ entry }: { entry: UploadEntry }) {
  const kind = kindFromMime(entry.file.type);
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border px-3 py-2 text-xs",
        entry.status === "error"
          ? "border-red-300 bg-red-50 text-red-800"
          : entry.status === "done"
            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
            : "border-border bg-surface"
      )}
    >
      {entry.status === "uploading" || entry.status === "pending" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
      ) : entry.status === "done" ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <X className="h-3.5 w-3.5" />
      )}
      <span className="font-medium">{entry.file.name}</span>
      <span className="text-muted-foreground">
        · {formatBytes(entry.file.size)} · {kind}
      </span>
      {entry.deduped && (
        <span className="ms-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
          Already in library
        </span>
      )}
      {entry.error && (
        <span className="ms-auto truncate text-[11px]">{entry.error}</span>
      )}
    </div>
  );
}
