import { setRequestLocale } from "next-intl/server";
import { getCurrentWebsite } from "@/lib/websites";
import { IdentityEditor } from "@/components/theme/identity-editor";

export default async function ThemeIdentityPage(
  props: PageProps<"/[locale]/theme/identity">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const website = await getCurrentWebsite();
  if (!website) return null;

  return (
    <IdentityEditor
      websiteId={website.id}
      initialLogo={website.logo_path}
      initialFavicon={website.favicon_path}
      siteName={website.site_name}
    />
  );
}
