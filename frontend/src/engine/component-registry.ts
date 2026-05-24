import type { ComponentType } from "react";

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

const components = new Map<string, SectionComponent>();

export function registerSection(slug: string, component: SectionComponent): void {
  components.set(slug, component);
}

export function getSectionComponent(slug: string): SectionComponent | null {
  return components.get(slug) ?? null;
}

export function isSectionRegistered(slug: string): boolean {
  return components.has(slug);
}

export function listRegisteredSections(): string[] {
  return Array.from(components.keys()).sort();
}
