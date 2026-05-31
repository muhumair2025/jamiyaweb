import {
  LayoutDashboard,
  PenSquare,
  FileText,
  Newspaper,
  Image as ImageIcon,
  Palette,
  Layers,
  LayoutPanelTop,
  Search,
  Globe,
  Languages,
  Settings,
  CreditCard,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface DashNavItem {
  /** i18n key under `dashboard.nav` */
  key: string;
  /** Route path relative to locale, e.g. "/dashboard" or `(websiteId) => "/builder/${id}/home"` */
  href: string | ((websiteId: number | null) => string | null);
  icon: LucideIcon;
  /** If true, render with a "Soon" badge and disable navigation when clicked. */
  comingSoon?: boolean;
  /** Internal flag — if true, link target opens in a new tab */
  external?: boolean;
}

export interface DashNavGroup {
  /** i18n key under `dashboard.groups` */
  key: string;
  items: DashNavItem[];
}

export const NAV_GROUPS: DashNavGroup[] = [
  {
    key: "main",
    items: [
      { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
      {
        key: "builder",
        href: (wid) => (wid ? `/builder/${wid}/home` : null),
        icon: PenSquare,
      },
    ],
  },
  {
    key: "content",
    items: [
      { key: "pages", href: "/pages", icon: FileText, comingSoon: true },
      { key: "posts", href: "/posts", icon: Newspaper, comingSoon: true },
      { key: "media", href: "/media", icon: ImageIcon },
    ],
  },
  {
    key: "design",
    items: [
      { key: "theme", href: "/theme", icon: Palette },
      { key: "layout", href: "/layout-areas", icon: LayoutPanelTop },
      { key: "sections", href: "/sections", icon: Layers, comingSoon: true },
    ],
  },
  {
    key: "site",
    items: [
      { key: "seo", href: "/seo", icon: Search, comingSoon: true },
      { key: "domain", href: "/domain", icon: Globe, comingSoon: true },
      {
        key: "languages",
        href: "/languages",
        icon: Languages,
        comingSoon: true,
      },
    ],
  },
  {
    key: "account",
    items: [
      { key: "settings", href: "/settings", icon: Settings, comingSoon: true },
      { key: "billing", href: "/billing", icon: CreditCard, comingSoon: true },
      { key: "team", href: "/team", icon: Users, comingSoon: true },
    ],
  },
];
