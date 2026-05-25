"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Monitor, Smartphone, Tablet } from "lucide-react";
import { useBuilderStore } from "@/builder/store";
import {
  BUILDER_MESSAGE_NAMESPACE,
  unwrap,
  type BuilderToPreviewMessage,
  type PreviewToBuilderMessage,
} from "@/builder/types";
import { DEVICE_IFRAME_WIDTHS } from "@/engine/element/apply";
import type { DeviceBreakpoint } from "@/engine/element/types";
import { cn } from "@/lib/utils";
import {
  BuilderContextMenu,
  type ContextMenuTarget,
} from "./builder-context-menu";

interface Props {
  websiteId: number;
  pageSlug: string;
}

export function BuilderCanvas({ websiteId, pageSlug }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuTarget | null>(null);

  const draft = useBuilderStore((s) => s.draft);
  const selection = useBuilderStore((s) => s.selection);
  const device = useBuilderStore((s) => s.device);
  const setDevice = useBuilderStore((s) => s.setDevice);
  const selectSection = useBuilderStore((s) => s.selectSection);
  const selectElement = useBuilderStore((s) => s.selectElement);

  // Listen for messages FROM the iframe
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const msg = unwrap<PreviewToBuilderMessage>(e.data);
      if (!msg) return;

      switch (msg.kind) {
        case "PREVIEW_READY":
          setPreviewReady(true);
          break;
        case "SECTION_CLICK":
          selectSection(msg.sectionId);
          break;
        case "ELEMENT_CLICK":
          selectElement(msg.sectionId, msg.elementId, msg.elementKind);
          break;
        case "CONTEXT_MENU": {
          // Translate iframe-local coords → viewport coords. Also bring the
          // section/element into selection so the menu is contextually
          // correct (the copy/paste/hide actions read from selection).
          if (msg.elementId && msg.elementKind) {
            selectElement(msg.sectionId, msg.elementId, msg.elementKind);
          } else {
            selectSection(msg.sectionId);
          }
          const rect = iframeRef.current?.getBoundingClientRect();
          if (!rect) return;
          setContextMenu({
            x: rect.left + msg.x,
            y: rect.top + msg.y,
            sectionId: msg.sectionId,
            elementId: msg.elementId,
            elementKind: msg.elementKind,
          });
          break;
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [selectSection, selectElement]);

  // Push UPDATE_PAGE whenever the draft changes (and the iframe is alive)
  useEffect(() => {
    if (!previewReady) return;
    postToIframe(iframeRef.current, {
      kind: "UPDATE_PAGE",
      page: draft,
      selection,
      device,
    });
  }, [draft, selection, device, previewReady]);

  // Also push selection-only changes (so clicking sidebar highlights iframe)
  useEffect(() => {
    if (!previewReady) return;
    postToIframe(iframeRef.current, { kind: "SELECT", selection });
  }, [selection, previewReady]);

  // Push device changes (so the iframe re-merges styles for the new viewport)
  useEffect(() => {
    if (!previewReady) return;
    postToIframe(iframeRef.current, { kind: "SET_DEVICE", device });
  }, [device, previewReady]);

  const iframeWidth = DEVICE_IFRAME_WIDTHS[device];

  return (
    <div className="flex h-full flex-col bg-paper">
      {/* Device switcher */}
      <div className="flex h-10 items-center justify-center gap-1 border-b border-border bg-surface">
        <DeviceBtn current={device} value="desktop" onChange={setDevice}>
          <Monitor className="h-3.5 w-3.5" /> Desktop
        </DeviceBtn>
        <DeviceBtn current={device} value="tablet" onChange={setDevice}>
          <Tablet className="h-3.5 w-3.5" /> Tablet
        </DeviceBtn>
        <DeviceBtn current={device} value="mobile" onChange={setDevice}>
          <Smartphone className="h-3.5 w-3.5" /> Mobile
        </DeviceBtn>
      </div>

      {/* Iframe canvas */}
      <div className="relative flex flex-1 items-stretch justify-center overflow-auto p-4">
        {!previewReady && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-paper/80 backdrop-blur-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-foreground-soft shadow-soft">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading preview…
            </div>
          </div>
        )}

        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-border bg-white shadow-card",
            iframeWidth ? "h-full" : "h-full w-full"
          )}
          style={iframeWidth ? { width: `${iframeWidth}px` } : undefined}
        >
          <iframe
            ref={iframeRef}
            title="Builder preview"
            src={`/builder-preview/${websiteId}/${pageSlug}`}
            className="h-full w-full"
          />
        </div>
      </div>

      {contextMenu && (
        <BuilderContextMenu
          target={contextMenu}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

function DeviceBtn({
  current,
  value,
  onChange,
  children,
}: {
  current: DeviceBreakpoint;
  value: DeviceBreakpoint;
  onChange: (d: DeviceBreakpoint) => void;
  children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-foreground-soft hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}

function postToIframe(
  iframe: HTMLIFrameElement | null,
  msg: BuilderToPreviewMessage
) {
  if (!iframe || !iframe.contentWindow) return;
  iframe.contentWindow.postMessage(
    { ns: BUILDER_MESSAGE_NAMESPACE, payload: msg },
    window.location.origin
  );
}
