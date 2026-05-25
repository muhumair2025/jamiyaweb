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

/**
 * The registry is a heterogeneous bag of components — each section has a
 * different settings shape. We deliberately type the storage and accessor
 * with `any` for the settings generic so callers can register strictly-typed
 * components without runtime casts.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = SectionComponent<any>;

const components = new Map<string, AnyComponent>();

export function registerSection(slug: string, component: AnyComponent): void {
  components.set(slug, component);
}

export function getSectionComponent(slug: string): AnyComponent | null {
  return components.get(slug) ?? null;
}

export function isSectionRegistered(slug: string): boolean {
  return components.has(slug);
}

export function listRegisteredSections(): string[] {
  return Array.from(components.keys()).sort();
}
