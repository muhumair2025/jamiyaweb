"use client";

import { useMemo } from "react";
import { MousePointerClick } from "lucide-react";
import { useBuilderStore } from "@/builder/store";
import { SectionForm } from "@/engine/forms/section-form";
import type { SectionMeta } from "@/engine/types";

interface Props {
  sectionsCatalog: SectionMeta[];
}

/**
 * Right pane — shows the auto-form for whichever section is selected in
 * the sidebar (or the live iframe). Every keystroke flows back into the
 * Zustand store, which in turn triggers the canvas to postMessage the
 * latest draft to the iframe → live preview.
 */
export function BuilderFormPanel({ sectionsCatalog }: Props) {
  const draft = useBuilderStore((s) => s.draft);
  const selectedId = useBuilderStore((s) => s.selectedSectionId);
  const updateSettings = useBuilderStore((s) => s.updateSettings);

  const selected = useMemo(
    () => draft.sections.find((s) => s.id === selectedId) ?? null,
    [draft, selectedId]
  );

  const sectionMeta = useMemo(
    () =>
      selected
        ? sectionsCatalog.find((s) => s.slug === selected.type) ?? null
        : null,
    [selected, sectionsCatalog]
  );

  if (!selected || !sectionMeta) {
    return <EmptyState />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Editing
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
          {sectionMeta.name}
        </p>
        <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
          {sectionMeta.slug} · id {selected.id.slice(0, 8)}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <SectionForm
          // Key by section.id so the form fully remounts when selection changes
          key={selected.id}
          section={sectionMeta}
          initialValues={selected.settings}
          showSubmit={false}
          onChange={(values) => {
            updateSettings(selected.id, values);
          }}
        />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center p-6 text-center">
      <div>
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <MousePointerClick className="h-5 w-5" />
        </span>
        <p className="mt-4 text-sm font-medium text-foreground">
          Select a section
        </p>
        <p className="mt-1 text-xs text-foreground-soft">
          Click any section in the sidebar or directly on the live preview to
          edit its content here.
        </p>
      </div>
    </div>
  );
}
