/**
 * Curated font registry — Google Fonts.
 *
 * Selection criteria:
 *   • Wide-coverage workhorses (Inter, Roboto, Open Sans…)
 *   • Editorial serifs (Playfair, Merriweather, Lora…)
 *   • Display + brand fonts users actually pick (Poppins, Montserrat, DM Sans…)
 *   • Arabic / Urdu families (Cairo, Tajawal, Amiri, Noto Naskh Arabic…)
 *
 * Adding new fonts: append to `FONTS` below. The family name must match
 * the exact Google Fonts URL slug (spaces become `+`).
 */

export type FontCategory =
  | "sans-serif"
  | "serif"
  | "display"
  | "handwriting"
  | "monospace"
  | "arabic";

export interface FontEntry {
  /** Display name + CSS family value. Use the exact Google Fonts name. */
  family: string;
  /** Drives the category filter + sort. */
  category: FontCategory;
  /** Weights to load. Comma-separated CSS2 weight list. */
  weights?: string;
  /** Whether the font ships an Arabic subset (used to filter for RTL sites). */
  supportsArabic?: boolean;
}

export const FONTS: FontEntry[] = [
  // ── Sans-serif (workhorses) ───────────────────────────────────────────
  { family: "Inter", category: "sans-serif", weights: "300;400;500;600;700;800" },
  { family: "Roboto", category: "sans-serif", weights: "300;400;500;700;900" },
  { family: "Open Sans", category: "sans-serif", weights: "300;400;500;600;700;800" },
  { family: "Lato", category: "sans-serif", weights: "300;400;700;900" },
  { family: "Poppins", category: "sans-serif", weights: "300;400;500;600;700;800" },
  { family: "Montserrat", category: "sans-serif", weights: "300;400;500;600;700;800;900" },
  { family: "Nunito", category: "sans-serif", weights: "300;400;600;700;800;900" },
  { family: "Nunito Sans", category: "sans-serif", weights: "300;400;600;700;800;900" },
  { family: "Raleway", category: "sans-serif", weights: "300;400;500;600;700;800" },
  { family: "Work Sans", category: "sans-serif", weights: "300;400;500;600;700" },
  { family: "DM Sans", category: "sans-serif", weights: "400;500;700" },
  { family: "Plus Jakarta Sans", category: "sans-serif", weights: "300;400;500;600;700;800" },
  { family: "Manrope", category: "sans-serif", weights: "300;400;500;600;700;800" },
  { family: "Outfit", category: "sans-serif", weights: "300;400;500;600;700;800" },
  { family: "Mulish", category: "sans-serif", weights: "300;400;500;600;700;800" },
  { family: "Karla", category: "sans-serif", weights: "300;400;500;600;700;800" },
  { family: "Sora", category: "sans-serif", weights: "300;400;500;600;700;800" },
  { family: "Urbanist", category: "sans-serif", weights: "300;400;500;600;700;800" },
  { family: "Fira Sans", category: "sans-serif", weights: "300;400;500;600;700" },
  { family: "PT Sans", category: "sans-serif", weights: "400;700" },
  { family: "Source Sans 3", category: "sans-serif", weights: "300;400;500;600;700" },
  { family: "Quicksand", category: "sans-serif", weights: "300;400;500;600;700" },
  { family: "Heebo", category: "sans-serif", weights: "300;400;500;600;700;800" },
  { family: "Hind", category: "sans-serif", weights: "300;400;500;600;700" },
  { family: "Rubik", category: "sans-serif", weights: "300;400;500;600;700;800" },
  { family: "Barlow", category: "sans-serif", weights: "300;400;500;600;700;800" },
  { family: "Be Vietnam Pro", category: "sans-serif", weights: "300;400;500;600;700;800" },
  { family: "Asap", category: "sans-serif", weights: "400;500;600;700" },
  { family: "Onest", category: "sans-serif", weights: "300;400;500;600;700;800" },
  { family: "Geist", category: "sans-serif", weights: "300;400;500;600;700;800" },

  // ── Serif (editorial) ─────────────────────────────────────────────────
  { family: "Playfair Display", category: "serif", weights: "400;500;600;700;800;900" },
  { family: "Merriweather", category: "serif", weights: "300;400;700;900" },
  { family: "Lora", category: "serif", weights: "400;500;600;700" },
  { family: "Source Serif 4", category: "serif", weights: "300;400;500;600;700" },
  { family: "PT Serif", category: "serif", weights: "400;700" },
  { family: "Crimson Pro", category: "serif", weights: "300;400;500;600;700;800" },
  { family: "Cormorant Garamond", category: "serif", weights: "300;400;500;600;700" },
  { family: "EB Garamond", category: "serif", weights: "400;500;600;700;800" },
  { family: "Libre Baskerville", category: "serif", weights: "400;700" },
  { family: "Bitter", category: "serif", weights: "300;400;500;600;700;800" },
  { family: "Spectral", category: "serif", weights: "300;400;500;600;700;800" },
  { family: "Cardo", category: "serif", weights: "400;700" },
  { family: "Cormorant", category: "serif", weights: "300;400;500;600;700" },
  { family: "Frank Ruhl Libre", category: "serif", weights: "300;400;500;700;900" },
  { family: "Noto Serif", category: "serif", weights: "400;500;600;700;800" },
  { family: "DM Serif Display", category: "serif" },
  { family: "DM Serif Text", category: "serif" },
  { family: "Tinos", category: "serif", weights: "400;700" },
  { family: "Cinzel", category: "serif", weights: "400;500;600;700;800;900" },
  { family: "Libre Caslon Text", category: "serif", weights: "400;700" },

  // ── Display / brand ────────────────────────────────────────────────
  { family: "Bebas Neue", category: "display" },
  { family: "Oswald", category: "display", weights: "300;400;500;600;700" },
  { family: "Anton", category: "display" },
  { family: "Archivo Black", category: "display" },
  { family: "Righteous", category: "display" },
  { family: "Abril Fatface", category: "display" },
  { family: "Fjalla One", category: "display" },
  { family: "Russo One", category: "display" },
  { family: "Yeseva One", category: "display" },
  { family: "Alfa Slab One", category: "display" },
  { family: "Bowlby One", category: "display" },
  { family: "Lilita One", category: "display" },
  { family: "Lobster", category: "display" },
  { family: "Pacifico", category: "display" },
  { family: "Comfortaa", category: "display", weights: "300;400;500;600;700" },
  { family: "Domine", category: "display", weights: "400;500;600;700" },
  { family: "Bungee", category: "display" },
  { family: "Major Mono Display", category: "display" },

  // ── Handwriting / script ──────────────────────────────────────────────
  { family: "Dancing Script", category: "handwriting", weights: "400;500;600;700" },
  { family: "Caveat", category: "handwriting", weights: "400;500;600;700" },
  { family: "Sacramento", category: "handwriting" },
  { family: "Great Vibes", category: "handwriting" },
  { family: "Satisfy", category: "handwriting" },
  { family: "Allura", category: "handwriting" },
  { family: "Parisienne", category: "handwriting" },
  { family: "Permanent Marker", category: "handwriting" },
  { family: "Shadows Into Light", category: "handwriting" },
  { family: "Patrick Hand", category: "handwriting" },
  { family: "Kalam", category: "handwriting", weights: "300;400;700" },
  { family: "Indie Flower", category: "handwriting" },
  { family: "Homemade Apple", category: "handwriting" },

  // ── Monospace ─────────────────────────────────────────────────────────
  { family: "JetBrains Mono", category: "monospace", weights: "300;400;500;600;700;800" },
  { family: "Fira Code", category: "monospace", weights: "300;400;500;600;700" },
  { family: "Source Code Pro", category: "monospace", weights: "300;400;500;600;700;800;900" },
  { family: "IBM Plex Mono", category: "monospace", weights: "300;400;500;600;700" },
  { family: "Roboto Mono", category: "monospace", weights: "300;400;500;600;700" },
  { family: "Space Mono", category: "monospace", weights: "400;700" },
  { family: "Inconsolata", category: "monospace", weights: "300;400;500;600;700;800;900" },
  { family: "Cousine", category: "monospace", weights: "400;700" },

  // ── Arabic / Urdu / Persian ───────────────────────────────────────────
  // (Many of these also ship Latin glyphs, so they double as workhorses.)
  { family: "Cairo", category: "arabic", supportsArabic: true, weights: "300;400;500;600;700;800;900" },
  { family: "Tajawal", category: "arabic", supportsArabic: true, weights: "300;400;500;700;800;900" },
  { family: "Amiri", category: "arabic", supportsArabic: true, weights: "400;700" },
  { family: "Reem Kufi", category: "arabic", supportsArabic: true, weights: "400;500;600;700" },
  { family: "Lateef", category: "arabic", supportsArabic: true, weights: "300;400;500;600;700;800" },
  { family: "Scheherazade New", category: "arabic", supportsArabic: true, weights: "400;500;600;700" },
  { family: "Noto Naskh Arabic", category: "arabic", supportsArabic: true, weights: "400;500;600;700" },
  { family: "Noto Kufi Arabic", category: "arabic", supportsArabic: true, weights: "300;400;500;600;700;800;900" },
  { family: "Noto Sans Arabic", category: "arabic", supportsArabic: true, weights: "300;400;500;600;700;800;900" },
  { family: "IBM Plex Sans Arabic", category: "arabic", supportsArabic: true, weights: "300;400;500;600;700" },
  { family: "Markazi Text", category: "arabic", supportsArabic: true, weights: "400;500;600;700" },
  { family: "Mada", category: "arabic", supportsArabic: true, weights: "300;400;500;600;700;800;900" },
  { family: "Almarai", category: "arabic", supportsArabic: true, weights: "300;400;700;800" },
  { family: "Changa", category: "arabic", supportsArabic: true, weights: "300;400;500;600;700;800" },
  { family: "El Messiri", category: "arabic", supportsArabic: true, weights: "400;500;600;700" },
  { family: "Harmattan", category: "arabic", supportsArabic: true, weights: "400;500;600;700" },
  { family: "Aref Ruqaa", category: "arabic", supportsArabic: true, weights: "400;700" },
  { family: "Vibes", category: "arabic", supportsArabic: true },
  { family: "Rakkas", category: "arabic", supportsArabic: true },
];

