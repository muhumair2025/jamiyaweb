import type { z } from "zod";
import { ManifestSchema } from "../schemas/manifest.schema";
import { PageContentSchema } from "../schemas/page.schema";
import { SectionMetaSchema } from "../schemas/section.schema";
import { ThemeMetaSchema } from "../schemas/theme.schema";
import { TokensDefinitionSchema } from "../schemas/tokens.schema";
import { isCompatibleEngine } from "./version";

/** A flat, UI-friendly view of a single validation failure. */
export interface ValidationIssue {
  path: string;
  message: string;
}

/** Convert Zod's nested issues to flat `{path, message}` rows. */
function flattenIssues(issues: readonly z.core.$ZodIssue[]): ValidationIssue[] {
  return issues.map((i) => ({
    path: i.path.length ? i.path.join(".") : "(root)",
    message: i.message,
  }));
}

// ─── Public validators ──────────────────────────────────────────────
export function validateManifest(input: unknown) {
  const result = ManifestSchema.safeParse(input);
  return {
    ok: result.success,
    data: result.success ? result.data : null,
    issues: result.success ? [] : flattenIssues(result.error.issues),
  };
}

export function validateTokensDefinition(input: unknown) {
  const result = TokensDefinitionSchema.safeParse(input);
  return {
    ok: result.success,
    data: result.success ? result.data : null,
    issues: result.success ? [] : flattenIssues(result.error.issues),
  };
}

export function validateTheme(input: unknown) {
  const result = ThemeMetaSchema.safeParse(input);
  const issues: ValidationIssue[] = result.success
    ? []
    : flattenIssues(result.error.issues);

  // Extra check: engine compatibility (semver range)
  if (result.success && !isCompatibleEngine(result.data.manifest.engine)) {
    issues.push({
      path: "manifest.engine",
      message: `Theme requires engine "${result.data.manifest.engine}" but this engine does not satisfy that range.`,
    });
  }

  return {
    ok: result.success && issues.length === 0,
    data: result.success ? result.data : null,
    issues,
  };
}

export function validateSection(input: unknown) {
  const result = SectionMetaSchema.safeParse(input);
  return {
    ok: result.success,
    data: result.success ? result.data : null,
    issues: result.success ? [] : flattenIssues(result.error.issues),
  };
}

export function validatePageContent(input: unknown) {
  const result = PageContentSchema.safeParse(input);
  return {
    ok: result.success,
    data: result.success ? result.data : null,
    issues: result.success ? [] : flattenIssues(result.error.issues),
  };
}

/**
 * Cross-validation: every section instance in the page must reference a slug
 * that exists in the provided theme's section list.
 */
export function validatePageAgainstTheme(
  page: unknown,
  themeSectionSlugs: string[]
) {
  const base = validatePageContent(page);
  if (!base.ok || !base.data) return base;

  const known = new Set(themeSectionSlugs);
  const issues: ValidationIssue[] = [...base.issues];

  base.data.sections.forEach((s, idx) => {
    if (!known.has(s.type)) {
      issues.push({
        path: `sections.${idx}.type`,
        message: `Unknown section "${s.type}" — not part of this theme.`,
      });
    }
  });

  return {
    ok: issues.length === 0,
    data: base.data,
    issues,
  };
}
