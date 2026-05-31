"use client";

// Side-effect import: ensures the section registry is populated in the
// PARENT window. The BuilderRenderer also imports this, but that runs inside
// the preview iframe — a separate JS context. Without this line the parent's
// `getSectionVariants(slug)` returns [] and the Variants tab never appears.
import "@/sections/_register";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  LayoutTemplate,
  MousePointerClick,
  Palette,
  Settings2,
} from "lucide-react";
import { useBuilderStore } from "@/builder/store";
import { getSectionVariants } from "@/engine/component-registry";
import { SectionForm } from "@/engine/forms/section-form";
import type { SectionMeta } from "@/engine/types";
import { cn } from "@/lib/utils";
import { StylePanel } from "./style-panel";
import { ElementStylePanel } from "./element-style-panel";
import { VariantsPanel } from "./variants-panel";

interface Props {
  sectionsCatalog: SectionMeta[];
}

type SectionTab = "content" | "style" | "variants";

/**
 * Right pane — context-aware editor.
 *
 *   • Nothing selected         → empty state
 *   • Section selected         → tabs: Content | Style
 *   • Element inside section   → Element Style controls + breadcrumb up
 */
export function BuilderFormPanel({ sectionsCatalog }: Props) {
  const draft = useBuilderStore((s) => s.draft);
  const selection = useBuilderStore((s) => s.selection);
  const updateSettings = useBuilderStore((s) => s.updateSettings);
  const selectSection = useBuilderStore((s) => s.selectSection);

  const [tab, setTab] = useState<SectionTab>("content");

  // Resolve the section + section metadata that's in scope (works for both
  // section-only and element selections, since both carry `sectionId`).
  const selectedSection = useMemo(() => {
    if (!selection) return null;
    return draft.sections.find((s) => s.id === selection.sectionId) ?? null;
  }, [draft, selection]);

  const sectionMeta = useMemo(() => {
    if (!selectedSection) return null;
    return (
      sectionsCatalog.find((s) => s.slug === selectedSection.type) ?? null
    );
  }, [selectedSection, sectionsCatalog]);

  const hasVariants = useMemo(() => {
    if (!selectedSection) return false;
    return getSectionVariants(selectedSection.type).length > 1;
  }, [selectedSection]);

  // If a non-existent tab is active (e.g. switched to a section with no
  // variants), fall back to Content so the panel never shows blank.
  const effectiveTab: SectionTab =
    tab === "variants" && !hasVariants ? "content" : tab;

  if (!selection || !selectedSection || !sectionMeta) {
    return <EmptyState />;
  }

  // ─── ELEMENT-LEVEL selection ──────────────────────────────────────
  if (selection.kind === "element") {
    const elementStyle = selectedSection.elements?.[selection.elementId];

    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border px-4 pt-3 pb-3">
          {/* Breadcrumb: back to section */}
          <button
            type="button"
            onClick={() => selectSection(selection.sectionId)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-3 w-3 rtl:rotate-180" />
            {sectionMeta.name}
          </button>

          <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Editing element
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
            {humaniseElementId(selection.elementId)}
          </p>
          <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
            {selection.elementId} · {selection.elementKind}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <ElementStylePanel
            key={`${selection.sectionId}:${selection.elementId}`}
            sectionId={selection.sectionId}
            elementId={selection.elementId}
            elementKind={selection.elementKind}
            style={elementStyle}
          />
        </div>
      </div>
    );
  }

  // ─── SECTION-LEVEL selection (Content / Style tabs) ───────────────
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Editing
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
          {sectionMeta.name}
        </p>
        <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
          {sectionMeta.slug} · id {selectedSection.id.slice(0, 8)}
        </p>

        {/* Tip — click any element in the preview to drill in */}
        <p className="mt-2 text-[10px] text-muted-foreground">
          Tip: click any text, button or image in the preview to edit it on
          its own.
        </p>

        {/* Tabs */}
        <div className="-mb-px mt-3 flex gap-1">
          <TabButton
            active={effectiveTab === "content"}
            onClick={() => setTab("content")}
            icon={<Settings2 className="h-3.5 w-3.5" />}
          >
            Content
          </TabButton>
          <TabButton
            active={effectiveTab === "style"}
            onClick={() => setTab("style")}
            icon={<Palette className="h-3.5 w-3.5" />}
          >
            Style
          </TabButton>
          {hasVariants && (
            <TabButton
              active={effectiveTab === "variants"}
              onClick={() => setTab("variants")}
              icon={<LayoutTemplate className="h-3.5 w-3.5" />}
            >
              Variants
            </TabButton>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {effectiveTab === "content" && (
          <SectionForm
            key={`content-${selectedSection.id}`}
            section={sectionMeta}
            initialValues={selectedSection.settings}
            showSubmit={false}
            onChange={(values) => {
              updateSettings(selectedSection.id, values);
            }}
          />
        )}
        {effectiveTab === "style" && (
          <StylePanel
            key={`style-${selectedSection.id}`}
            sectionId={selectedSection.id}
            style={selectedSection.style}
          />
        )}
        {effectiveTab === "variants" && (
          <VariantsPanel
            key={`variants-${selectedSection.id}`}
            sectionId={selectedSection.id}
            sectionSlug={selectedSection.type}
            currentVariant={
              typeof selectedSection.settings.variant === "string"
                ? (selectedSection.settings.variant as string)
                : null
            }
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-[12px] font-semibold transition-colors",
        active
          ? "border-brand text-brand"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
      aria-pressed={active}
    >
      {icon}
      {children}
    </button>
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
          edit it.
        </p>
      </div>
    </div>
  );
}

/** "cta_label" → "CTA label"; "title" → "Title". */
function humaniseElementId(id: string): string {
  return id
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/^[a-z]/, (c) => c.toUpperCase());
}
