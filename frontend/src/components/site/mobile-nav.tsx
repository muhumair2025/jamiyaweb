"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import type { Locale } from "@/i18n/routing";

interface Props {
  locale: Locale;
  links: { href: string; label: string }[];
  signInLabel: string;
  getStartedLabel: string;
}

export function MobileNav({
  locale,
  links,
  signInLabel,
  getStartedLabel,
}: Props) {
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isRtl = locale === "ar";
  const sidePosition = isRtl ? "left-0" : "right-0";
  const sheetVariants = {
    hidden: { x: isRtl ? "-100%" : "100%" },
    visible: { x: 0 },
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-soft transition-colors hover:bg-brand-50 hover:text-brand"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-foreground/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.aside
              className={`fixed inset-y-0 ${sidePosition} z-[70] flex h-full w-[88%] max-w-sm flex-col bg-background shadow-elevated`}
              variants={sheetVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <Link
                  href={`/${locale}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center"
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
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-5">
                <ul className="flex flex-col gap-1">
                  {links.map((link, i) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: isRtl ? -16 : 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.05, duration: 0.35 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="group flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-brand-50 hover:text-brand"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:text-brand group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <div className="border-t border-border bg-muted/40 px-5 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {locale === "ar" ? "اللغة" : "Language"}
                  </span>
                  <LanguageSwitcher currentLocale={locale} />
                </div>
                <div className="flex flex-col gap-2.5">
                  <Link
                    href={`/${locale}/login`}
                    onClick={() => setOpen(false)}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-border-strong bg-surface text-sm font-medium text-foreground transition-colors hover:bg-brand-50 hover:text-brand"
                  >
                    {signInLabel}
                  </Link>
                  <Link
                    href={`/${locale}/register`}
                    onClick={() => setOpen(false)}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background shadow-soft transition-colors hover:bg-brand"
                  >
                    {getStartedLabel}
                  </Link>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
