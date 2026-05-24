import type {
  ResolvedTokens,
  TokensDefinition,
} from "../types";

/**
 * Resolve a theme's tokens to a flat key→value map, applying website overrides
 * on top of the theme's defaults.
 *
 *   themeTokens = { "color.primary": { type: "color", default: "#20665c" }, … }
 *   overrides   = { "color.primary": "#1a544b" }
 *   → { "color.primary": "#1a544b", "color.accent": "#c18f2c", … }
 *
 * Unknown override keys are ignored (the engine never silently adds
 * undeclared tokens — they wouldn't render anything anyway).
 */
export function mergeTokens(
  themeTokens: TokensDefinition,
  overrides: Record<string, string> | null | undefined
): ResolvedTokens {
  const out: ResolvedTokens = {};

  for (const [key, def] of Object.entries(themeTokens)) {
    out[key] = def.default;
  }

  if (overrides) {
    for (const [key, value] of Object.entries(overrides)) {
      if (key in out && typeof value === "string" && value !== "") {
        out[key] = value;
      }
    }
  }

  return out;
}

/**
 * Convert a resolved tokens map to a CSS variable object you can spread onto
 * an element's `style` prop. All variables are namespaced with `--jw-`.
 *
 *   { "color.primary": "#20665c" } → { "--jw-color-primary": "#20665c" }
 *
 * Section components read these via `style={{ background: "var(--jw-color-primary)" }}`.
 */
export function generateCssVars(
  tokens: ResolvedTokens
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens)) {
    vars[toCssVarName(key)] = value;
  }
  return vars;
}

/** Convenience: full CSS var name for a given token key. */
export function tokenVar(key: string): string {
  return `var(${toCssVarName(key)})`;
}

function toCssVarName(key: string): string {
  // "color.primary" → "--jw-color-primary"
  // "font.heading" → "--jw-font-heading"
  return `--jw-${key.replace(/[._/]/g, "-").toLowerCase()}`;
}
