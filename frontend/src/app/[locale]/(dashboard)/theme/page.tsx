import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  ImageIcon,
  LayoutGrid,
  Palette,
  Type,
} from "lucide-react";
import { getCurrentWebsite } from "@/lib/websites";
import { cn } from "@/lib/utils";

export default async function ThemeOverviewPage(
  props: PageProps<"/[locale]/theme">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const website = await getCurrentWebsite();
  const tokens = website?.tokens ?? {};

  const primary = tokens["color.primary"] ?? "#20665c";
  const accent = tokens["color.accent"] ?? "#c18f2c";
  const background = tokens["color.background"] ?? "#fbfaf7";
  const heading = tokens["font.heading"];
  const body = tokens["font.body"];

  return (
    <div className="space-y-6">
      {/* Active theme card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
        <div
          className="h-3 w-full"
          style={{ background: `linear-gradient(90deg, ${primary}, ${accent})` }}
        />
        <div className="grid gap-5 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Active theme
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">
              {website?.theme?.name ?? "No theme selected"}
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Swatch label="Primary" colour={primary} />
              <Swatch label="Accent" colour={accent} />
              <Swatch label="Background" colour={background} bordered />
            </div>

            {(heading || body) && (
              <p className="mt-4 text-xs text-muted-foreground">
                Typography:{" "}
                <span className="font-mono text-foreground">
                  {heading ?? "default"}
                </span>{" "}
                /{" "}
                <span className="font-mono text-foreground">
                  {body ?? "default"}
                </span>
              </p>
            )}
          </div>

          <Link
            href={`/${locale}/theme/switch`}
            className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-full bg-foreground px-5 text-sm font-semibold text-background shadow-card transition-colors hover:bg-brand"
          >
            <LayoutGrid className="h-4 w-4" />
            Switch theme
          </Link>
        </div>
      </div>

      {/* Quick-edit cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ShortcutCard
          locale={locale}
          href="/theme/colors"
          icon={Palette}
          title="Colours"
          desc="Tweak brand, accent and background. Pick from curated palettes or set custom hex."
        />
        <ShortcutCard
          locale={locale}
          href="/theme/typography"
          icon={Type}
          title="Typography"
          desc="Choose heading and body fonts from 110+ Google Fonts, including Arabic-capable families."
        />
        <ShortcutCard
          locale={locale}
          href="/theme/identity"
          icon={ImageIcon}
          title="Identity"
          desc="Upload your logo and favicon. Used across pages and on the browser tab."
        />
        <ShortcutCard
          locale={locale}
          href="/theme/switch"
          icon={LayoutGrid}
          title="Switch theme"
          desc="Browse all themes for your site type. Content stays — only the design changes."
        />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────

function Swatch({
  label,
  colour,
  bordered,
}: {
  label: string;
  colour: string;
  bordered?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={cn(
          "h-10 w-10 rounded-full shadow-soft",
          bordered && "border border-border"
        )}
        style={{ background: colour }}
      />
      <span className="text-[10px] font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function ShortcutCard({
  locale,
  href,
  icon: Icon,
  title,
  desc,
}: {
  locale: string;
  href: string;
  icon: typeof LayoutGrid;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={`/${locale}${href}`}
      className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-card"
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-foreground-soft">
          {desc}
        </p>
      </div>
      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 rtl:rotate-180" />
    </Link>
  );
}
