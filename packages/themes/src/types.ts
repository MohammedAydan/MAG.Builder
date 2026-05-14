import { BUILDER_DOCUMENT_SCHEMA, CURRENT_BUILDER_DOCUMENT_VERSION } from '@nexpress/builder-core';
import type { BuilderBlockRegistry, BuilderDocumentInput } from '@nexpress/builder-core';

export const TEMPLATE_MANIFEST_SCHEMA = 'nexpress-template-manifest';
export const CURRENT_TEMPLATE_MANIFEST_VERSION = 1 as const;
export const DEFAULT_PUBLIC_THEME_ID = 'nexpress-default';

export type PublicThemeMode = 'dark' | 'light';
export type ThemeVariableName = `--${string}`;
export type ThemeVariableMap = Readonly<Record<ThemeVariableName, string>>;
export type ThemeScale = Readonly<Record<string, string>>;

export type PublicThemeTokens = Readonly<{
  colorModes: Readonly<Record<PublicThemeMode, ThemeScale>>;
  layout: ThemeScale;
  radius: ThemeScale;
  shadow: ThemeScale;
  spacing: ThemeScale;
  typography: ThemeScale;
}>;

export type PublicThemeDefinition = Readonly<{
  description?: string;
  id: string;
  label: string;
  tokens: PublicThemeTokens;
}>;

export interface ThemeRegistry {
  get(id: string): PublicThemeDefinition | undefined;
  has(id: string): boolean;
  list(): readonly PublicThemeDefinition[];
}

export type TemplateSeoFields = Readonly<{
  canonicalUrl?: string;
  metaDescription?: string;
  metaTitle?: string;
  noFollow?: boolean;
  noIndex?: boolean;
}>;

export type TemplateContentStatus = 'draft' | 'published';

export type TemplatePageEntry = Readonly<{
  body: string;
  builder?: BuilderDocumentInput;
  excerpt?: string;
  seo?: TemplateSeoFields;
  slug: string;
  status: TemplateContentStatus;
  title: string;
}>;

export type TemplatePostEntry = Readonly<{
  body: string;
  excerpt?: string;
  seo?: TemplateSeoFields;
  slug: string;
  status: TemplateContentStatus;
  title: string;
}>;

export type TemplateRedirectEntry = Readonly<{
  destinationPath: string;
  isActive: boolean;
  sourcePath: string;
  type: '301' | '302';
}>;

export type TemplateResourceManifest = Readonly<{
  assetUrls: readonly string[];
}>;

export type TemplateManifest = Readonly<{
  compatibility: Readonly<{
    builderSchema: typeof BUILDER_DOCUMENT_SCHEMA;
    builderVersion: typeof CURRENT_BUILDER_DOCUMENT_VERSION;
  }>;
  content: Readonly<{
    pages: readonly TemplatePageEntry[];
    posts: readonly TemplatePostEntry[];
    redirects: readonly TemplateRedirectEntry[];
  }>;
  metadata: Readonly<{
    demo?: boolean;
    description?: string;
    id: string;
    label: string;
    tags: readonly string[];
  }>;
  requiredBlocks: readonly string[];
  resources: TemplateResourceManifest;
  schema: typeof TEMPLATE_MANIFEST_SCHEMA;
  theme: Readonly<{
    id: string;
  }>;
  version: typeof CURRENT_TEMPLATE_MANIFEST_VERSION;
}>;

export type TemplateManifestValidationOptions = Readonly<{
  blockRegistry: BuilderBlockRegistry;
  themeRegistry?: ThemeRegistry;
}>;

export type TemplateManifestValidationResult =
  | Readonly<{
      manifest: TemplateManifest;
      success: true;
    }>
  | Readonly<{
      errors: readonly string[];
      success: false;
    }>;
