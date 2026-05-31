import type { FieldConfig, FieldType, SelectOption } from "../field-types/types";

/**
 * Convert a section's `schema_json` (JSON-Schema-ish) into the FieldConfig
 * array the auto-form renderer can consume.
 *
 * Recognised JSON-Schema property shapes:
 *
 *   { type: "string" }                          → text
 *   { type: "string", maxLength > 200 }         → textarea
 *   { type: "string", format: "textarea" }      → textarea
 *   { type: "string", format: "color" }         → color
 *   { type: "string", format: "image" }         → image
 *   { type: "string", format: "uri"|"url" }     → url
 *   { type: "string", enum: [...] }             → select
 *   { type: "number"|"integer" }                → number
 *   { type: "boolean" }                         → boolean
 *
 * Name-based hints (when no `format`):
 *   id ends in "_image" or "image"              → image
 *   id ends in "_href" or "_url" or "url"       → url
 *   id ends in "_color" or "color"              → color
 */

interface JsonSchemaProperty {
  type?: string | string[];
  format?: string;
  enum?: unknown[];
  enumLabels?: Record<string, string>;
  title?: string;
  description?: string;
  default?: unknown;
  nullable?: boolean;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  placeholder?: string;
  /** For repeater fields (`type: "array"`). */
  items?: JsonSchemaRoot;
  minItems?: number;
  maxItems?: number;
  /** Repeater-only extras. */
  addLabel?: string;
  itemLabel?: string;
}

interface JsonSchemaRoot {
  type?: string;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  /** Optional explicit field display order — falls back to property insertion order. */
  fieldOrder?: string[];
}

export function schemaToFields(
  schemaJson: unknown,
  defaultSettings: Record<string, unknown> | null | undefined
): FieldConfig[] {
  const schema = schemaJson as JsonSchemaRoot | null;
  if (!schema || typeof schema !== "object") return [];

  const props = schema.properties ?? {};
  const requiredSet = new Set(schema.required ?? []);
  const order =
    schema.fieldOrder && schema.fieldOrder.length > 0
      ? schema.fieldOrder
      : Object.keys(props);

  const fields: FieldConfig[] = [];

  for (const id of order) {
    const prop = props[id];
    if (!prop) continue;

    const fieldType = inferFieldType(id, prop);
    const defaultValue =
      (defaultSettings && id in defaultSettings ? defaultSettings[id] : undefined) ??
      prop.default ??
      fallbackDefault(fieldType);

    const options =
      fieldType === "select" ? extractSelectOptions(prop) : undefined;

    // Recursive build for repeaters — itemFields is the FieldConfig[] of
    // ONE item's sub-form (the same renderer + Zod pipeline drives it).
    let itemFields: FieldConfig[] | undefined;
    let itemDefaults: Record<string, unknown> | undefined;
    if (fieldType === "repeater" && prop.items) {
      itemFields = schemaToFields(prop.items, undefined);
      itemDefaults = {};
      for (const sub of itemFields) {
        itemDefaults[sub.id] = sub.defaultValue;
      }
    }

    fields.push({
      id,
      type: fieldType,
      label: prop.title ?? humanise(id),
      required: requiredSet.has(id),
      placeholder: prop.placeholder,
      help: prop.description,
      minLength: prop.minLength,
      maxLength: prop.maxLength,
      min: prop.minimum ?? prop.minItems,
      max: prop.maximum ?? prop.maxItems,
      step: prop.multipleOf,
      options,
      defaultValue,
      nullable: prop.nullable === true,
      itemFields,
      itemDefaults,
      addLabel: prop.addLabel,
      itemLabel: prop.itemLabel,
    });
  }

  return fields;
}

// ─────────────────────────────────────────────────────────────────
function inferFieldType(id: string, prop: JsonSchemaProperty): FieldType {
  const lower = id.toLowerCase();
  const fmt = prop.format?.toLowerCase();
  const t = typeOf(prop.type);

  if (t === "boolean") return "boolean";
  if (t === "number" || t === "integer") return "number";

  // Array of objects → repeater (with its own sub-schema)
  if (t === "array" && prop.items && prop.items.properties) {
    return "repeater";
  }

  // string-y from here on
  if (Array.isArray(prop.enum) && prop.enum.length > 0) return "select";

  if (fmt === "color") return "color";
  if (fmt === "image") return "image";
  if (fmt === "url" || fmt === "uri") return "url";
  if (fmt === "textarea" || fmt === "multiline") return "textarea";

  // Name-based heuristics
  if (lower.endsWith("_image") || lower === "image" || lower.endsWith("_logo"))
    return "image";
  if (
    lower.endsWith("_href") ||
    lower.endsWith("_url") ||
    lower === "url" ||
    lower === "href" ||
    lower === "link"
  )
    return "url";
  if (lower.endsWith("_color") || lower === "color") return "color";

  if (prop.maxLength && prop.maxLength > 200) return "textarea";
  if (lower === "body" || lower === "content" || lower === "description")
    return "textarea";

  return "text";
}

function typeOf(t: string | string[] | undefined): string | undefined {
  if (Array.isArray(t)) return t.find((x) => x !== "null");
  return t;
}

function extractSelectOptions(prop: JsonSchemaProperty): SelectOption[] {
  const items = prop.enum ?? [];
  return items.map((raw) => {
    const value = String(raw);
    const label = prop.enumLabels?.[value] ?? humanise(value);
    return { value, label };
  });
}

function fallbackDefault(t: FieldType): unknown {
  switch (t) {
    case "boolean":
      return false;
    case "number":
      return 0;
    case "repeater":
      return [];
    default:
      return "";
  }
}

/** "hero_title" → "Hero title"; "alignment" → "Alignment". */
function humanise(s: string): string {
  return s
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[a-z]/, (c) => c.toUpperCase());
}
