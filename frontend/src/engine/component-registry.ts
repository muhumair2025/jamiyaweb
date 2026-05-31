import type { ComponentType, ReactNode } from "react";

/**
 * In-memory map of section slug → React component implementation.
 *
 * Sections live in `frontend/src/sections/{slug}/component.tsx` and self-register
 * by calling `registerSection(slug, Component)` (typically from a barrel file
 * eagerly imported at app boot).
 *
 * The DB-side `sections` table holds metadata (schema, defaults); the React
 * code lives here and is paired by slug at runtime.
 */

/** Props every section component must accept. */
export interface SectionComponentProps<TSettings = Record<string, unknown>> {
  /** Resolved settings (already validated against the section's own schema). */
  settings: TSettings;
  /** The current website's resolved tokens (read via `var(--jw-color-primary)` etc). */
  tokens?: Record<string, string>;
  /** When rendered inside the builder, the section knows its instance id. */
  sectionId?: string;
}

export type SectionComponent<TSettings = Record<string, unknown>> = ComponentType<
  SectionComponentProps<TSettings>
>;

/**
 * One pre-built visual style of a section. Sections can declare multiple
 * variants (e.g. hero-basic has "classic" + "cinematic"); the user picks one
 * from the Variants tab and it's stored in `settings.variant`.
 *
 * The thumbnail is a small visual preview rendered into the variant card —
 * a tiny SVG mock works well (full live previews would be expensive).
 */
export interface SectionVariant {
  /** Stable id stored in `settings.variant`. */
  id: string;
  /** Short label shown on the card. */
  label: string;
  /** One-liner shown under the label. */
  description?: string;
  /** Visual preview rendered inside the card. */
  thumbnail: ReactNode;
}

/**
 * The registry is a heterogeneous bag of components — each section has a
 * different settings shape. We deliberately type the storage and accessor
 * with `any` for the settings generic so callers can register strictly-typed
 * components without runtime casts.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = SectionComponent<any>;

interface RegistryEntry {
  component: AnyComponent;
  variants: SectionVariant[];
}

const entries = new Map<string, RegistryEntry>();

export interface RegisterSectionOptions {
  /** Pre-built visual variants users can switch between. */
  variants?: SectionVariant[];
}

export function registerSection(
  slug: string,
  component: AnyComponent,
  options: RegisterSectionOptions = {}
): void {
  entries.set(slug, {
    component,
    variants: options.variants ?? [],
  });
}

export function getSectionComponent(slug: string): AnyComponent | null {
  return entries.get(slug)?.component ?? null;
}

export function getSectionVariants(slug: string): SectionVariant[] {
  return entries.get(slug)?.variants ?? [];
}

export function isSectionRegistered(slug: string): boolean {
  return entries.has(slug);
}

export function listRegisteredSections(): string[] {
  return Array.from(entries.keys()).sort();
}
