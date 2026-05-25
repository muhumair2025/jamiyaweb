/**
 * Shared engine types — kept hand-written (not derived from Zod) so they are
 * stable across schema iterations and easy to import from anywhere.
 */

// ─── Page content ─────────────────────────────────────────────────
import type { SectionStyle } from "./style/types";
import type { SectionElements } from "./element/types";

export interface SectionInstance {
  /** UUID generated when the section was first added to the page. */
  id: string;
  /** Section slug — must match a `Section.slug` in the database. */
  type: string;
  /** Free-form settings object, validated by the section's own schema. */
  settings: Record<string, unknown>;
  /** Optional engine-managed style overrides applied to the whole section. */
  style?: SectionStyle;
  /** Optional per-element style overrides (Elementor-style). */
  elements?: SectionElements;
}

export interface PageContent {
  sections: SectionInstance[];
}

// ─── Theme tokens ─────────────────────────────────────────────────
export type TokenType = "color" | "font" | "size";

export interface ColorTokenDef {
  type: "color";
  default: string;
  label?: string;
}

export interface FontTokenDef {
  type: "font";
  default: string;
  label?: string;
}

export interface SizeTokenDef {
  type: "size";
  default: string;
  min?: string;
  max?: string;
  label?: string;
}

export type TokenDefinition = ColorTokenDef | FontTokenDef | SizeTokenDef;

/** A theme's `tokens.json` — a map of token key (e.g. "color.primary") to its definition. */
export type TokensDefinition = Record<string, TokenDefinition>;

/** A flat map of token key → resolved value (e.g. "color.primary" → "#20665c"). */
export type ResolvedTokens = Record<string, string>;

// ─── Theme manifest ───────────────────────────────────────────────
export interface ThemeManifest {
  id: string;
  name: string;
  version: string;
  /** Semver range — engine must satisfy this to render the theme. */
  engine: string;
  supported_types: string[];
  default_pages?: string[];
}

// ─── Section metadata (as returned by /api/sections) ──────────────
export interface SectionMeta {
  slug: string;
  name: string;
  version: string;
  category: string | null;
  icon: string | null;
  preview_url: string | null;
  /** JSON-Schema-ish object describing the shape of `settings`. */
  schema: Record<string, unknown>;
  default_settings: Record<string, unknown>;
}

// ─── Theme metadata (as returned by /api/themes) ──────────────────
export interface ThemeSectionRef {
  slug: string;
  name: string;
  version: string;
  category: string | null;
  sort_order: number;
  is_required: boolean;
}

export interface ThemeMeta {
  id: number;
  slug: string;
  name: string;
  version: string;
  author: string | null;
  preview_url: string | null;
  manifest: ThemeManifest;
  tokens: TokensDefinition;
  supported_types: string[];
  is_default: boolean;
  sections: ThemeSectionRef[];
}
