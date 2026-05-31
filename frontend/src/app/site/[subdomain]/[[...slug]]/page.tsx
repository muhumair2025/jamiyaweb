import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EnginePage, validateTheme, type ThemeMeta } from "@/engine";
import { API_URL } from "@/lib/api";

interface TenantPagePayload {
  id: number;
  slug: string;
  title: string;
  content_json: {
    sections: Array<{
      id: string;
      type: string;
      settings: Record<string, unknown>;
    }>;
  };
  seo_json: Record<string, unknown> | null;
  is_homepage: boolean;
  status: "draft" | "published";
  is_preview: boolean;
}

interface TenantSectionInstance {
  id: string;
  type: string;
  settings: Record<string, unknown>;
  style?: Record<string, unknown>;
  elements?: Record<string, unknown>;
}

interface TenantSitePayload {
  website: {
    id?: number;
    subdomain: string;
    site_name: string;
    tagline: string | null;
    favicon_path?: string | null;
    tokens?: Record<string, string> | null;
    /** Single-section global header (or null if not configured). */
    header?: TenantSectionInstance | null;
    /** Single-section global footer (or null if not configured). */
    footer?: TenantSectionInstance | null;
    site_languages?: string[];
    default_locale?: string;
    status: "draft" | "published";
  };
  theme: ThemeMeta | null;
  pages: Array<{ slug: string; title: string; is_homepage: boolean }>;
  is_preview: boolean;
  is_coming_soon?: boolean;
}

// ─── Fetchers (server-only, cached for 60s) ──────────────────────
async function fetchSite(subdomain: string): Promise<TenantSitePayload | null> {
  const res = await fetch(
    `${API_URL}/api/public/sites/by-subdomain/${encodeURIComponent(subdomain)}`,
    {
      headers: { Accept: "application/json" },
      next: { revalidate: 60, tags: [`tenant:${subdomain}`] },
    }
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`tenant fetch failed: ${res.status}`);
  }
  const body = await res.json();
  return body.data as TenantSitePayload;
}

async function fetchPage(
  subdomain: string,
  slug: string
): Promise<TenantPagePayload | null> {
  const res = await fetch(
    `${API_URL}/api/public/sites/by-subdomain/${encodeURIComponent(
      subdomain
    )}/pages/${encodeURIComponent(slug)}`,
    {
      headers: { Accept: "application/json" },
      next: { revalidate: 60, tags: [`tenant:${subdomain}:page:${slug}`] },
    }
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`tenant page fetch failed: ${res.status}`);
  }
  const body = await res.json();
  return body.data as TenantPagePayload;
}

// ─── Metadata ────────────────────────────────────────────────────
export async function generateMetadata(
  props: PageProps<"/site/[subdomain]/[[...slug]]">
): Promise<Metadata> {
  const { subdomain, slug } = await props.params;
  const site = await fetchSite(subdomain);
  if (!site) return { title: "Not found" };

  const favicon = site.website.favicon_path
    ? { icon: `${API_URL}/storage/${site.website.favicon_path}` }
    : undefined;

  // Draft → minimal coming-soon metadata, no page fetch
  if (site.is_coming_soon) {
    return {
      title: `${site.website.site_name} — Coming soon`,
      description: site.website.tagline ?? undefined,
      icons: favicon,
      robots: { index: false, follow: false },
    };
  }

  const pageSlug =
    (Array.isArray(slug) && slug.length > 0
      ? slug.join("/")
      : site.pages.find((p) => p.is_homepage)?.slug) ?? "home";
  const page = await fetchPage(subdomain, pageSlug);

  const seoTitle =
    (page?.seo_json?.title as string | undefined) ??
    page?.title ??
    site.website.site_name;

  const seoDesc =
    (page?.seo_json?.description as string | undefined) ??
    site.website.tagline ??
    undefined;

  return {
    title: seoTitle,
    description: seoDesc,
    icons: favicon,
  };
}

