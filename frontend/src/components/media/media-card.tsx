"use client";

import { FileText, Film, Music, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes, type MediaItem } from "@/lib/media";

interface Props {
  item: MediaItem;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  /** Optional callback for picker mode — picks this item without opening detail. */
  onPick?: () => void;
}

/** A single tile in the media grid. Clicking the tile opens the detail
 *  drawer (or fires onPick if provided). The corner checkbox toggles
 *  selection without opening anything. */
export function MediaCard({
  item,
  selected,
  onToggleSelect,
  onOpen,
  onPick,
}: Props) {
  const handleClick = () => {
    if (onPick) onPick();
    else onOpen();
  };

  return (
    <div
      className={cn(
        "group relative aspect-square overflow-hidden rounded-lg border bg-surface transition-all",
        selected
          ? "border-brand ring-2 ring-brand/30"
          : "border-border hover:border-brand/40"
      )}
    >
      <button
        type="button"
        onClick={handleClick}
        className="absolute inset-0 flex items-center justify-center"
        aria-label={`Open ${item.original_filename ?? "file"}`}
      >
        <Preview item={item} />
      </button>

      {/* Hover overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-2.5 pb-2 pt-6 opacity-0 transition-opacity group-hover:opacity-100">
        <p className="truncate text-[11px] font-semibold text-white">
          {item.original_filename ?? item.title ?? "Untitled"}
        </p>
        <p className="truncate text-[10px] text-white/70">
          {formatBytes(item.size)}
          {item.width && item.height ? ` · ${item.width}×${item.height}` : ""}
        </p>
      </div>

      {/* Selection checkbox */}
      {!onPick && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className={cn(
            "absolute end-2 top-2 grid h-6 w-6 place-items-center rounded-full border-2 text-[10px] font-bold transition-all",
            selected
              ? "border-brand bg-brand text-white opacity-100"
              : "border-white/80 bg-background/80 text-transparent opacity-0 group-hover:opacity-100 hover:text-brand"
          )}
          aria-label={selected ? "Deselect" : "Select"}
        >
          ✓
        </button>
      )}

      {/* Kind badge */}
      {item.kind !== "image" && (
        <span className="absolute start-2 top-2 rounded bg-foreground/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-background">
          {item.kind}
        </span>
      )}
    </div>
  );
}

function Preview({ item }: { item: MediaItem }) {
  if (item.kind === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.url}
        alt={item.alt ?? item.original_filename ?? ""}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }

  if (item.kind === "video") {
    return (
      <div className="grid h-full w-full place-items-center bg-foreground/5">
        <Film className="h-10 w-10 text-foreground/40" />
      </div>
    );
  }

  if (item.kind === "audio") {
    return (
      <div className="grid h-full w-full place-items-center bg-foreground/5">
        <Music className="h-10 w-10 text-foreground/40" />
      </div>
    );
  }

  if (item.kind === "document") {
    return (
      <div className="grid h-full w-full place-items-center bg-foreground/5">
        <FileText className="h-10 w-10 text-foreground/40" />
      </div>
    );
  }

  return (
    <div className="grid h-full w-full place-items-center bg-foreground/5">
      <FileQuestion className="h-10 w-10 text-foreground/40" />
    </div>
  );
}
