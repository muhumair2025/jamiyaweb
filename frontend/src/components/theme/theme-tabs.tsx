"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ImageIcon,
  LayoutGrid,
  Palette,
  Type,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  /** Path under /dashboard/theme — empty string = overview index. */
  href: string;
  icon: LucideIcon;
}

const TABS: Tab[] = [
  { label: "Overview", href: "", icon: Sparkles },
  { label: "Switch theme", href: "/switch", icon: LayoutGrid },
  { label: "Colours", href: "/colors", icon: Palette },
  { label: "Typography", href: "/typography", icon: Type },
  { label: "Identity", href: "/identity", icon: ImageIcon },
];

/** Sub-navigation for the Theme section. Persistent across sub-routes. */
export function ThemeTabs({ locale }: { locale: string }) {
  const pathname = usePathname() ?? "";
  const base = `/${locale}/theme`;

  return (
    <nav
      aria-label="Theme sections"
      className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-surface p-1 shadow-soft"
    >
      {TABS.map((tab) => {
        const href = `${base}${tab.href}`;
        const isActive =
          tab.href === ""
            ? pathname === href
            : pathname.startsWith(href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href || "overview"}
            href={href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors",
              isActive
                ? "bg-brand text-white shadow-sm"
                : "text-foreground-soft hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
