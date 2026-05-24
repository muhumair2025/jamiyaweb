import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { fetchSections, fetchTheme, type PageContent } from "@/engine";
import { apiFetch } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentWebsite } from "@/lib/websites";
import { BuilderShell } from "@/components/builder/builder-shell";

interface PageRow {
  id: number;
  slug: string;
  title: string;
  content_json: PageContent;
}

export default async function BuilderPage(
  props: PageProps<"/[locale]/builder/[websiteId]/[pageSlug]">
) {
  const { locale, websiteId, pageSlug } = await props.params;
  setRequestLocale(locale);

  const wid = Number(websiteId);
  if (!Number.isFinite(wid)) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  const website = await getCurrentWebsite();
  if (!website || website.id !== wid) notFound();
  if (!website.theme) notFound();

  // Parallel fetch of theme + page + sections catalogue
  const [theme, pageResp, sections] = await Promise.all([
    fetchTheme(website.theme.slug),
    apiFetch<{ data: PageRow }>(`/api/websites/${wid}/pages/${pageSlug}`),
    fetchSections(),
  ]);

  const page = pageResp.data;
  if (!page) notFound();

  return (
    <BuilderShell
      locale={locale}
      meta={{
        websiteId: wid,
        pageSlug: page.slug,
        pageTitle: page.title,
        subdomain: website.subdomain,
        siteName: website.site_name,
      }}
      initialPage={page.content_json}
      themeName={theme.name}
      sectionsCatalog={sections}
    />
  );
}
