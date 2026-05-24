"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronUp, LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

interface Props {
  locale: string;
  user: { name: string; email: string; organization_name: string | null };
}

export function UserMenu({ locale, user }: Props) {
  const t = useTranslations("dashboard.common");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Click-outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/60"
        )}
      >
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1 text-start">
          <span className="block truncate text-sm font-semibold text-foreground">
            {user.name}
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {user.organization_name ?? user.email}
          </span>
        </span>
        <ChevronUp
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open ? "rotate-0" : "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full start-0 mb-2 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-elevated"
        >
          <div className="border-b border-border p-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
          <form action={logoutAction.bind(null, locale)}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-start text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              {t("signOut")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
