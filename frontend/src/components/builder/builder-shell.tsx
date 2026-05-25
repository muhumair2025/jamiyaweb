"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import type { PageContent, SectionMeta } from "@/engine/types";
import { useBuilderStore } from "@/builder/store";
import { useBuilderShortcuts } from "@/builder/shortcuts";
import { BuilderTopbar } from "./builder-topbar";
import { BuilderSidebar } from "./builder-sidebar";
import { BuilderCanvas } from "./builder-canvas";
import { BuilderFormPanel } from "./builder-form-panel";
import { ShortcutsOverlay } from "./shortcuts-overlay";

interface Props {
  locale: string;
  meta: {
    websiteId: number;
    pageSlug: string;
    pageTitle: string;
    subdomain: string;
    siteName: string;
  };
  initialPage: PageContent;
  themeName: string;
  sectionsCatalog: SectionMeta[];
}

/**
 * The full 3-pane visual editor.
 *
 *   ┌──────────────────────────────────────────────────────────┐
 *   │  Topbar: site name · undo/redo · save · view live · exit │
 *   ├──────────┬──────────────────────────────┬────────────────┤
 *   │ Sidebar  │   Live preview iframe        │  Form panel    │
 *   │ section  │   (builder-preview route,    │  selected      │
 *   │ list +   │    same origin, listens for  │  section's     │
 *   │ add/del  │    postMessage)              │  SectionForm   │
 *   └──────────┴──────────────────────────────┴────────────────┘
 */
export function BuilderShell({
  locale,
  meta,
  initialPage,
  themeName,
  sectionsCatalog,
}: Props) {
  const hydrate = useBuilderStore((s) => s.hydrate);
  const hydrated = useRef(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Hydrate the store exactly once for this mount
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    hydrate(
      {
        websiteId: meta.websiteId,
        pageSlug: meta.pageSlug,
        pageTitle: meta.pageTitle,
        subdomain: meta.subdomain,
      },
      initialPage
    );
  }, [hydrate, meta, initialPage]);

  const openPreview = useCallback(() => {
    // Same URL the topbar's "View live" button uses, but Cmd+P aware.
    window.open(`http://${meta.subdomain}.localhost:3000`, "_blank", "noopener,noreferrer");
  }, [meta.subdomain]);

  const toggleShortcutOverlay = useCallback(
    () => setShortcutsOpen((v) => !v),
    []
  );

  useBuilderShortcuts({ openPreview, toggleShortcutOverlay });

  return (
    <div className="flex h-full w-full flex-col">
      <BuilderTopbar
        locale={locale}
        siteName={meta.siteName}
        subdomain={meta.subdomain}
        themeName={themeName}
        pageTitle={meta.pageTitle}
      />

      <div className="flex-1 overflow-hidden">
        {/* react-resizable-panels v4 — numeric sizes are PIXELS, strings are
            percentages. We want flex layout, so all sizes are strings here. */}
        <PanelGroup orientation="horizontal" className="h-full">
          {/* ── Left: sections list ── */}
          <Panel
            id="sidebar"
            defaultSize="20%"
            minSize="16%"
            maxSize="32%"
            className="bg-surface"
          >
            <BuilderSidebar sectionsCatalog={sectionsCatalog} />
          </Panel>

          <PanelResizeHandle className="w-px bg-border transition-colors data-[resize-handle-state=hover]:bg-brand/30 data-[resize-handle-state=drag]:bg-brand/50" />

          {/* ── Middle: live preview ── */}
          <Panel id="canvas" defaultSize="55%" minSize="35%">
            <BuilderCanvas
              websiteId={meta.websiteId}
              pageSlug={meta.pageSlug}
            />
          </Panel>

          <PanelResizeHandle className="w-px bg-border transition-colors data-[resize-handle-state=hover]:bg-brand/30 data-[resize-handle-state=drag]:bg-brand/50" />

          {/* ── Right: form panel ── */}
          <Panel
            id="form"
            defaultSize="25%"
            minSize="20%"
            maxSize="40%"
            className="bg-paper"
          >
            <BuilderFormPanel sectionsCatalog={sectionsCatalog} />
          </Panel>
        </PanelGroup>
      </div>

      <ShortcutsOverlay
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}
