/**
 * Dummy theme catalogue used by the onboarding theme picker.
 *
 * Real themes will be loaded from the backend once the theme engine ships
 * (see project.md → Core Theme Engine). For now, the picker offers a
 * curated set filtered by the user's website_type.
 */

export type ThemeMood = "calm" | "bold" | "elegant" | "warm";

export interface DummyTheme {
  id: string;
  name: string;
  tagline: string;
  websiteTypes: ("welfare" | "scholar")[];
  /** Tailwind gradient classes used for the preview card */
  gradient: string;
  /** Accent strip colour shown on hover */
  accent: string;
  mood: ThemeMood;
  /** Tag chips shown on the card */
  features: string[];
}

export const THEMES: DummyTheme[] = [
  // ── WELFARE ───────────────────────────────────────────
  {
    id: "compassion",
    name: "Compassion",
    tagline: "Donation-first layout with campaign hero & impact stats.",
    websiteTypes: ["welfare"],
    gradient: "from-brand-700 via-brand-800 to-brand-900",
    accent: "bg-gold",
    mood: "warm",
    features: ["Donation Hero", "Campaigns", "Impact Stories"],
  },
  {
    id: "mercy",
    name: "Mercy",
    tagline: "Calm, professional charity site with zakat calculator.",
    websiteTypes: ["welfare"],
    gradient: "from-brand-500 via-brand-700 to-brand-800",
    accent: "bg-emerald-400",
    mood: "calm",
    features: ["Zakat Calculator", "Causes Grid", "Donor Wall"],
  },
  {
    id: "hope",
    name: "Hope",
    tagline: "Story-led layout with photo essays from the field.",
    websiteTypes: ["welfare"],
    gradient: "from-gold-500 via-gold-600 to-brand-700",
    accent: "bg-amber-400",
    mood: "elegant",
    features: ["Photo Essays", "Field Updates", "Quarterly Reports"],
  },
  {
    id: "unity",
    name: "Unity",
    tagline: "Community-focused layout with volunteer signup.",
    websiteTypes: ["welfare"],
    gradient: "from-brand-600 via-brand to-gold-600",
    accent: "bg-brand-300",
    mood: "bold",
    features: ["Volunteer Signup", "Events", "Newsletter"],
  },

  // ── SCHOLAR ───────────────────────────────────────────
  {
    id: "wisdom",
    name: "Wisdom",
    tagline: "Academic, calm layout for fatwas, books and lectures.",
    websiteTypes: ["scholar"],
    gradient: "from-brand-800 via-brand-700 to-brand-600",
    accent: "bg-brand-300",
    mood: "calm",
    features: ["Fatwa Archive", "Book Library", "Lecture Audio"],
  },
  {
    id: "light",
    name: "Light",
    tagline: "Minimal scholar portfolio — type-first design.",
    websiteTypes: ["scholar"],
    gradient: "from-gold-600 via-gold-500 to-brand-500",
    accent: "bg-gold-200",
    mood: "elegant",
    features: ["Portfolio", "Writings", "Speaking"],
  },
  {
    id: "madinah",
    name: "Madinah",
    tagline: "Traditional madrasah layout with class enrolment.",
    websiteTypes: ["scholar"],
    gradient: "from-brand-700 via-brand-800 to-brand-900",
    accent: "bg-gold-500",
    mood: "warm",
    features: ["Classes", "Enrolment", "Schedule"],
  },
  {
    id: "hikmah",
    name: "Hikmah",
    tagline: "Modern academic layout with Quran reader integration.",
    websiteTypes: ["scholar"],
    gradient: "from-brand-500 via-brand-700 to-brand-900",
    accent: "bg-emerald-400",
    mood: "bold",
    features: ["Quran Reader", "Tafsir", "Q&A"],
  },
];

export function themesFor(websiteType: string | null | undefined): DummyTheme[] {
  if (!websiteType) return THEMES;
  return THEMES.filter((t) =>
    t.websiteTypes.includes(websiteType as "welfare" | "scholar")
  );
}

export function findTheme(id: string | null | undefined): DummyTheme | null {
  if (!id) return null;
  return THEMES.find((t) => t.id === id) ?? null;
}