// ─── Page ────────────────────────────────────────────────────────
export default async function TenantPage(
  props: PageProps<"/site/[subdomain]/[[...slug]]">
) {
  const { subdomain, slug } = await props.params;

  const site = await fetchSite(subdomain);
  if (!site) notFound();

  // Site exists but is in draft and visitor isn't the owner → friendly
  // placeholder page instead of a stark 404.
  if (site.is_coming_soon) {
    return <ComingSoon site={site} />;
  }

  if (!site.theme) notFound();

  const themeCheck = validateTheme(site.theme);
  if (!themeCheck.ok || !themeCheck.data) {
    return <BrokenTheme issues={themeCheck.issues} />;
  }
  const theme = themeCheck.data;

  // Resolve which page to render
  const homepage = site.pages.find((p) => p.is_homepage);
  const pageSlug =
    Array.isArray(slug) && slug.length > 0 ? slug.join("/") : homepage?.slug;

  if (!pageSlug) notFound();

  const page = await fetchPage(subdomain, pageSlug);
  if (!page) notFound();

  const locale = site.website.default_locale ?? "en";
  const dir = locale === "ar" ? "rtl" : "ltr";

  // Merge the website's global header + footer with the page's own sections
  // so they all render through the same engine pipeline (tokens, fonts,
  // responsive CSS, element overrides). Header sits above page content;
  // footer below.
  const mergedSections = [
    ...(site.website.header ? [site.website.header] : []),
    ...page.content_json.sections,
    ...(site.website.footer ? [site.website.footer] : []),
  ];

  return (
    <div lang={locale} dir={dir}>
      {site.is_preview && <PreviewBanner subdomain={subdomain} />}
      <EnginePage
        theme={theme}
        overrides={site.website.tokens ?? null}
        page={{
          content_json: {
            sections: mergedSections as typeof page.content_json.sections,
          },
        }}
      />
    </div>
  );
}

// ─── Sub-views ───────────────────────────────────────────────────
function ComingSoon({ site }: { site: TenantSitePayload }) {
  const initials = (site.website.site_name || site.website.subdomain || "?")
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 px-6 py-16 text-white">
      <div aria-hidden className="absolute inset-0 bg-arabesque opacity-30" />
      <div className="relative mx-auto max-w-md text-center">
        <span className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold tracking-wider text-white/95 backdrop-blur">
          {initials}
        </span>

        <h1 className="mt-7 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {site.website.site_name}
        </h1>

        {site.website.tagline && (
          <p className="mt-3 text-base leading-relaxed text-white/75">
            {site.website.tagline}
          </p>
        )}

        <p className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/85 backdrop-blur">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-300" />
          Coming soon, in shaa Allah
        </p>

        <p className="mt-8 font-arabic-auto text-xl text-gold-200">
          بسم الله الرحمن الرحيم
        </p>
      </div>
    </main>
  );
}

function PreviewBanner({ subdomain }: { subdomain: string }) {
  return (
    <div
      className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-amber-100 px-3 py-1.5 text-[11px] font-semibold text-amber-800"
      dir="ltr"
    >
      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
      Draft preview · {subdomain}.localhost — not visible to the public
    </div>
  );
}

function BrokenTheme({
  issues,
}: {
  issues: Array<{ path: string; message: string }>;
}) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return (
    <main className="mx-auto max-w-2xl p-10">
      <h1 className="text-2xl font-semibold text-red-700">Theme rejected</h1>
      <p className="mt-2 text-sm text-foreground-soft">
        This tenant&apos;s theme failed validation. Common causes: an engine
        version mismatch, or a missing section reference.
      </p>
      <ul className="mt-4 list-disc space-y-1 ps-5 text-sm">
        {issues.map((i, idx) => (
          <li key={idx}>
            <code className="font-mono">{i.path}</code> — {i.message}
          </li>
        ))}
      </ul>
    </main>
  );
}
