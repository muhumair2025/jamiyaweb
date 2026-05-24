"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Redo2,
  Save,
  Undo2,
} from "lucide-react";
import { useBuilderStore } from "@/builder/store";
import { savePageAction } from "@/builder/actions";
import { cn } from "@/lib/utils";

interface Props {
  locale: string;
  siteName: string;
  subdomain: string;
  themeName: string;
  pageTitle: string;
}

export function BuilderTopbar({
  locale,
  siteName,
  subdomain,
  themeName,
  pageTitle,
}: Props) {
  const meta = useBuilderStore((s) => s.meta);
  const draft = useBuilderStore((s) => s.draft);
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const canUndo = useBuilderStore((s) => s.canUndo());
  const canRedo = useBuilderStore((s) => s.canRedo());
  const isDirty = useBuilderStore((s) => s.isDirty());
  const saving = useBuilderStore((s) => s.saving);
  const beginSave = useBuilderStore((s) => s.beginSave);
  const finishSave = useBuilderStore((s) => s.finishSave);
  const failSave = useBuilderStore((s) => s.failSave);

  const [pending, startTransition] = useTransition();
  const busy = saving || pending;

  const onSave = () => {
    if (!meta || busy || !isDirty) return;
    beginSave();
    startTransition(async () => {
      const result = await savePageAction(
        meta.websiteId,
        meta.pageSlug,
        draft
      );
      if (result.ok) finishSave(draft);
      else failSave(result.message ?? "Save failed");
    });
  };

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-3 sm:px-4">
      {/* Left: back + logo + title */}
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground-soft transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        </Link>
        <Link href={`/${locale}/dashboard`} className="hidden sm:flex">
          <Image
            src="/logo.png"
            alt="JamiyaWeb"
            width={120}
            height={32}
            className="h-7 w-auto"
          />
        </Link>
        <div className="hidden min-w-0 lg:flex lg:flex-col">
          <span className="truncate text-xs font-semibold text-foreground">
            {siteName} · {pageTitle}
          </span>
          <span className="truncate text-[10px] text-muted-foreground">
            Theme: {themeName} ·{" "}
            <span dir="ltr" className="font-mono">
              {subdomain}.localhost:3000
            </span>
          </span>
        </div>
      </div>

      {/* Right: undo/redo · save · view live */}
      <div className="flex items-center gap-2">
        <DirtyBadge isDirty={isDirty} />
        <IconBtn
          onClick={() => undo()}
          disabled={!canUndo}
          label="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </IconBtn>
        <IconBtn
          onClick={() => redo()}
          disabled={!canRedo}
          label="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-4 w-4" />
        </IconBtn>
        <button
          type="button"
          onClick={onSave}
          disabled={!isDirty || busy}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors",
            isDirty && !busy
              ? "bg-foreground text-background hover:bg-brand"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          )}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save
        </button>
        <a
          href={`http://${subdomain}.localhost:3000`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:border-brand/40 hover:text-brand"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View live
        </a>
      </div>
    </header>
  );
}

function IconBtn({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors",
        disabled
          ? "cursor-not-allowed text-muted-foreground/40"
          : "text-foreground-soft hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function DirtyBadge({ isDirty }: { isDirty: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        isDirty
          ? "bg-amber-100 text-amber-700"
          : "bg-emerald-100 text-emerald-700"
      )}
    >
      <span
        className={cn(
          "inline-flex h-1.5 w-1.5 rounded-full",
          isDirty ? "bg-amber-500" : "bg-emerald-500"
        )}
      />
      {isDirty ? "Unsaved" : "Saved"}
    </span>
  );
}
