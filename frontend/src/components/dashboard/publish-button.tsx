"use client";

import { useState, useTransition } from "react";
import { Globe, Loader2, Lock } from "lucide-react";
import { setPublishStatusAction } from "@/builder/actions";
import { cn } from "@/lib/utils";

interface Props {
  websiteId: number;
  locale: string;
  initialStatus: "draft" | "published";
}

/**
 * Toggles a website between draft and published. Drafts 404 to anonymous
 * visitors (with a "Coming soon" fallback); published sites are public.
 */
export function PublishButton({ websiteId, locale, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isPublished = status === "published";

  const onToggle = () => {
    setError(null);
    startTransition(async () => {
      const next = !isPublished;
      const result = await setPublishStatusAction(websiteId, next, locale);
      if (result.ok && result.status) {
        setStatus(result.status);
      } else {
        setError(result.message ?? "Action failed");
      }
    });
  };

  return (
    <div className="grid gap-1.5">
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        className={cn(
          "group inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-all",
          isPublished
            ? "border border-border bg-background text-foreground hover:border-amber-300 hover:text-amber-700"
            : "bg-emerald-600 text-white shadow-card hover:bg-emerald-700",
          pending && "cursor-not-allowed opacity-70"
        )}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPublished ? (
          <Lock className="h-4 w-4" />
        ) : (
          <Globe className="h-4 w-4" />
        )}
        {isPublished ? "Unpublish" : "Publish site"}
      </button>
      {error && (
        <p className="text-end text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
