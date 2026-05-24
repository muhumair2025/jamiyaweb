"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { generateCssVars, mergeTokens } from "@/engine/core/tokens";
import { getSectionComponent } from "@/engine/component-registry";
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
 *  • Listens for UPDATE_PAGE from the parent and re-renders without a reload.
 *  • Wraps each section with a click handler that posts SECTION_CLICK back
 *    so clicking on the canvas selects that section in the form panel.
 *  • Highlights the selected section with a brand-coloured outline.
 *  • On mount, signals PREVIEW_READY so the parent knows it can start pushing.
 */
export function BuilderRenderer({ theme, overrides, initialPage }: Props) {
  const [page, setPage] = useState<PageContent>(initialPage);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
          setSelectedId(msg.selectedSectionId);
          break;
        case "SELECT_SECTION":
          setSelectedId(msg.sectionId);
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

  return (
    <div
      data-jw-engine={theme.slug}
      data-jw-builder="1"
      style={cssVars}
    >
      {page.sections.map((section) => (
        <BuilderSection
          key={section.id}
          section={section}
          tokens={tokens}
          isSelected={section.id === selectedId}
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
  isSelected,
}: {
  section: SectionInstance;
  tokens: ResolvedTokens;
  isSelected: boolean;
}) {
  const Component = getSectionComponent(section.type);

  const onClick = (e: React.MouseEvent) => {
    // Intercept clicks so the in-section anchor/button doesn't navigate
    e.preventDefault();
    e.stopPropagation();
    postToParent({ kind: "SECTION_CLICK", sectionId: section.id });
  };

  return (
    <div
      data-jw-section-id={section.id}
      data-jw-section-type={section.type}
      onClick={onClick}
      className={cn(
        "relative cursor-pointer outline outline-2 -outline-offset-2 transition-colors",
        isSelected ? "outline-brand" : "outline-transparent hover:outline-brand/40"
      )}
    >
      {/* Floating tag so users see which section is which */}
      <span
        className={cn(
          "pointer-events-none absolute start-2 top-2 z-10 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-soft",
          isSelected
            ? "bg-brand text-white"
            : "bg-white/85 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
        )}
      >
        {section.type}
      </span>

      {Component ? (
        <Component
          settings={section.settings}
          tokens={tokens}
          sectionId={section.id}
        />
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
function postToParent(msg: PreviewToBuilderMessage) {
  // Same-origin — using exact location.origin keeps the receiver happy
  if (window.parent !== window) {
    window.parent.postMessage(
      { ns: BUILDER_MESSAGE_NAMESPACE, payload: msg },
      window.location.origin
    );
  }
}

