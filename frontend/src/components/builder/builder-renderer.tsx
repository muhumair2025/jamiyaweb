"use client";

// Side-effect import: registers every section component in the CLIENT bundle.
// Without this the iframe shows "Section X is not registered" because the
// server's registration doesn't carry over into the client runtime.
import "@/sections/_register";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { generateCssVars, mergeTokens } from "@/engine/core/tokens";
import { getSectionComponent } from "@/engine/component-registry";
import { applySectionStyle } from "@/engine/style/apply";
import { SectionElementProvider } from "@/engine/element/EngineElement";
import type {
  DeviceBreakpoint,
  ElementKind,
} from "@/engine/element/types";
import { loadFontByFamily } from "@/engine/fonts/loader";
import type {
  PageContent,
  ResolvedTokens,
  SectionInstance,
  ThemeMeta,
} from "@/engine/types";
import {
  BUILDER_MESSAGE_NAMESPACE,
  unwrap,
  type BuilderToPreviewMessage,
  type PreviewToBuilderMessage,
  type Selection,
} from "@/builder/types";
import { cn } from "@/lib/utils";

interface Props {
  theme: ThemeMeta;
  overrides: Record<string, string> | null | undefined;
  initialPage: PageContent;
}

/**
 * The actual rendered page inside the builder iframe.
 *
 *  • Listens for UPDATE_PAGE / SELECT from the parent and re-renders without
 *    a reload.
 *  • Walks up from any click target to find the nearest `[data-jw-element]`
 *    — if found, posts ELEMENT_CLICK (element-level selection). Otherwise
 *    posts SECTION_CLICK (whole-section selection).
 *  • Highlights selection via SectionElementProvider → EngineElement.
 *  • On mount, signals PREVIEW_READY so the parent knows it can start pushing.
 */
