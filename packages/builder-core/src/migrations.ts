import { ZodError } from 'zod';
import { builderDocumentSchema, legacyBuilderDocumentSchema, type LegacyBuilderDocumentInput } from './schema';
import type { BuilderBlockInput, BuilderDocumentInput, BuilderMigrationResult } from './types';

function formatError(error: ZodError) {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'document';
    return `${path}: ${issue.message}`;
  });
}

function migrateLegacyBlocks(blocks: readonly LegacyBuilderDocumentInput['content'][number][]): BuilderBlockInput[] {
  return blocks.map((block) => {
    const nextBlock: {
      children?: BuilderBlockInput[];
      id: string;
      props?: BuilderBlockInput['props'];
      type: string;
    } = {
      id: block.id,
      type: block.kind,
    };

    if (block.config) {
      nextBlock.props = block.config;
    }

    if (block.items && block.items.length > 0) {
      nextBlock.children = migrateLegacyBlocks(block.items);
    }

    return nextBlock;
  });
}

export function migrateBuilderDocument(input: unknown): BuilderMigrationResult {
  const currentDocument = builderDocumentSchema.safeParse(input);

  if (currentDocument.success) {
    return {
      document: currentDocument.data,
      migrated: false,
      success: true,
    };
  }

  const legacyDocument = legacyBuilderDocumentSchema.safeParse(input);

  if (legacyDocument.success) {
    return {
      document: {
        blocks: migrateLegacyBlocks(legacyDocument.data.content),
        meta: {
          migratedFromVersion: legacyDocument.data.version,
        },
        schema: legacyDocument.data.schema,
        version: 1,
      },
      migrated: true,
      success: true,
    };
  }

  if (
    typeof input === 'object' &&
    input !== null &&
    'schema' in input &&
    'version' in input &&
    (input as { schema?: unknown }).schema === 'nexpress-builder' &&
    typeof (input as { version?: unknown }).version === 'number' &&
    (input as { version: number }).version !== 1
  ) {
    return {
      errors: [`Unsupported builder schema version ${(input as { version: number }).version}.`],
      success: false,
    };
  }

  return {
    errors: formatError(currentDocument.error),
    success: false,
  };
}
