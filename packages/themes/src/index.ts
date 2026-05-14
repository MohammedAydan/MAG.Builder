export {
  createThemeRegistry,
  defaultPublicTheme,
  defaultThemeRegistry,
  resolveThemeVariables,
} from './registry';
export {
  assertValidTemplateManifest,
  stringifyTemplateManifest,
  validateTemplateManifest,
} from './template-manifest';
export { starterTemplateManifest } from './demo';
export {
  CURRENT_TEMPLATE_MANIFEST_VERSION,
  DEFAULT_PUBLIC_THEME_ID,
  TEMPLATE_MANIFEST_SCHEMA,
  type PublicThemeDefinition,
  type PublicThemeMode,
  type PublicThemeTokens,
  type TemplateContentStatus,
  type TemplateManifest,
  type TemplateManifestValidationOptions,
  type TemplateManifestValidationResult,
  type TemplatePageEntry,
  type TemplatePostEntry,
  type TemplateRedirectEntry,
  type TemplateResourceManifest,
  type TemplateSeoFields,
  type ThemeRegistry,
  type ThemeVariableMap,
  type ThemeVariableName,
} from './types';