/** Find a registry entry by family name (case-insensitive). */
export function findFont(family: string | undefined | null): FontEntry | undefined {
  if (!family) return undefined;
  const clean = family.trim().replace(/^['"]|['"]$/g, "");
  return FONTS.find(
    (f) => f.family.toLowerCase() === clean.toLowerCase()
  );
}

/** Build the Google Fonts CSS2 URL for a single family. */
export function googleFontUrl(entry: FontEntry): string {
  const family = entry.family.replace(/ /g, "+");
  const weights = entry.weights ?? "400;700";
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${weights}&display=swap`;
}

/** Stringify a family for CSS font-family (always quoted). */
export function toCssFamily(entry: FontEntry): string {
  // Add a sensible fallback so partial loads still render gracefully.
  const fallback =
    entry.category === "serif"
      ? "serif"
      : entry.category === "monospace"
        ? "monospace"
        : entry.category === "handwriting"
          ? "cursive"
          : entry.category === "display"
            ? "serif"
            : "sans-serif";
  return `'${entry.family}', ${fallback}`;
}

export const FONT_CATEGORIES: { value: FontCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sans-serif", label: "Sans-serif" },
  { value: "serif", label: "Serif" },
  { value: "display", label: "Display" },
  { value: "handwriting", label: "Handwriting" },
  { value: "monospace", label: "Monospace" },
  { value: "arabic", label: "Arabic" },
];
