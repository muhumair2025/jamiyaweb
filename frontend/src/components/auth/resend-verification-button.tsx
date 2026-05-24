"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Loader2, MailCheck } from "lucide-react";
import { resendVerificationAction } from "@/app/actions/auth";
import { FormBanner } from "./form-primitives";

export function ResendVerificationButton() {
  const t = useTranslations("auth.verify");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    status: "error" | "success";
    message?: string;
  } | null>(null);

  return (
    <div className="grid gap-3">
      {result && <FormBanner status={result.status} message={result.message} />}
      <button
        type="button"
        onClick={() =>
          startTransition(async () => {
            const r = await resendVerificationAction();
            setResult({
              status: r.status === "success" ? "success" : "error",
              message: r.message,
            });
          })
        }
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-surface text-sm font-semibold text-foreground transition-colors hover:border-brand/40 hover:text-brand disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MailCheck className="h-4 w-4" />
        )}
        {t("resend")}
      </button>
    </div>
  );
}
