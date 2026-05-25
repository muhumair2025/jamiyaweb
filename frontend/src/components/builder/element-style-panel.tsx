"use client";

import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import {
  KIND_FIELDS,
  type ElementKind,
  type ElementStyle,
} from "@/engine/element/types";
import { useBuilderStore } from "@/builder/store";
import {
  ImageStyleField,
  PercentSliderField,
  SegmentField,
  SelectStyleField,
  StyleColorField,
  UnitInputField,
} from "./style-widgets";
import { FontPickerField } from "./font-picker";

interface Props {
  sectionId: string;
  elementId: string;
  elementKind: ElementKind;
  style: ElementStyle | undefined;
}

/**
 * Per-element style editor (Elementor-class). Renders ONLY the controls
 * relevant to the element's kind — `KIND_FIELDS[kind]` decides which.
 * Writes back to the builder store via `updateElementStyle` so the iframe
 * re-renders immediately.
 */
export function ElementStylePanel({
  sectionId,
  elementId,
  elementKind,
  style,
}: Props) {
  const updateElementStyle = useBuilderStore((s) => s.updateElementStyle);
  const allowed = new Set(KIND_FIELDS[elementKind]);

  const s = style ?? {};

  const setKey = <K extends keyof ElementStyle>(
    key: K,
    value: ElementStyle[K] | undefined
  ) => {
    const next: ElementStyle = { ...style };
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value === "")
    ) {
      delete next[key];
    } else {
      next[key] = value;
    }
    updateElementStyle(sectionId, elementId, next);
  };

  return (
    <div className="space-y-6">
      {/* ── TYPOGRAPHY ── (text, heading, button) ── */}
      {(allowed.has("color") ||
        allowed.has("font_size") ||
        allowed.has("font_weight") ||
        allowed.has("font_family")) && (
        <Group label="Typography">
          {allowed.has("font_family") && (
            <FontPickerField
              label="Font family"
              hint="Pick any Google Font. Loads on demand."
              value={s.font_family}
              onChange={(v) => setKey("font_family", v)}
            />
          )}
          {allowed.has("color") && (
            <StyleColorField
              label="Colour"
              value={s.color}
              onChange={(v) => setKey("color", v)}
            />
          )}
          {allowed.has("font_size") && (
            <UnitInputField
              label="Font size"
              hint="Drag the slider or type a value."
              value={s.font_size}
              onChange={(v) => setKey("font_size", v)}
              units={["px", "rem", "em", "%"]}
              ranges={{ px: { min: 0, max: 120, step: 1 }, rem: { min: 0, max: 8, step: 0.05 } }}
            />
          )}
          {allowed.has("font_weight") && (
            <SelectStyleField
              label="Font weight"
              options={WEIGHT_OPTIONS}
              value={s.font_weight}
              onChange={(v) => setKey("font_weight", v)}
            />
          )}
          {allowed.has("line_height") && (
            <UnitInputField
              label="Line height"
              hint="Unitless multiplies font-size (e.g. 1.4)."
              value={s.line_height}
              onChange={(v) => setKey("line_height", v)}
              units={["", "px", "rem", "em"]}
              ranges={{ "": { min: 0.8, max: 3, step: 0.05 } }}
            />
          )}
          {allowed.has("letter_spacing") && (
            <UnitInputField
              label="Letter spacing"
              value={s.letter_spacing}
              onChange={(v) => setKey("letter_spacing", v)}
              units={["em", "px", "rem"]}
              ranges={{ em: { min: -0.2, max: 0.5, step: 0.01 }, px: { min: -10, max: 30, step: 0.5 } }}
            />
          )}
          {allowed.has("text_align") && (
            <SegmentField
              label="Text align"
              options={ALIGN_OPTIONS}
              value={s.text_align}
              onChange={(v) => setKey("text_align", v)}
            />
          )}
          {allowed.has("text_transform") && (
            <SelectStyleField
              label="Text transform"
              options={TRANSFORM_OPTIONS}
              value={s.text_transform}
              onChange={(v) => setKey("text_transform", v)}
            />
          )}
        </Group>
      )}

      {/* ── BOX / BUTTON / CONTAINER ── */}
      {(allowed.has("bg_color") ||
        allowed.has("padding_x") ||
        allowed.has("border_radius")) && (
        <Group label="Box">
          {allowed.has("bg_color") && (
            <StyleColorField
              label="Background colour"
              value={s.bg_color}
              onChange={(v) => setKey("bg_color", v)}
            />
          )}
          {allowed.has("padding_x") && (
            <UnitInputField
              label="Horizontal padding"
              value={s.padding_x}
              onChange={(v) => setKey("padding_x", v)}
              units={["px", "rem", "em", "%"]}
              ranges={{ px: { min: 0, max: 200, step: 1 }, rem: { min: 0, max: 8, step: 0.1 } }}
            />
          )}
          {allowed.has("padding_y") && (
            <UnitInputField
              label="Vertical padding"
              value={s.padding_y}
              onChange={(v) => setKey("padding_y", v)}
              units={["px", "rem", "em", "%"]}
              ranges={{ px: { min: 0, max: 200, step: 1 }, rem: { min: 0, max: 8, step: 0.1 } }}
            />
          )}
          {allowed.has("border_radius") && (
            <UnitInputField
              label="Border radius"
              value={s.border_radius}
              onChange={(v) => setKey("border_radius", v)}
              units={["px", "rem", "%"]}
              ranges={{ px: { min: 0, max: 100, step: 1 }, rem: { min: 0, max: 4, step: 0.05 } }}
            />
          )}
          {allowed.has("border_width") && (
            <UnitInputField
              label="Border width"
              value={s.border_width}
              onChange={(v) => setKey("border_width", v)}
              units={["px", "rem"]}
              ranges={{ px: { min: 0, max: 20, step: 1 } }}
            />
          )}
          {allowed.has("border_color") && (
            <StyleColorField
              label="Border colour"
              value={s.border_color}
              onChange={(v) => setKey("border_color", v)}
            />
          )}
          {allowed.has("shadow") && (
            <SelectStyleField
              label="Shadow"
              options={SHADOW_OPTIONS}
              value={s.shadow}
              onChange={(v) => setKey("shadow", v)}
            />
          )}
          {allowed.has("gap") && (
            <UnitInputField
              label="Gap"
              value={s.gap}
              onChange={(v) => setKey("gap", v)}
              units={["px", "rem", "em"]}
              ranges={{ px: { min: 0, max: 80, step: 1 }, rem: { min: 0, max: 6, step: 0.1 } }}
            />
          )}
        </Group>
      )}

      {/* ── SIZE (width, height, max-width) ── */}
      {(allowed.has("width") ||
        allowed.has("height") ||
        allowed.has("max_width")) && (
        <Group label="Size">
          {allowed.has("width") && (
            <UnitInputField
              label="Width"
              value={s.width}
              onChange={(v) => setKey("width", v)}
              units={["px", "%", "rem", "vw"]}
              ranges={{ px: { min: 0, max: 1200, step: 1 }, "%": { min: 0, max: 100, step: 1 } }}
            />
          )}
          {allowed.has("height") && (
            <UnitInputField
              label="Height"
              value={s.height}
              onChange={(v) => setKey("height", v)}
              units={["px", "%", "rem", "vh"]}
              ranges={{ px: { min: 0, max: 1200, step: 1 }, "%": { min: 0, max: 100, step: 1 } }}
            />
          )}
          {allowed.has("max_width") && (
            <UnitInputField
              label="Max width"
              value={s.max_width}
              onChange={(v) => setKey("max_width", v)}
              units={["px", "rem", "%", "vw"]}
              ranges={{ px: { min: 0, max: 1600, step: 10 }, rem: { min: 0, max: 100, step: 1 } }}
            />
          )}
        </Group>
      )}

      {/* ── IMAGE specifics ── */}
      {(allowed.has("object_fit") || allowed.has("opacity")) && (
        <Group label="Image">
          {allowed.has("object_fit") && (
            <SelectStyleField
              label="Object fit"
              options={FIT_OPTIONS}
              value={s.object_fit}
              onChange={(v) => setKey("object_fit", v)}
            />
          )}
          {allowed.has("opacity") && (
            <PercentSliderField
              label="Opacity"
              value={s.opacity}
              onChange={(v) => setKey("opacity", v)}
            />
          )}
        </Group>
      )}

      {/* ── ICON ── */}
      {allowed.has("size") && (
        <Group label="Icon">
          <UnitInputField
            label="Size"
            value={s.size}
            onChange={(v) => setKey("size", v)}
            units={["px", "rem", "em"]}
            ranges={{ px: { min: 8, max: 200, step: 1 }, rem: { min: 0.5, max: 8, step: 0.1 } }}
          />
        </Group>
      )}

      {/* ── BACKGROUND (section bg layer) ── */}
      {(allowed.has("bg_image") || allowed.has("overlay_color")) && (
        <Group label="Background">
          {allowed.has("bg_image") && (
            <ImageStyleField
              label="Background image"
              hint="Pick from your media library, upload new, or paste a URL."
              value={s.bg_image}
              onChange={(v) => setKey("bg_image", v)}
            />
          )}
          {allowed.has("bg_position") && (
            <SelectStyleField
              label="Position"
              options={POSITION_OPTIONS}
              value={s.bg_position}
              onChange={(v) => setKey("bg_position", v)}
            />
          )}
          {allowed.has("bg_size") && (
            <SelectStyleField
              label="Size"
              options={BG_SIZE_OPTIONS}
              value={s.bg_size}
              onChange={(v) => setKey("bg_size", v)}
            />
          )}
          {allowed.has("overlay_color") && (
            <StyleColorField
              label="Overlay colour"
              value={s.overlay_color}
              onChange={(v) => setKey("overlay_color", v)}
            />
          )}
          {allowed.has("overlay_opacity") && (
            <PercentSliderField
              label="Overlay opacity"
              hint="0% is transparent, 100% fully hides the background."
              value={s.overlay_opacity}
              onChange={(v) => setKey("overlay_opacity", v)}
            />
          )}
        </Group>
      )}

      {/* ── SPACING + ALIGN SELF (universal) ── */}
      {(allowed.has("margin_top") ||
        allowed.has("margin_bottom") ||
        allowed.has("align_self")) && (
        <Group label="Spacing">
          {allowed.has("align_self") && (
            <SegmentField
              label="Align self"
              hint="How this element sits inside its parent box."
              options={ALIGN_SELF_OPTIONS}
              value={s.align_self}
              onChange={(v) => setKey("align_self", v)}
            />
          )}
          {allowed.has("margin_top") && (
            <UnitInputField
              label="Margin top"
              value={s.margin_top}
              onChange={(v) => setKey("margin_top", v)}
              units={["px", "rem", "em", "%"]}
              ranges={{ px: { min: -200, max: 200, step: 1 }, rem: { min: -6, max: 6, step: 0.1 } }}
            />
          )}
          {allowed.has("margin_bottom") && (
            <UnitInputField
              label="Margin bottom"
              value={s.margin_bottom}
              onChange={(v) => setKey("margin_bottom", v)}
              units={["px", "rem", "em", "%"]}
              ranges={{ px: { min: -200, max: 200, step: 1 }, rem: { min: -6, max: 6, step: 0.1 } }}
            />
          )}
        </Group>
      )}

      {/* ── VISIBILITY ── */}
      {allowed.has("hidden") && (
        <Group label="Visibility">
          <SegmentField
            label="Show on page"
            options={VISIBILITY_OPTIONS}
            value={s.hidden === true ? "off" : "on"}
            onChange={(v) =>
              setKey("hidden", v === "off" ? true : undefined)
            }
          />
        </Group>
      )}
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

// Options arrays must declare their generic explicitly so SelectStyleField<T>
// narrows to the discriminated union it expects.
type TextTransformValue = NonNullable<ElementStyle["text_transform"]>;
type ShadowValue = NonNullable<ElementStyle["shadow"]>;
type ObjectFitValue = NonNullable<ElementStyle["object_fit"]>;
type BgPositionValue = NonNullable<ElementStyle["bg_position"]>;
type BgSizeValue = NonNullable<ElementStyle["bg_size"]>;

const WEIGHT_OPTIONS: { value: string; label: string }[] = [
  { value: "300", label: "Light (300)" },
  { value: "400", label: "Regular (400)" },
  { value: "500", label: "Medium (500)" },
  { value: "600", label: "Semibold (600)" },
  { value: "700", label: "Bold (700)" },
  { value: "800", label: "ExtraBold (800)" },
  { value: "900", label: "Black (900)" },
];

const TRANSFORM_OPTIONS: { value: TextTransformValue; label: string }[] = [
  { value: "none", label: "None" },
  { value: "uppercase", label: "UPPERCASE" },
  { value: "lowercase", label: "lowercase" },
  { value: "capitalize", label: "Capitalize" },
];

const SHADOW_OPTIONS: { value: ShadowValue; label: string }[] = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
];

