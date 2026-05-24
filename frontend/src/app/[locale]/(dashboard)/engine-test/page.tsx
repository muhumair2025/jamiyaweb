import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
  ENGINE_VERSION,
  EnginePage,
  fetchTheme,
  isCompatibleEngine,
  listRegisteredSections,
  validatePageAgainstTheme,
  validateTheme,
  type ThemeMeta,
} from "@/engine";
import { API_URL, apiFetch } from "@/lib/api";
import { getCurrentWebsite } from "@/lib/websites";

interface PageRow {
  id: number;
  slug: string;
  title: string;
  content_json: { sections: Array<{ id: string; type: string; settings: Record<string, unknown> }> };
}

/**
 * Internal diagnostic page — proves the engine pipeline works end-to-end:
 *   1. Load website + theme + homepage from the API
 *   2. Run validators against each payload
 *   3. Render the page via <EnginePage />
 *
 * Until Phase 4 registers real section components, each section renders as
 * the "Section not registered" placeholder — and that's the success signal.
 *
 * Remove (or move under /admin) before shipping to tenants.
 */
export default async function EngineTestPage(
  props: PageProps<"/[locale]/engine-test">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const website = await getCurrentWebsite();
  if (!website || !website.theme) {
    redirect(`/${locale}/dashboard`);
  }

  // ─── Fetch theme + homepage in parallel ──────────────────────────
  const [theme, pageResp] = await Promise.all([
    fetchTheme(website.theme.slug),
    apiFetch<{ data: PageRow }>(
      `/api/websites/${website.id}/pages/${website.homepage?.slug ?? "home"}`
    ),
  ]);
  const page = pageResp.data;

  // ─── Run all validators ──────────────────────────────────────────
  const themeCheck = validateTheme(theme);
  const themeSectionSlugs = theme.sections.map((s) => s.slug);
  const pageCheck = validatePageAgainstTheme(
    page.content_json,
    themeSectionSlugs
  );
  const engineOk = isCompatibleEngine(theme.manifest.engine);

  const registered = listRegisteredSections();
  const sectionsInPage = page.content_json.sections.map((s) => s.type);
  const missingComponents = sectionsInPage.filter(
    (slug) => !registered.includes(slug)
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">
          Engine smoke test
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Engine v{ENGINE_VERSION}
        </h1>
        <p className="mt-2 text-sm text-foreground-soft">
          Proves the engine plumbing (loader → validator → renderer) works on
          your real website. Section components register in the next phase.
        </p>
      </div>

      <Diagnostics
        engineOk={engineOk}
        themeCheck={themeCheck}
        pageCheck={pageCheck}
        theme={theme}
        page={page}
        registered={registered}
        sectionsInPage={sectionsInPage}
        missingComponents={missingComponents}
        apiUrl={API_URL}
      />

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="text-base font-semibold text-foreground">
          Rendered page (via EnginePage)
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Below is the actual{" "}
          <code className="font-mono">&lt;EnginePage /&gt;</code> output — token
          vars in scope, sections rendered (or placeholdered if missing).
        </p>
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-background">
          <EnginePage
            theme={theme}
            overrides={website.tokens}
            page={{ content_json: page.content_json }}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
function Diagnostics({
  engineOk,
  themeCheck,
  pageCheck,
  theme,
  page,
  registered,
  sectionsInPage,
  missingComponents,
  apiUrl,
}: {
  engineOk: boolean;
  themeCheck: ReturnType<typeof validateTheme>;
  pageCheck: ReturnType<typeof validatePageAgainstTheme>;
  theme: ThemeMeta;
  page: PageRow;
  registered: string[];
  sectionsInPage: string[];
  missingComponents: string[];
  apiUrl: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card title="API origin">
        <pre className="overflow-auto font-mono text-xs">{apiUrl}</pre>
      </Card>

      <Card title="Engine compat">
        <Row label="Engine version" value={"v" + theme.manifest.version} />
        <Row label="Theme requires" value={theme.manifest.engine} />
        <Status ok={engineOk} okLabel="Compatible" failLabel="Mismatch" />
      </Card>

      <Card title={`Theme validation — ${theme.slug}`}>
        <Status
          ok={themeCheck.ok}
          okLabel="Valid"
          failLabel={`${themeCheck.issues.length} issue(s)`}
        />
        {!themeCheck.ok && <IssueList issues={themeCheck.issues} />}
      </Card>

      <Card title={`Page validation — ${page.slug}`}>
        <Status
          ok={pageCheck.ok}
          okLabel="Valid"
          failLabel={`${pageCheck.issues.length} issue(s)`}
        />
        {!pageCheck.ok && <IssueList issues={pageCheck.issues} />}
      </Card>

      <Card title="Sections in page">
        <ul className="space-y-1 text-xs">
          {sectionsInPage.map((slug) => {
            const present = registered.includes(slug);
            return (
              <li key={slug} className="flex items-center gap-2">
                <span
                  className={`inline-flex h-1.5 w-1.5 rounded-full ${
                    present ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <code className="font-mono">{slug}</code>
                <span
                  className={
                    present ? "text-emerald-700" : "text-amber-700"
                  }
                >
                  {present ? "registered" : "not registered (placeholder)"}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card title="Registered components">
        {registered.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            None yet — Phase 4 wires the first sections.
          </p>
        ) : (
          <ul className="space-y-1 text-xs">
            {registered.map((slug) => (
              <li key={slug}>
                <code className="font-mono">{slug}</code>
              </li>
            ))}
          </ul>
        )}
        {missingComponents.length > 0 && (
          <p className="mt-3 text-xs text-amber-700">
            {missingComponents.length} section(s) in the page have no component
            yet.
          </p>
        )}
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
      <div className="mt-2 space-y-1.5 text-sm text-foreground">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <code className="font-mono">{value}</code>
    </div>
  );
}

function Status({
  ok,
  okLabel,
  failLabel,
}: {
  ok: boolean;
  okLabel: string;
  failLabel: string;
}) {
  return (
    <p
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
        ok ? "text-emerald-700" : "text-amber-700"
      }`}
    >
      <span
        className={`inline-flex h-1.5 w-1.5 rounded-full ${
          ok ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
      {ok ? okLabel : failLabel}
    </p>
  );
}

function IssueList({
  issues,
}: {
  issues: Array<{ path: string; message: string }>;
}) {
  return (
    <ul className="mt-2 space-y-1 text-xs">
      {issues.map((i, idx) => (
        <li key={idx} className="text-amber-700">
          <code className="font-mono">{i.path}</code> — {i.message}
        </li>
      ))}
    </ul>
  );
}
