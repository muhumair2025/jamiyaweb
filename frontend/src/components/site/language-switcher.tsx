"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { routing, type Locale } from "@/i18n/routing";

interface Props {
  currentLocale: Locale;
}

export function LanguageSwitcher({ currentLocale }: Props) {
  const pathname = usePathname();

  const stripLocale = (path: string) => {
    const segments = path.split("/").filter(Boolean);
    if (routing.locales.includes(segments[0] as Locale)) {
      segments.shift();
    }
    return "/" + segments.join("/");
  };

  const rest = stripLocale(pathname || "/");

  return (
    <div className="inline-flex items-center rounded-full border border-border bg-surface/60 p-0.5 text-xs font-semibold backdrop-blur">
      {routing.locales.map((locale) => {
        const href = `/${locale}${rest === "/" ? "" : rest}`;
        const isActive = locale === currentLocale;
        return (
          <Link
            key={locale}
            href={href}
            className={cn(
              "min-w-[34px] rounded-full px-2.5 py-1 text-center uppercase tracking-wide transition-all",
              isActive
                ? "bg-foreground text-background shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {locale}
          </Link>
        );
      })}
    </div>
  );
}
