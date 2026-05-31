/**
 * The internal field config used by the auto-form renderer.
 * Derived from a section's `schema_json` via `schemaToFields()`.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "number"
  | "boolean"
  | "color"
  | "image"
  | "select"
  | "repeater";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  /** Property key in the section's settings object (e.g. "title"). */
  id: string;
  /** Resolved widget type — drives the registry lookup. */
  type: FieldType;
  /** Display label shown above the input. */
  label: string;
  /** Whether the form should reject submit when this is empty. */
  required: boolean;
  /** Optional placeholder text. */
  placeholder?: string;
  /** Optional helper hint shown below the input. */
  help?: string;
  /** Per-type constraints (validation + rendering). */
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  /** Only set for `select`. */
  options?: SelectOption[];
  /** The section's default value for this field. */
  defaultValue: unknown;
  /** Whether null is an acceptable value (impacts Zod resolver). */
  nullable?: boolean;

  // ─── Repeater-only ────────────────────────────────────────────────
  /** Field configs for ONE item inside the repeater (a sub-form). */
  itemFields?: FieldConfig[];
  /** Optional template for the "Add item" button — defaults to `Add ${label}`. */
  addLabel?: string;
  /** Optional title shown on each collapsed item card — supports `{index}` and
   *  `{<field-id>}` substitutions, e.g. "Program {index}: {title}". */
  itemLabel?: string;
  /** Per-item defaults used when adding a new item; falls back to deriving
   *  from `itemFields[].defaultValue`. */
  itemDefaults?: Record<string, unknown>;
}

/**
 * Props passed to every field widget by the auto-form renderer.
 * Widgets pull form state from React Hook Form's `useFormContext`.
 */
export interface FieldWidgetProps {
  config: FieldConfig;
}
