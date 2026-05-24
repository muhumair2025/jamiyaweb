"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useBuilderStore } from "@/builder/store";
import type { SectionMeta } from "@/engine/types";
import { AddSectionDialog } from "./add-section-dialog";
import { cn } from "@/lib/utils";

interface Props {
  sectionsCatalog: SectionMeta[];
}

export function BuilderSidebar({ sectionsCatalog }: Props) {
  const draft = useBuilderStore((s) => s.draft);
  const selectedId = useBuilderStore((s) => s.selectedSectionId);
  const select = useBuilderStore((s) => s.selectSection);
  const reorder = useBuilderStore((s) => s.reorderSections);
  const remove = useBuilderStore((s) => s.removeSection);

  const [addOpen, setAddOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const ids = draft.sections.map((s) => s.id);
    const oldIdx = ids.indexOf(String(e.active.id));
    const newIdx = ids.indexOf(String(e.over.id));
    if (oldIdx === -1 || newIdx === -1) return;
    reorder(arrayMove(ids, oldIdx, newIdx));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Sections · {draft.sections.length}
        </p>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex h-7 items-center gap-1 rounded-md bg-brand px-2 text-[11px] font-semibold text-white shadow-soft transition-colors hover:bg-brand-600"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {draft.sections.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            No sections yet. Click <b>Add</b> to drop one in.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={draft.sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-1">
                {draft.sections.map((section) => (
                  <SortableRow
                    key={section.id}
                    id={section.id}
                    type={section.type}
                    selected={section.id === selectedId}
                    onSelect={() => select(section.id)}
                    onRemove={() => {
                      if (
                        window.confirm(
                          `Remove section "${section.type}"? This cannot be undone after saving.`
                        )
                      ) {
                        remove(section.id);
                      }
                    }}
                    label={
                      sectionsCatalog.find((s) => s.slug === section.type)?.name ??
                      section.type
                    }
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <AddSectionDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        catalog={sectionsCatalog}
      />
    </div>
  );
}

// ─── Single sortable row ──────────────────────────────────────────
function SortableRow({
  id,
  type,
  label,
  selected,
  onSelect,
  onRemove,
}: {
  id: string;
  type: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "group flex items-center gap-1 rounded-md border bg-surface transition-colors",
        selected
          ? "border-brand/40 bg-brand-50/40"
          : "border-border hover:border-brand/30",
        isDragging && "shadow-card"
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="inline-flex h-9 w-6 cursor-grab items-center justify-center text-muted-foreground hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="flex h-9 min-w-0 flex-1 items-center gap-2 text-start"
      >
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            selected ? "bg-brand" : "bg-border-strong"
          )}
        />
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-sm font-medium",
            selected ? "text-foreground" : "text-foreground-soft"
          )}
        >
          {label}
        </span>
        <span className="hidden text-[10px] uppercase tracking-wider text-muted-foreground/70 sm:inline">
          {type}
        </span>
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove section"
        title="Remove section"
        className="me-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}
