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
import { cn } from "@/lib/utils";

interface Props {
  websiteId: number;
  pageSlug: string;
}

type Device = "desktop" | "tablet" | "mobile";
const DEVICE_WIDTHS: Record<Device, number | null> = {
  desktop: null,
  tablet: 820,
  mobile: 390,
};

export function BuilderCanvas({ websiteId, pageSlug }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [previewReady, setPreviewReady] = useState(false);

  const draft = useBuilderStore((s) => s.draft);
  const selectedSectionId = useBuilderStore((s) => s.selectedSectionId);
  const selectSection = useBuilderStore((s) => s.selectSection);

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
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [selectSection]);

  // Push UPDATE_PAGE whenever the draft changes (and the iframe is alive)
  useEffect(() => {
    if (!previewReady) return;
    postToIframe(iframeRef.current, {
      kind: "UPDATE_PAGE",
      page: draft,
      selectedSectionId,
    });
  }, [draft, selectedSectionId, previewReady]);

  // Also push selection-only changes (so clicking sidebar highlights iframe)
  useEffect(() => {
    if (!previewReady) return;
    postToIframe(iframeRef.current, {
      kind: "SELECT_SECTION",
      sectionId: selectedSectionId,
    });
  }, [selectedSectionId, previewReady]);

  const iframeWidth = DEVICE_WIDTHS[device];

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
    </div>
  );
}

function DeviceBtn({
  current,
  value,
  onChange,
  children,
}: {
  current: Device;
  value: Device;
  onChange: (d: Device) => void;
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
