import { LanguageSwitcher } from "@/components/site/language-switcher";
import { MobileSidebar } from "./mobile-sidebar";
import type { Locale } from "@/i18n/routing";

interface Props {
  locale: Locale;
  website: {
    id: number;
    site_name: string;
    subdomain: string;
    status: "draft" | "published";
  } | null;
  user: { name: string; email: string; organization_name: string | null };
}

export function Topbar({ locale, website, user }: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur sm:px-6 lg:h-16 lg:px-8">
      {/* Left: mobile hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <MobileSidebar locale={locale} website={website} user={user} />
        {website && (
          <div className="hidden min-w-0 lg:block">
            <p
              dir="ltr"
              className="truncate font-mono text-xs text-muted-foreground"
            >
              {website.subdomain}.localhost:3000
            </p>
          </div>
        )}
      </div>

      {/* Right: language + view live */}
      <div className="flex items-center gap-2">
        <LanguageSwitcher currentLocale={locale} />
        {website && (
          <a
            href={`http://${website.subdomain}.localhost:3000`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-9 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:border-brand/40 hover:text-brand sm:inline-flex"
          >
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            View live
          </a>
        )}
      </div>
    </header>
  );
}
