import { setRequestLocale } from "next-intl/server";
import { apiFetch } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentWebsite } from "@/lib/websites";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";

interface ApiTheme {
  id: number;
  slug: string;
  name: string;
  version: string | null;
  author: string | null;
  preview_url: string | null;
  manifest: Record<string, unknown> | null;
  tokens: Record<string, string> | null;
  supported_types: string[] | null;
  is_default: boolean;
}

export default async function ThemeSwitchPage(
  props: PageProps<"/[locale]/theme/switch">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const [user, website] = await Promise.all([
    getCurrentUser(),
    getCurrentWebsite(),
  ]);

  // Filter by the user's site type so we never show a Scholar theme to a
  // Welfare site (and vice-versa). The backend supports the filter too.
  const params = user?.website_type ? `?website_type=${user.website_type}` : "";

  const themes = await apiFetch<{ data: ApiTheme[] }>(`/api/themes${params}`)
    .then((r) => r.data)
    .catch(() => [] as ApiTheme[]);

  return (
    <ThemeSwitcher
      themes={themes}
      websiteId={website?.id ?? null}
      currentThemeSlug={website?.theme?.slug ?? null}
    />
  );
}
