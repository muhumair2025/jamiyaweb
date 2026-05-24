import { setRequestLocale } from "next-intl/server";
import { fetchSections } from "@/engine";
import { FormsPlayground } from "./playground";

export default async function FormsTestPage(
  props: PageProps<"/[locale]/forms-test">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const sections = await fetchSections();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">
          Engine forms smoke test
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Auto-form playground
        </h1>
        <p className="mt-2 text-sm text-foreground-soft">
          Pick a section — the engine parses its{" "}
          <code className="font-mono text-xs">schema_json</code>, renders a form
          with the right widget for each field, validates with Zod, and shows
          the live values JSON beside it.
        </p>
      </div>

      <FormsPlayground sections={sections} />
    </div>
  );
}
