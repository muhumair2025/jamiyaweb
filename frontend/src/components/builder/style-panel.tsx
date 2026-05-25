"use client";

import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import type { SectionStyle } from "@/engine";
import { useBuilderStore } from "@/builder/store";
import {
  SegmentField,
  StyleColorField,
  UnitInputField,
} from "./style-widgets";

interface Props {
  sectionId: string;
  style: SectionStyle | undefined;
}

/**
 * Per-section style editor — grouped into Spacing, Background, Typography
 * and Layout. Writes back to the builder store via `updateSectionStyle`
 * so the preview iframe re-renders immediately.
 */
export function StylePanel({ sectionId, style }: Props) {
  const updateStyle = useBuilderStore((s) => s.updateSectionStyle);

  const setKey = <K extends keyof SectionStyle>(
    key: K,
    value: SectionStyle[K] | undefined
  ) => {
    const next: SectionStyle = { ...style };
    if (value === undefined || value === null || value === "") {
      delete next[key];
    } else {
      next[key] = value;
    }
    updateStyle(sectionId, next);
  };

  const s = style ?? {};

  return (
    <div className="space-y-6">
      {/* ── SPACING ── */}
      <Group label="Spacing">
        <UnitInputField
          label="Padding top"
          value={s.padding_top}
          onChange={(v) => setKey("padding_top", v)}
          units={["px", "rem", "em", "%"]}
          ranges={{ px: { min: 0, max: 400, step: 1 }, rem: { min: 0, max: 16, step: 0.25 } }}
        />
        <UnitInputField
          label="Padding bottom"
          value={s.padding_bottom}
          onChange={(v) => setKey("padding_bottom", v)}
          units={["px", "rem", "em", "%"]}
          ranges={{ px: { min: 0, max: 400, step: 1 }, rem: { min: 0, max: 16, step: 0.25 } }}
        />
        <UnitInputField
          label="Horizontal padding"
          value={s.padding_x}
          onChange={(v) => setKey("padding_x", v)}
          units={["px", "rem", "em", "%"]}
          ranges={{ px: { min: 0, max: 200, step: 1 }, rem: { min: 0, max: 8, step: 0.25 } }}
        />
      </Group>

      {/* ── BACKGROUND ── */}
      <Group label="Background">
        <StyleColorField
          label="Background colour"
          hint="Leave empty to inherit from theme tokens."
          value={s.bg_color}
          onChange={(v) => setKey("bg_color", v)}
        />
      </Group>

      {/* ── TEXT & TYPOGRAPHY ── */}
      <Group label="Text & typography">
        <StyleColorField
          label="Text colour"
          value={s.text_color}
          onChange={(v) => setKey("text_color", v)}
        />
        <StyleColorField
          label="Heading colour"
          value={s.heading_color}
          onChange={(v) => setKey("heading_color", v)}
        />
        <SegmentField
          label="Heading size"
          options={SIZE_OPTIONS}
          value={s.heading_size}
          onChange={(v) => setKey("heading_size", v)}
        />
        <SegmentField
          label="Body size"
          options={BODY_OPTIONS}
          value={s.body_size}
          onChange={(v) => setKey("body_size", v)}
        />
      </Group>

      {/* ── LAYOUT ── */}
      <Group label="Layout">
        <SegmentField
          label="Alignment"
          options={ALIGN_OPTIONS}
          value={s.align}
          onChange={(v) => setKey("align", v)}
        />
        <SegmentField
          label="Max width"
          options={MAX_WIDTH_OPTIONS}
          value={s.max_width}
          onChange={(v) => setKey("max_width", v)}
        />
        <UnitInputField
          label="Corner radius"
          value={s.radius}
          onChange={(v) => setKey("radius", v)}
          units={["px", "rem", "%"]}
          ranges={{ px: { min: 0, max: 80, step: 1 }, rem: { min: 0, max: 4, step: 0.05 } }}
        />
      </Group>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </legend>
      {children}
    </fieldset>
  );
}

// ─── Option presets ──────────────────────────────────────────────
const SIZE_OPTIONS = [
  { value: "xs" as const, label: "XS" },
  { value: "sm" as const, label: "SM" },
  { value: "md" as const, label: "MD" },
  { value: "lg" as const, label: "LG" },
  { value: "xl" as const, label: "XL" },
];

const BODY_OPTIONS = [
  { value: "sm" as const, label: "SM" },
  { value: "md" as const, label: "MD" },
  { value: "lg" as const, label: "LG" },
];

const ALIGN_OPTIONS = [
  {
    value: "start" as const,
    label: "",
    icon: <AlignLeft className="h-3.5 w-3.5 rtl:rotate-180" />,
  },
  {
    value: "center" as const,
    label: "",
    icon: <AlignCenter className="h-3.5 w-3.5" />,
  },
  {
    value: "end" as const,
    label: "",
    icon: <AlignRight className="h-3.5 w-3.5 rtl:rotate-180" />,
  },
];

const MAX_WIDTH_OPTIONS = [
  { value: "sm" as const, label: "SM" },
  { value: "md" as const, label: "MD" },
  { value: "lg" as const, label: "LG" },
  { value: "xl" as const, label: "XL" },
  { value: "full" as const, label: "Full" },
];
