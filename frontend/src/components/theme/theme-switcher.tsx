"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateWebsiteAction } from "@/lib/website-actions";

interface ApiTheme {
  id: number;
  slug: string;
  name: string;
  version: string | null;
  preview_url: string | null;
  tokens: Record<string, string> | null;
  supported_types: string[] | null;
  is_default: boolean;
}

interface Props {
  themes: ApiTheme[];
  websiteId: number | null;
  currentThemeSlug: string | null;
}

/** Gallery of available themes filtered to the user's site type. Clicking
 *  a theme tile activates it on the user's website (with a confirm dialog,
 *  since content stays but design switches wholesale). */
export function ThemeSwitcher({ themes, websiteId, currentThemeSlug }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activating, setActivating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Optimistic local state — flips immediately on activate so the user
  // sees the new "Active" badge before the server round-trip finishes.
  // Server-authoritative `currentThemeSlug` re-arrives via router.refresh()
  // and replaces this once the RSC re-renders.
  const [optimisticSlug, setOptimisticSlug] = useState<string | null>(null);
  const activeSlug = optimisticSlug ?? currentThemeSlug;

  const onActivate = (theme: ApiTheme) => {
    if (!websiteId) {
      setError("Your website isn't ready yet — finish onboarding first.");
      return;
    }
    if (pending) return;
    if (theme.slug === activeSlug) return;
    const ok = window.confirm(
      `Switch to "${theme.name}"? Your content stays, but the design — colours, fonts and section layouts — changes.`
    );
    if (!ok) return;

    setActivating(theme.id);
    setError(null);
    setOptimisticSlug(theme.slug);
    startTransition(async () => {
      const res = await updateWebsiteAction(websiteId, { theme_id: theme.id });
      setActivating(null);
      if (!res.ok) {
        // Roll back the optimistic flip
        setOptimisticSlug(null);
        setError(res.message ?? "Failed to switch theme.");
        return;
      }
      // Trigger an RSC re-fetch so the dashboard sidebar + theme overview
      // pick up the new theme. The optimistic state clears once the new
      // `currentThemeSlug` prop arrives.
      router.refresh();
    });
  };

  if (themes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-10 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-semibold text-foreground">
          No themes available for your site type
        </p>
        <p className="mt-1 text-xs text-foreground-soft">
          Check back soon — we're adding new themes regularly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => {
          const isActive = theme.slug === activeSlug;
          const primary = theme.tokens?.["color.primary"] ?? "#20665c";
          const accent = theme.tokens?.["color.accent"] ?? "#c18f2c";

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onActivate(theme)}
              disabled={pending || isActive}
              className={cn(
                "group relative overflow-hidden rounded-2xl border bg-surface text-left shadow-soft transition-all",
                isActive
                  ? "border-brand ring-2 ring-brand/30"
                  : "border-border hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-card"
              )}
            >
              {/* Preview band — uses the theme's own primary/accent tokens */}
              <div
                className="h-28 w-full"
                style={{
                  background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`,
                }}
              />

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {theme.name}
                  </p>
                  {isActive && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                      <Check className="h-3 w-3" />
                      Active
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                  {theme.version && <span>v{theme.version}</span>}
                  {theme.is_default && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">
                      Default
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-1.5">
                  <ColorChip colour={primary} />
                  <ColorChip colour={accent} />
                  {theme.tokens?.["color.background"] && (
                    <ColorChip colour={theme.tokens["color.background"]} bordered />
                  )}
                </div>
              </div>

              {/* Activating overlay */}
              {activating === theme.id && (
                <div className="absolute inset-0 grid place-items-center bg-foreground/40 backdrop-blur-sm">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ColorChip({
  colour,
  bordered,
}: {
  colour: string;
  bordered?: boolean;
}) {
  return (
    <span
      className={cn(
        "h-5 w-5 rounded-full",
        bordered ? "border border-border" : "shadow-soft"
      )}
      style={{ background: colour }}
      aria-hidden
    />
  );
}
