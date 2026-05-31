import { setRequestLocale } from "next-intl/server";
import { getCurrentWebsite } from "@/lib/websites";
import { ColorTokensEditor } from "@/components/theme/color-tokens-editor";

export default async function ThemeColorsPage(
  props: PageProps<"/[locale]/theme/colors">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const website = await getCurrentWebsite();
  if (!website) return null;

  return (
    <ColorTokensEditor
      websiteId={website.id}
      initialTokens={website.tokens ?? {}}
    />
  );
}
