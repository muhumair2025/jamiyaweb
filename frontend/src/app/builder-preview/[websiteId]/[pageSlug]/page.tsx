import { notFound, redirect } from "next/navigation";
import { fetchTheme, type PageContent, type ThemeMeta } from "@/engine";
import { apiFetch } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentWebsite } from "@/lib/websites";
import { BuilderRenderer } from "@/components/builder/builder-renderer";

interface PageRow {
  id: number;
  slug: string;
  title: string;
  content_json: PageContent;
}

/**
 * Builder preview target — loaded inside an iframe by the builder shell.
 *
 * Same origin as the dashboard so cookies flow naturally → we can fetch
 * draft pages via the owner-authenticated /api/websites/{id}/pages/{slug}
 * endpoint without juggling tokens across origins.
 *
 * Renders the live page via <BuilderRenderer />, which is a client
 * component that listens for UPDATE_PAGE postMessage from the parent and
 * re-renders on every keystroke.
 */
export default async function BuilderPreviewPage(
  props: PageProps<"/builder-preview/[websiteId]/[pageSlug]">
) {
  const { websiteId, pageSlug } = await props.params;
  const wid = Number(websiteId);
  if (!Number.isFinite(wid)) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/en/login");

  const website = await getCurrentWebsite();
  if (!website || website.id !== wid) {
    // Only the owner of this website may preview it
    notFound();
  }
  if (!website.theme) notFound();

  // Fetch theme + page in parallel
  const [theme, pageResp] = await Promise.all([
    fetchTheme(website.theme.slug),
    apiFetch<{ data: PageRow }>(
      `/api/websites/${wid}/pages/${pageSlug}`
    ),
  ]);
  const page = pageResp.data;
  if (!page) notFound();

  return (
    <BuilderRenderer
      theme={theme as ThemeMeta}
      overrides={website.tokens}
      initialPage={page.content_json}
    />
  );
}
