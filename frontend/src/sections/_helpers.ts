import { z } from "zod";

/**
 * Section schema helpers — null-safe primitives.
 *
 * Why: stored content_json sometimes carries `null` where a string was
 * expected (older saves, RHF empty fields, PHP serialisation quirks).
 * Plain `z.string().default("")` rejects `null` because `.default()` only
 * handles `undefined`. These preprocess wrappers coerce `null` (and
 * `undefined`) to a sensible fallback before validation.
 *
 * Use these in every section's runtime Zod schema for fields that come
 * from user-editable content.
 */

export const nullSafeString = (fallback = "") =>
  z.preprocess(
    (v) => (v === null || v === undefined ? fallback : v),
    z.string()
  );

export const nullSafeNumber = (fallback = 0) =>
  z.preprocess(
    (v) => {
      if (v === null || v === undefined || v === "") return fallback;
      // Permit numeric strings from form widgets that submit as text.
      if (typeof v === "string") {
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
      }
      return v;
    },
    z.number()
  );

export const nullSafeBoolean = (fallback = false) =>
  z.preprocess(
    (v) => (v === null || v === undefined ? fallback : v),
    z.boolean()
  );

/** Returns a string or null — preserves `null` if explicitly set (used for
 *  image fields where `null` means "no image"). */
export const nullableString = z.preprocess(
  (v) => (v === undefined || v === "" ? null : v),
  z.union([z.string(), z.null()])
);