const FIT_OPTIONS: { value: ObjectFitValue; label: string }[] = [
  { value: "cover", label: "Cover (fill, crop)" },
  { value: "contain", label: "Contain (fit, letterbox)" },
  { value: "fill", label: "Fill (stretch)" },
  { value: "scale-down", label: "Scale down" },
  { value: "none", label: "None" },
];

const POSITION_OPTIONS: { value: BgPositionValue; label: string }[] = [
  { value: "center", label: "Center" },
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

const BG_SIZE_OPTIONS: { value: BgSizeValue; label: string }[] = [
  { value: "cover", label: "Cover" },
  { value: "contain", label: "Contain" },
  { value: "auto", label: "Auto" },
];

const VISIBILITY_OPTIONS = [
  { value: "on" as const, label: "Visible" },
  { value: "off" as const, label: "Hidden" },
];

type AlignSelfValue = NonNullable<ElementStyle["align_self"]>;
const ALIGN_SELF_OPTIONS: { value: AlignSelfValue; label: string; icon?: React.ReactNode }[] = [
  { value: "auto", label: "Auto" },
  {
    value: "start",
    label: "",
    icon: <AlignLeft className="h-3.5 w-3.5 rtl:rotate-180" />,
  },
  {
    value: "center",
    label: "",
    icon: <AlignCenter className="h-3.5 w-3.5" />,
  },
  {
    value: "end",
    label: "",
    icon: <AlignRight className="h-3.5 w-3.5 rtl:rotate-180" />,
  },
  { value: "stretch", label: "Stretch" },
];
