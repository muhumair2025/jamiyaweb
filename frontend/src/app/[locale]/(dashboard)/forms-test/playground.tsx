"use client";

import { useMemo, useState } from "react";
import { SectionForm } from "@/engine/forms/section-form";
import type { SectionMeta } from "@/engine/types";

export function FormsPlayground({ sections }: { sections: SectionMeta[] }) {
  const [selectedSlug, setSelectedSlug] = useState<string>(
    sections[0]?.slug ?? ""
  );
  const [liveValues, setLiveValues] = useState<Record<string, unknown> | null>(
    null
  );
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(
    null
  );

  const section = useMemo(
    () => sections.find((s) => s.slug === selectedSlug),
    [sections, selectedSlug]
  );

  if (sections.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        No sections found. Seed the engine first.
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      {/* Form panel */}
      <div className="space-y-4">
        <div className="grid gap-1.5">
          <label
            htmlFor="section-pick"
            className="text-[13px] font-medium text-foreground"
          >
            Section
          </label>
          <select
            id="section-pick"
            value={selectedSlug}
            onChange={(e) => {
              setSelectedSlug(e.target.value);
              setLiveValues(null);
              setSubmitted(null);
            }}
            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
          >
            {sections.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name} ({s.slug})
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft sm:p-6">
          {section && (
            <SectionForm
              section={section}
              onChange={setLiveValues}
              onSubmit={(values) => setSubmitted(values)}
              submitLabel="Validate & submit"
            />
          )}
        </div>
      </div>

      {/* JSON preview panel */}
      <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <JsonCard
          title="Live values (as you type)"
          subtitle="Forwarded from the form's onChange handler."
          data={liveValues}
        />
        <JsonCard
          title="Last successful submit"
          subtitle="Captured after Zod validation passes."
          data={submitted}
          accent
        />
        <JsonCard
          title="Section schema (from API)"
          subtitle="What the engine parsed into fields."
          data={section?.schema ?? null}
          collapsed
        />
      </div>
    </div>
  );
}

function JsonCard({
  title,
  subtitle,
  data,
  accent,
  collapsed,
}: {
  title: string;
  subtitle?: string;
  data: unknown;
  accent?: boolean;
  collapsed?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-surface p-5 shadow-soft ${
        accent ? "border-brand/30" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      <pre
        dir="ltr"
        className={`mt-3 max-h-[360px] overflow-auto rounded-lg border border-border bg-background p-3 font-mono text-[11px] leading-relaxed text-foreground ${
          collapsed ? "max-h-32" : ""
        }`}
      >
        {data ? JSON.stringify(data, null, 2) : <span className="text-muted-foreground">— nothing yet —</span>}
      </pre>
    </div>
  );
}
