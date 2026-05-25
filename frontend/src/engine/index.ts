/**
 * Public engine API. Anything outside `src/engine/` should import from here.
 *
 *   import { EnginePage, validateTheme, fetchTheme, tokenVar } from "@/engine";
 *
 * Importing this barrel ALSO triggers registration of every code-side
 * section component (via `sections/_register.ts`). Sections are then
 * resolvable by slug at render time.
 */

// Side-effect import — registers all section components.
import "@/sections/_register";

// Version + compat
export { ENGINE_VERSION, isCompatibleEngine } from "./core/version";

// Tokens
export { generateCssVars, mergeTokens, tokenVar } from "./core/tokens";

// Validators
export {
  validateManifest,
  validateTokensDefinition,
  validateTheme,
  validateSection,
  validatePageContent,
  validatePageAgainstTheme,
  type ValidationIssue,
} from "./core/validator";

// API loaders (server-only)
export { fetchTheme, fetchThemes, fetchSections } from "./core/loader";

// Component registry
export {
  registerSection,
  getSectionComponent,
  isSectionRegistered,
  listRegisteredSections,
  type SectionComponent,
  type SectionComponentProps,
} from "./component-registry";

// Renderer
export { EnginePage } from "./core/renderer";

// Per-section style system
export { applySectionStyle, maxWidthValue } from "./style/apply";
export {
  BODY_SCALES,
  HEADING_SCALES,
  MAX_WIDTHS,
  STYLE_CSS_VARS,
  type SectionStyle,
  type HeadingSize,
  type BodySize,
} from "./style/types";
export { SectionStyleSchema } from "./style/schema";

// Per-element style system (Elementor-class customisation)
export {
  EngineElement,
  SectionElementProvider,
} from "./element/EngineElement";
export {
  applyElementStyle,
  backgroundOverlayStyle,
} from "./element/apply";
export {
  KIND_FIELDS,
  SHADOW_PRESETS,
  type ElementKind,
  type ElementStyle,
  type SectionElements,
} from "./element/types";
export {
  ElementStyleSchema,
  SectionElementsSchema,
} from "./element/schema";

// Forms — auto-generated edit form for any section
export { SectionForm } from "./forms/section-form";
export { schemaToFields } from "./forms/schema-to-fields";
export {
  fieldsToZodSchema,
  fieldsToDefaultValues,
} from "./forms/schema-to-zod";
export { getFieldWidget } from "./field-types/registry";
export type {
  FieldType,
  FieldConfig,
  FieldWidgetProps,
  SelectOption,
} from "./field-types/types";

// Shared types
export type {
  SectionInstance,
  PageContent,
  TokenType,
  ColorTokenDef,
  FontTokenDef,
  SizeTokenDef,
  TokenDefinition,
  TokensDefinition,
  ResolvedTokens,
  ThemeManifest,
  SectionMeta,
  ThemeSectionRef,
  ThemeMeta,
} from "./types";
