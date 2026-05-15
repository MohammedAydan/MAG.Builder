import type { ReactNode } from 'react';
import type { z } from 'zod';

export const BUILDER_DOCUMENT_SCHEMA = 'nexpress-builder';
export const CURRENT_BUILDER_DOCUMENT_VERSION = 1 as const;

export type JsonPrimitive = boolean | null | number | string;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = {
  [key: string]: JsonValue;
};

export type BuilderSurface = 'admin' | 'public';

export type BuilderExternalBlockRenderArgs = Readonly<{
  block: BuilderKnownBlock;
  context: BuilderRenderContext;
  props: JsonObject;
  type: string;
}>;

export type BuilderExternalBlockRenderer = (args: BuilderExternalBlockRenderArgs) => ReactNode;

export type BuilderRenderContext = Readonly<{
  renderExternalBlock?: BuilderExternalBlockRenderer;
  surface: BuilderSurface;
}>;

export type BuilderBlockInput = Readonly<{
  children?: readonly BuilderBlockInput[] | undefined;
  id: string;
  props?: JsonObject | undefined;
  type: string;
}>;

export type BuilderDocumentMeta = Readonly<{
  migratedFromVersion?: number | null | undefined;
}>;

export type BuilderDocumentInput = Readonly<{
  blocks: readonly BuilderBlockInput[];
  meta?: BuilderDocumentMeta | undefined;
  schema: typeof BUILDER_DOCUMENT_SCHEMA;
  version: number;
}>;

export type BuilderBlockAvailability = Readonly<{
  admin: boolean;
  public: boolean;
}>;

export interface BuilderKnownBlock {
  children: readonly ValidatedBuilderBlock[];
  definition: ResolvedBuilderBlockDefinition;
  id: string;
  kind: 'known';
  props: JsonObject;
  type: string;
}

export interface BuilderUnknownBlock {
  children: readonly ValidatedBuilderBlock[];
  id: string;
  kind: 'unknown';
  props: JsonObject;
  reason: 'unregistered';
  type: string;
}

export interface BuilderInvalidBlock {
  children: readonly ValidatedBuilderBlock[];
  errors: readonly string[];
  id: string;
  kind: 'invalid';
  rawProps: JsonObject;
  reason: 'children-not-supported' | 'invalid-props';
  type: string;
}

export type ValidatedBuilderBlock = BuilderInvalidBlock | BuilderKnownBlock | BuilderUnknownBlock;

export type BuilderBlockDefinition = Readonly<{
  availability?: Partial<BuilderBlockAvailability> | undefined;
  defaultProps?: JsonObject | undefined;
  displayName: string;
  propsSchema: z.ZodType<JsonObject>;
  render: (args: {
    block: BuilderKnownBlock;
    children: ReactNode;
    context: BuilderRenderContext;
    props: JsonObject;
  }) => ReactNode;
  supportsChildren?: boolean | undefined;
  type: string;
}>;

export type ResolvedBuilderBlockDefinition = Readonly<{
  availability: BuilderBlockAvailability;
  defaultProps?: JsonObject | undefined;
  displayName: string;
  propsSchema: z.ZodType<JsonObject>;
  render: BuilderBlockDefinition['render'];
  supportsChildren: boolean;
  type: string;
}>;

export interface BuilderBlockRegistry {
  get(type: string): ResolvedBuilderBlockDefinition | undefined;
  has(type: string): boolean;
  list(): readonly ResolvedBuilderBlockDefinition[];
}

export type ValidatedBuilderDocument = Readonly<{
  blocks: readonly ValidatedBuilderBlock[];
  meta?: BuilderDocumentMeta | undefined;
  schema: typeof BUILDER_DOCUMENT_SCHEMA;
  version: typeof CURRENT_BUILDER_DOCUMENT_VERSION;
}>;

export type BuilderStructureValidationResult =
  | Readonly<{
      document: BuilderDocumentInput;
      success: true;
    }>
  | Readonly<{
      errors: readonly string[];
      success: false;
    }>;

export type BuilderValidationResult =
  | Readonly<{
      document: ValidatedBuilderDocument;
      success: true;
    }>
  | Readonly<{
      errors: readonly string[];
      success: false;
    }>;

export type BuilderMigrationResult =
  | Readonly<{
      document: BuilderDocumentInput;
      migrated: boolean;
      success: true;
    }>
  | Readonly<{
      errors: readonly string[];
      success: false;
    }>;