export function BuilderRenderer({ theme, overrides, initialPage }: Props) {
  const [page, setPage] = useState<PageContent>(initialPage);
  const [selection, setSelection] = useState<Selection>(null);
  const [device, setDevice] = useState<DeviceBreakpoint>("desktop");

  const tokens = useMemo(
    () => mergeTokens(theme.tokens, overrides ?? null),
    [theme.tokens, overrides]
  );
  const cssVars = useMemo(
    () => generateCssVars(tokens) as CSSProperties,
    [tokens]
  );

  // ─── Inbound: listen for parent → preview messages ────────────────
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      // Same-origin requirement (defence in depth)
      if (e.origin !== window.location.origin) return;
      const msg = unwrap<BuilderToPreviewMessage>(e.data);
      if (!msg) return;

      switch (msg.kind) {
        case "UPDATE_PAGE":
          setPage(msg.page);
          setSelection(msg.selection);
          setDevice(msg.device);
          break;
        case "SELECT":
          setSelection(msg.selection);
          break;
        case "SET_DEVICE":
          setDevice(msg.device);
          break;
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // ─── Outbound: announce ready once mounted ────────────────────────
  useEffect(() => {
    postToParent({ kind: "PREVIEW_READY" });
  }, []);

  // ─── Font loading: scan elements for font_family and inject Google
  //     Fonts stylesheets into the IFRAME's document. The outer builder
  //     picker loads fonts in the parent doc; the iframe needs its own.
  useEffect(() => {
    for (const section of page.sections) {
      const elements = section.elements;
      if (!elements) continue;
      for (const style of Object.values(elements)) {
        const fam = primaryFamily(style?.font_family);
        if (fam) loadFontByFamily(fam);
      }
    }
  }, [page]);

  return (
    <div data-jw-engine={theme.slug} data-jw-builder="1" style={cssVars}>
      {page.sections.map((section) => (
        <BuilderSection
          key={section.id}
          section={section}
          tokens={tokens}
          selection={selection}
          device={device}
        />
      ))}
      {page.sections.length === 0 && <EmptyHint />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
function BuilderSection({
  section,
  tokens,
  selection,
  device,
}: {
  section: SectionInstance;
  tokens: ResolvedTokens;
  selection: Selection;
  device: DeviceBreakpoint;
}) {
  const Component = getSectionComponent(section.type);

  const isSectionSelected =
    selection?.kind === "section" && selection.sectionId === section.id;
  const isSectionTarget =
    selection?.kind === "section" || selection?.kind === "element";
  const selectedElementId =
    selection?.kind === "element" && selection.sectionId === section.id
      ? selection.elementId
      : null;

  // Walk up from event.target to find the nearest [data-jw-element] inside
  // this section. If found → element selection. Otherwise → section selection.
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const start = e.target as HTMLElement;
    const root = e.currentTarget;

    let cursor: HTMLElement | null = start;
    while (cursor && cursor !== root) {
      const el = cursor.getAttribute("data-jw-element");
      const kind = cursor.getAttribute("data-jw-element-kind") as ElementKind | null;
      if (el && kind) {
        postToParent({
          kind: "ELEMENT_CLICK",
          sectionId: section.id,
          elementId: el,
          elementKind: kind,
        });
        return;
      }
      cursor = cursor.parentElement;
    }

    // Click landed on the section itself (background / padding area)
    postToParent({ kind: "SECTION_CLICK", sectionId: section.id });
  };

  // Right-click → ask the outer builder to show a context menu. We send
  // iframe-local coordinates; the outer translates them to viewport coords.
  const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const start = e.target as HTMLElement;
    const root = e.currentTarget;

    let cursor: HTMLElement | null = start;
    while (cursor && cursor !== root) {
      const el = cursor.getAttribute("data-jw-element");
      const kind = cursor.getAttribute("data-jw-element-kind") as ElementKind | null;
      if (el && kind) {
        postToParent({
          kind: "CONTEXT_MENU",
          x: e.clientX,
          y: e.clientY,
          sectionId: section.id,
          elementId: el,
          elementKind: kind,
        });
        return;
      }
      cursor = cursor.parentElement;
    }

    postToParent({
      kind: "CONTEXT_MENU",
      x: e.clientX,
      y: e.clientY,
      sectionId: section.id,
    });
  };

  // Per-section style overrides — device-aware merge so paddings/colors
  // change live when the user flips between Desktop / Tablet / Mobile.
  const styleProps = useMemo(
    () => applySectionStyle(section.style, device),
    [section.style, device]
  );

  return (
    <div
      data-jw-section-id={section.id}
      data-jw-section-type={section.type}
      onClick={onClick}
      onContextMenu={onContextMenu}
      style={styleProps}
      className={cn(
        "group relative cursor-pointer outline outline-2 -outline-offset-2 transition-colors",
        isSectionSelected
          ? "outline-brand"
          : "outline-transparent hover:outline-brand/40"
      )}
    >
      {/* Floating tag so users see which section is which */}
      <span
        className={cn(
          "pointer-events-none absolute start-2 top-2 z-10 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-soft",
          isSectionSelected
            ? "bg-brand text-white"
            : "bg-white/85 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
        )}
      >
        {section.type}
        {isSectionTarget && selection?.kind === "element" && selectedElementId && (
          <span className="ms-1 opacity-80">› {selectedElementId}</span>
        )}
      </span>

      {Component ? (
        <SectionElementProvider
          sectionId={section.id}
          elements={section.elements ?? {}}
          builderMode
          selectedElementId={selectedElementId}
          device={device}
        >
          <Component
            settings={section.settings}
            tokens={tokens}
            sectionId={section.id}
          />
        </SectionElementProvider>
      ) : (
        <UnknownSection slug={section.type} />
      )}
    </div>
  );
}

function UnknownSection({ slug }: { slug: string }) {
  return (
    <div className="my-2 rounded-md border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
      Section <code className="font-mono">{slug}</code> is not registered.
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="mx-auto my-20 max-w-md rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <p className="text-sm text-foreground-soft">
        This page has no sections yet. Add one from the sidebar to start
        building.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
/** Pull the primary family out of a CSS font-family string for registry lookup. */
function primaryFamily(value: string | undefined | null): string | null {
  if (!value) return null;
  const first = value.split(",")[0].trim();
  return first.replace(/^['"]|['"]$/g, "");
}

function postToParent(msg: PreviewToBuilderMessage) {
  // Same-origin — using exact location.origin keeps the receiver happy
  if (window.parent !== window) {
    window.parent.postMessage(
      { ns: BUILDER_MESSAGE_NAMESPACE, payload: msg },
      window.location.origin
    );
  }
}
