"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ExternalLink, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS, type DashNavItem } from "./nav-config";
import { UserMenu } from "./user-menu";

interface Props {
  locale: string;
  website: {
    id: number;
    site_name: string;
    subdomain: string;
    status: "draft" | "published";
  } | null;
  user: {
    name: string;
    email: string;
    organization_name: string | null;
  };
}

export function Sidebar({ locale, website, user }: Props) {
  return (
    <aside
      className="hidden h-screen w-64 shrink-0 flex-col border-e border-border bg-surface lg:flex"
      aria-label="Primary"
    >
      {/* ── Logo + site context ── */}
      <div className="border-b border-border px-4 py-4">
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex items-center"
        >
          <Image
            src="/logo.png"
            alt="JamiyaWeb"
            width={140}
            height={40}
            priority
            className="h-8 w-auto"
          />
        </Link>
        {website && <SiteContextCard locale={locale} website={website} />}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarItems locale={locale} websiteId={website?.id ?? null} />
      </nav>

      {/* ── Footer: help + user ── */}
      <div className="border-t border-border px-3 py-3">
        <HelpLink locale={locale} />
        <div className="mt-2">
          <UserMenu locale={locale} user={user} />
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
export function SidebarItems({
  locale,
  websiteId,
  onNavigate,
}: {
  locale: string;
  websiteId: number | null;
  /** Called whenever a real link is clicked — used to close the mobile drawer. */
  onNavigate?: () => void;
}) {
  const t = useTranslations("dashboard");
  const pathname = usePathname() ?? "";

  return (
    <ul className="space-y-6">
      {NAV_GROUPS.map((group) => (
        <li key={group.key}>
          <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t(`groups.${group.key}`)}
          </p>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((item) => (
              <SidebarItemRow
                key={item.key}
                item={item}
                locale={locale}
                websiteId={websiteId}
                pathname={pathname}
                onNavigate={onNavigate}
                label={t(`nav.${item.key}`)}
                comingSoonLabel={t("common.comingSoon")}
              />
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function SidebarItemRow({
  item,
  locale,
  websiteId,
  pathname,
  onNavigate,
  label,
  comingSoonLabel,
}: {
  item: DashNavItem;
  locale: string;
  websiteId: number | null;
  pathname: string;
  onNavigate?: () => void;
  label: string;
  comingSoonLabel: string;
}) {
  const Icon = item.icon;
  const resolved =
    typeof item.href === "function" ? item.href(websiteId) : item.href;
  const fullHref = resolved ? `/${locale}${resolved}` : null;

  // Active state — exact match for /dashboard, prefix match for others
  const isActive =
    fullHref &&
    (fullHref === `/${locale}/dashboard`
      ? pathname === fullHref
      : pathname.startsWith(fullHref));

  const baseClass = cn(
    "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-brand-50/80 text-brand"
      : "text-foreground-soft hover:bg-muted/60 hover:text-foreground",
    item.comingSoon && "cursor-default"
  );

  const content = (
    <>
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          isActive ? "text-brand" : "text-foreground-soft/70"
        )}
      />
      <span className="flex-1 truncate">{label}</span>
      {item.comingSoon && (
        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
          {comingSoonLabel.split(" ")[0]}
        </span>
      )}
      {item.external && (
        <ExternalLink className="h-3 w-3 opacity-50" />
      )}
    </>
  );

  if (!fullHref || item.comingSoon) {
    return (
      <li>
        <button
          type="button"
          className={baseClass}
          onClick={(e) => e.preventDefault()}
          aria-disabled
          title={item.comingSoon ? comingSoonLabel : undefined}
        >
          {content}
        </button>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={fullHref}
        onClick={onNavigate}
        className={baseClass}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
      >
        {content}
      </Link>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────
export function SiteContextCard({
  locale,
  website,
}: {
  locale: string;
  website: NonNullable<Props["website"]>;
}) {
  return (
    <div className="mt-4 rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-1.5 w-1.5 shrink-0 rounded-full",
            website.status === "published"
              ? "bg-emerald-500"
              : "bg-amber-500"
          )}
        />
        <p className="truncate text-sm font-semibold text-foreground">
          {website.site_name}
        </p>
      </div>
      <p
        dir="ltr"
        className="mt-1 truncate font-mono text-[10px] text-muted-foreground"
      >
        {website.subdomain}.localhost:3000
      </p>
      <a
        href={`http://${website.subdomain}.localhost:3000`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
      >
        <ExternalLink className="h-3 w-3" />
        Open site
      </a>
    </div>
  );
}

export function HelpLink({ locale }: { locale: string }) {
  const t = useTranslations("dashboard.common");
  return (
    <a
      href={`/${locale}/docs`}
      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-foreground-soft transition-colors hover:bg-muted/60 hover:text-foreground"
    >
      <HelpCircle className="h-4 w-4 text-foreground-soft/70" />
      <span>{t("help")}</span>
    </a>
  );
}
