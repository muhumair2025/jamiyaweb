import { setRequestLocale } from "next-intl/server";
import { apiFetch } from "@/lib/api";
import { getCurrentWebsite } from "@/lib/websites";
import type { SectionMeta } from "@/engine/types";
import { LayoutAreasEditor } from "@/components/layout/layout-areas-editor";

interface SectionInstanceLike {
  id: string;
  type: string;
  settings: Record<string, unknown>;
  style?: Record<string, unknown>;
  elements?: Record<string, unknown>;
}

interface MePayload {
  data:
    | {
        id: number;
        header?: SectionInstanceLike | null;
        footer?: SectionInstanceLike | null;
      }
    | null;
}

/** /dashboard/layout-areas — edit the site-wide header and footer that
 *  appear on every published page. Distinct from per-page section editing,
 *  which happens in the builder. */
export default async function LayoutAreasPage(
  props: PageProps<"/[locale]/layout-areas">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const website = await getCurrentWebsite();
  if (!website) return null;

  // The /websites/me endpoint includes header/footer post-PATCH; also fetch
  // the catalog so we can resolve the schemas for the site-header and
  // site-footer section types.
  const [me, sections] = await Promise.all([
    apiFetch<MePayload>("/api/websites/me").catch(
      () => ({ data: null }) as MePayload
    ),
    apiFetch<{ data: SectionMeta[] }>("/api/sections")
      .then((r) => r.data)
      .catch(() => [] as SectionMeta[]),
  ]);

  const headerMeta =
    sections.find((s) => s.slug === "site-header") ?? null;
  const footerMeta =
    sections.find((s) => s.slug === "site-footer") ?? null;

  return (
    <LayoutAreasEditor
      websiteId={website.id}
      locale={locale}
      headerMeta={headerMeta}
      footerMeta={footerMeta}
      initialHeader={me.data?.header ?? null}
      initialFooter={me.data?.footer ?? null}
    />
  );
}
