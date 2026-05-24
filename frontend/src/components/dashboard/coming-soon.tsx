import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Construction } from "lucide-react";

interface Props {
  locale: string;
  title: string;
  desc: string;
}

export function ComingSoon({ locale, title, desc }: Props) {
  const t = useTranslations("dashboard.common");
  return (
    <div className="mx-auto max-w-2xl py-12 text-center sm:py-20">
      <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand">
        <Construction className="h-7 w-7" />
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-foreground-soft">
        {desc}
      </p>

      <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
        {t("comingSoon")}
      </span>
      <p className="mt-3 text-xs text-muted-foreground">
        {t("comingSoonHint")}
      </p>

      <div className="mt-10">
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-surface px-5 text-sm font-medium text-foreground-soft transition-colors hover:border-brand/40 hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
