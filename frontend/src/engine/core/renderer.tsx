import type { CSSProperties } from "react";
import {
  getSectionComponent,
  type SectionComponent,
} from "../component-registry";
import { applySectionStyle } from "../style/apply";
import { SectionElementProvider } from "../element/EngineElement";
import type {
  PageContent,
  ResolvedTokens,
  SectionInstance,
  ThemeMeta,
} from "../types";
import { generateCssVars, mergeTokens } from "./tokens";
import { findFont, googleFontUrl } from "../fonts/registry";

interface EnginePageProps {
  /** Full theme object as returned by /api/themes/{slug}. */
  theme: ThemeMeta;
  /** Per-tenant token overrides (from `websites.tokens_json`). */
  overrides?: Record<string, string> | null;
  /** The page being rendered. */
  page: { content_json: PageContent };
  /** Optional flag passed through to section components (true inside the builder iframe). */
  builderMode?: boolean;
}

/**
 * Server (or client) component that renders a tenant page from its JSON.
 *
 *   1. Merge theme.tokens defaults with the website's overrides.
 *   2. Spread the resolved tokens as CSS variables on a wrapper element.
 *   3. For each section in content_json.sections, look up the React component
 *      by slug and render it with the section's settings.
 *   4. Unregistered sections render a debug placeholder in dev (nothing in prod).
 */
export function EnginePage({
  theme,
  overrides,
  page,
  builderMode,
}: EnginePageProps) {
  const tokens = mergeTokens(theme.tokens, overrides);
  const cssVars = generateCssVars(tokens) as CSSProperties;

  // Collect every Google Font referenced by element-level font_family
  // overrides on this page, so we can inject their stylesheets server-side.
  // (Tokens-driven theme fonts ship via the global theme CSS; this is for
  // per-element picker selections.)
  const fontLinks = collectFontLinks(page.content_json);

  return (
    <div data-jw-engine={theme.slug} style={cssVars}>
      {fontLinks.map((href) => (
        // eslint-disable-next-line @next/next/no-css-tags
        <link key={href} rel="stylesheet" href={href} />
      ))}
      {page.content_json.sections.map((section) => (
        <RenderedSection
          key={section.id}
          section={section}
          tokens={tokens}
          builderMode={builderMode}
        />
      ))}
    </div>
  );
}

/** Extract the primary family from `'Cairo', sans-serif` → `Cairo`. */
function primaryFamily(fontFamily: string | undefined | null): string | null {
  if (!fontFamily) return null;
  const first = fontFamily.split(",")[0].trim();
  return first.replace(/^['"]|['"]$/g, "");
}

/** Walk content_json and return distinct Google Font stylesheet URLs to load. */
function collectFontLinks(content: PageContent): string[] {
  const urls = new Set<string>();
  for (const section of content.sections) {
    if (!section.elements) continue;
    for (const style of Object.values(section.elements)) {
      const fam = primaryFamily(style?.font_family);
      if (!fam) continue;
      const entry = findFont(fam);
      if (entry) urls.add(googleFontUrl(entry));
    }
  }
  return Array.from(urls);
}

function RenderedSection({
  section,
  tokens,
  builderMode,
}: {
  section: SectionInstance;
  tokens: ResolvedTokens;
  builderMode?: boolean;
}) {
  const Component: SectionComponent | null = getSectionComponent(section.type);

  if (!Component) {
    return <UnknownSection slug={section.type} sectionId={section.id} />;
  }

  const styleProps = applySectionStyle(section.style);

  const wrapperProps = builderMode
    ? {
        "data-jw-section-id": section.id,
        "data-jw-section-type": section.type,
      }
    : undefined;

  return (
    <div {...wrapperProps} style={styleProps}>
      <SectionElementProvider
        sectionId={section.id}
        elements={section.elements ?? {}}
        builderMode={builderMode ?? false}
      >
        <Component
          settings={section.settings}
          tokens={tokens}
          sectionId={section.id}
        />
      </SectionElementProvider>
    </div>
  );
}

/** Dev-only diagnostic when a page references a slug we don't have a component for. */
function UnknownSection({
  slug,
  sectionId,
}: {
  slug: string;
  sectionId: string;
}) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <div className="my-2 rounded-md border border-dashed border-amber-300 bg-amber-50 p-4 text-sm">
      <p className="font-semibold text-amber-800">
        Section <code className="font-mono">{slug}</code> is not registered.
      </p>
      <p className="mt-1 text-xs text-amber-700">
        Add it with{" "}
        <code className="font-mono">
          registerSection(&quot;{slug}&quot;, ...)
        </code>{" "}
        in a barrel imported at app boot. Instance id:{" "}
        <code className="font-mono">{sectionId}</code>
      </p>
    </div>
  );
}
