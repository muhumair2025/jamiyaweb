import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  AlertCircle,
  ExternalLink,
  PenSquare,
  Globe,
  Palette,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentWebsite } from "@/lib/websites";

export default async function DashboardPage(
  props: PageProps<"/[locale]/dashboard">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  // Auth + onboarding gating happens in the (dashboard) layout — we can
  // safely assume a complete user + website here.
  const user = (await getCurrentUser())!;
  const website = await getCurrentWebsite();
  const verified = !!user.email_verified_at;
  const t = await getTranslations("dashboard.pages.dashboard");

  const previewHref = website
    ? `http://${website.subdomain}.localhost:3000`
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("title", { name: user.name.split(" ")[0] })}
        </h1>
        {website && (
          <p className="mt-2 text-base text-foreground-soft">
            {t("subtitle", { site: website.site_name })}
          </p>
        )}
      </div>

      {/* Verification banner */}
      {!verified && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Please verify your email</p>
            <p className="mt-1 text-sm">
              We sent a verification link to your inbox. Click it to verify
              your account before publishing your site.
            </p>
            <Link
              href={`/${locale}/verify-email`}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold underline"
            >
              Open verification page
            </Link>
          </div>
        </div>
      )}

      {/* Website hero */}
      {website && previewHref && (
        <WebsiteHeroCard
          website={website}
          previewHref={previewHref}
          locale={locale}
        />
      )}

      {/* Two-up info row */}
      <div className="grid gap-5 md:grid-cols-2">
        {website && <ThemeCard website={website} />}
        <AccountCard user={user} verified={verified} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
function WebsiteHeroCard({
  website,
  previewHref,
  locale,
}: {
  website: NonNullable<Awaited<ReturnType<typeof getCurrentWebsite>>>;
  previewHref: string;
  locale: string;
}) {
  const primary = website.tokens?.["color.primary"] ?? "#20665c";
  const accent = website.tokens?.["color.accent"] ?? "#c18f2c";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div
        className="h-2 w-full"
        style={{ background: `linear-gradient(90deg, ${primary}, ${accent})` }}
      />
      <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                website.status === "published"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  website.status === "published"
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                }`}
              />
              {website.status === "published" ? "Published" : "Draft"}
            </span>
            {website.theme && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand">
                <Palette className="h-3 w-3" />
                {website.theme.name}
              </span>
            )}
          </div>

          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {website.site_name}
          </h2>
          {website.tagline && (
            <p className="mt-1 text-sm text-foreground-soft sm:text-base">
              {website.tagline}
            </p>
          )}
          <p
            dir="ltr"
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-3 py-1 font-mono text-xs text-foreground"
          >
            <Globe className="h-3.5 w-3.5" />
            {website.subdomain}.localhost:3000
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row md:flex-col md:items-stretch">
          <Link
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:border-brand/40 hover:text-brand"
          >
            <ExternalLink className="h-4 w-4" />
            View live
          </Link>
          <Link
            href={`/${locale}/builder/${website.id}/home`}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background shadow-card transition-colors hover:bg-brand"
          >
            <PenSquare className="h-4 w-4" />
            Edit website
          </Link>
        </div>
      </div>
    </div>
  );
}

function ThemeCard({
  website,
}: {
  website: NonNullable<Awaited<ReturnType<typeof getCurrentWebsite>>>;
}) {
  const tokens = website.tokens ?? {};
  const primary = tokens["color.primary"];
  const accent = tokens["color.accent"];
  const background = tokens["color.background"];
  const fontHeading = tokens["font.heading"];

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Theme</h2>
        {website.theme && (
          <span className="text-xs font-medium text-muted-foreground">
            {website.theme.name}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {primary && <Swatch label="Primary" colour={primary} />}
        {accent && <Swatch label="Accent" colour={accent} />}
        {background && (
          <Swatch label="Background" colour={background} bordered />
        )}
      </div>

      {fontHeading && (
        <p className="mt-4 text-xs text-muted-foreground">
          Headings ·{" "}
          <span className="font-mono text-foreground">{fontHeading}</span>
        </p>
      )}
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Change colours, typography and section settings from the builder.
      </p>
    </div>
  );
}

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
        className={`h-10 w-10 rounded-full shadow-soft ${
          bordered ? "border border-border" : ""
        }`}
        style={{ background: colour }}
      />
      <span className="text-[10px] font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function AccountCard({
  user,
  verified,
}: {
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
  verified: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
      <h2 className="text-base font-semibold text-foreground">Your account</h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Detail label="Name" value={user.name} />
        <Detail label="Email" value={user.email} />
        <Detail
          label="Organisation"
          value={user.organization_name ?? "—"}
        />
        <Detail
          label="Website type"
          value={user.website_type ?? "—"}
          capitalize
        />
        <Detail label="Country" value={user.country ?? "—"} />
        <Detail
          label="Email status"
          value={verified ? "Verified" : "Unverified"}
        />
      </dl>
    </div>
  );
}

function Detail({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm font-medium text-foreground ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
