import { setRequestLocale } from "next-intl/server";
import { MediaLibrary } from "@/components/media/media-library";
import { getCurrentWebsite } from "@/lib/websites";
import { listMediaServer } from "@/lib/media-server";

export default async function MediaPage(props: PageProps<"/[locale]/media">) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const website = await getCurrentWebsite();
  const websiteId = website?.id ?? null;

  // Initial SSR fetch — first 60 items, newest first. The client will
  // re-fetch when filters change and mutate the list locally on uploads
  // and deletes.
  const initial = await listMediaServer({
    websiteId,
    perPage: 60,
    page: 1,
  }).catch(() => ({
    data: [],
    meta: { current_page: 1, per_page: 60, last_page: 1, total: 0 },
  }));

  return (
    <MediaLibrary
      initialItems={initial.data}
      initialMeta={initial.meta}
      websiteId={websiteId}
    />
  );
}
