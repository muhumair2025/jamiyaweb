"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import {
  HelpLink,
  SidebarItems,
  SiteContextCard,
} from "./sidebar";
import { UserMenu } from "./user-menu";

interface Props {
  locale: string;
  website: {
    id: number;
    site_name: string;
    subdomain: string;
    status: "draft" | "published";
  } | null;
  user: { name: string; email: string; organization_name: string | null };
}

export function MobileSidebar({ locale, website, user }: Props) {
  const [open, setOpen] = useState(false);
  const isRtl = locale === "ar";

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-foreground/30 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.aside
              className={`fixed inset-y-0 z-[70] flex h-full w-[88%] max-w-xs flex-col bg-surface shadow-elevated lg:hidden ${
                isRtl ? "end-0" : "start-0"
              }`}
              initial={{ x: isRtl ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "100%" : "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <Link
                  href={`/${locale}/dashboard`}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center"
                >
                  <Image
                    src="/logo.png"
                    alt="JamiyaWeb"
                    width={140}
                    height={40}
                    className="h-8 w-auto"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Site context */}
              {website && (
                <div className="border-b border-border px-4 py-3">
                  <SiteContextCard locale={locale} website={website} />
                </div>
              )}

              {/* Nav */}
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <SidebarItems
                  locale={locale}
                  websiteId={website?.id ?? null}
                  onNavigate={() => setOpen(false)}
                />
              </nav>

              {/* Footer */}
              <div className="border-t border-border px-3 py-3">
                <HelpLink locale={locale} />
                <div className="mt-2">
                  <UserMenu locale={locale} user={user} />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
