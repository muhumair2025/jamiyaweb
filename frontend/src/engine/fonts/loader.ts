"use client";

import { findFont, googleFontUrl, type FontEntry } from "./registry";

/**
 * Dynamic font loader.
 *
 * The picker shows a long list of font previews. We lazy-load each family's
 * Google Fonts stylesheet only when it becomes visible in the dropdown (or
 * when the user actually picks it for an element).
 *
 * Dedupes by family name so a single font is never linked twice. Stores
 * link nodes under <head> so they participate in normal browser caching.
 */

const LOADED = new Set<string>();

function injectLink(href: string, family: string): void {
  if (typeof document === "undefined") return;
  if (LOADED.has(family)) return;
  LOADED.add(family);

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-jw-font", family);
  document.head.appendChild(link);
}

/** Load a single font (from a registry entry). No-op if already loaded. */
export function loadFont(entry: FontEntry): void {
  injectLink(googleFontUrl(entry), entry.family);
}

/** Load by family name. Looks up the registry; no-op if not in registry. */
export function loadFontByFamily(family: string | undefined | null): void {
  const entry = findFont(family);
  if (entry) loadFont(entry);
}

/** Load several at once — used to warm the picker preview list. */
export function loadFonts(entries: FontEntry[]): void {
  entries.forEach(loadFont);
}

/** For debugging / tests. */
export function loadedFontFamilies(): string[] {
  return Array.from(LOADED);
}
