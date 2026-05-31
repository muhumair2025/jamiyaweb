import { z, type ZodTypeAny } from "zod";
import type { FieldConfig } from "../field-types/types";

/**
 * Build a runtime Zod object schema from a FieldConfig[].
 * Used as the React Hook Form resolver — so submit is blocked while any
 * field fails validation, and per-field error messages flow to the widgets.
 */
export function fieldsToZodSchema(fields: FieldConfig[]) {
  const shape: Record<string, ZodTypeAny> = {};
  for (const f of fields) {
    shape[f.id] = buildFieldSchema(f);
  }
  return z.object(shape);
}

function buildFieldSchema(f: FieldConfig): ZodTypeAny {
  switch (f.type) {
    case "boolean":
      return z.boolean();

    case "number": {
      let s = z.number();
      if (f.min !== undefined) s = s.min(f.min);
      if (f.max !== undefined) s = s.max(f.max);
      // Required numbers always coerce; optional become nullable
      if (!f.required) {
        // Allow undefined/empty → cast to 0 isn't right; use nullable
        return s.nullable().optional();
      }
      return s;
    }

    case "repeater": {
      // Each item is the same shape as a sub-form; build it recursively.
      const subFields = f.itemFields ?? [];
      const itemShape: Record<string, ZodTypeAny> = {};
      for (const sub of subFields) {
        itemShape[sub.id] = buildFieldSchema(sub);
      }
      let arr: ZodTypeAny = z.array(z.object(itemShape));
      if (f.min !== undefined && f.min > 0) {
        // Cast through `unknown` because Zod's chained-method types narrow
        // in a way that doesn't survive the recursive cast above.
        arr = (arr as z.ZodArray<z.ZodTypeAny>).min(f.min);
      }
      if (f.max !== undefined) {
        arr = (arr as z.ZodArray<z.ZodTypeAny>).max(f.max);
      }
      return f.required ? arr : arr.optional();
    }

    case "select": {
      const values = f.options?.map((o) => o.value) ?? [];
      if (values.length === 0) {
        return f.required ? z.string().min(1) : z.string().optional();
      }
      const literals = z.enum(values as [string, ...string[]]);
      return f.required ? literals : literals.optional();
    }

    case "image": {
      // Image fields store either a plain URL string (legacy) or the rich
      // `{ url, fit?, position?, overlay_color?, overlay_opacity? }` object
      // emitted by ImageField once the user touches an option control. Accept
      // both — resolveImage() at render time normalises them.
      const imageObject = z.object({
        url: z.string(),
        fit: z
          .enum(["cover", "contain", "fill", "scale-down", "none"])
          .optional(),
        position: z
          .enum([
            "center",
            "top",
            "bottom",
            "left",
            "right",
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ])
          .optional(),
        overlay_color: z.string().nullable().optional(),
        overlay_opacity: z.number().min(0).max(1).optional(),
      });
      if (f.required) {
        return z.union([
          z.string().min(1, { message: `${f.label} is required` }),
          imageObject,
        ]);
      }
      if (f.nullable) {
        return z
          .union([z.string(), imageObject, z.null()])
          .optional();
      }
      return z.union([z.string(), imageObject]).optional();
    }

    case "color":
    case "url":
    case "text":
    case "textarea":
    default: {
      let s = z.string();
      if (f.minLength !== undefined) s = s.min(f.minLength);
      if (f.maxLength !== undefined) s = s.max(f.maxLength);

      // URL extra validation — but allow empty when not required
      if (f.type === "url" && f.required) {
        s = s.url();
      }

      if (f.required) {
        return s.min(Math.max(f.minLength ?? 1, 1), {
          message: `${f.label} is required`,
        });
      }

      // Optional strings: empty string is fine
      if (f.nullable) {
        return s.nullable().optional();
      }
      return s.optional().or(z.literal(""));
    }
  }
}

/**
 * Build the default-values object React Hook Form expects, drawing from each
 * field's `defaultValue` (already populated by `schemaToFields`).
 */
export function fieldsToDefaultValues(
  fields: FieldConfig[]
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    out[f.id] = f.defaultValue;
  }
  return out;
}
