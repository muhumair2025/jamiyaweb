import { setRequestLocale } from "next-intl/server";
import { getCurrentWebsite } from "@/lib/websites";
import { TypographyEditor } from "@/components/theme/typography-editor";

export default async function ThemeTypographyPage(
  props: PageProps<"/[locale]/theme/typography">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const website = await getCurrentWebsite();
  if (!website) return null;

  return (
    <TypographyEditor
      websiteId={website.id}
      initialTokens={website.tokens ?? {}}
    />
  );
}
