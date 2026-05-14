import { ZodError } from 'zod';
import { builderDocumentSchema } from './schema';
import { migrateBuilderDocument } from './migrations';
import type {
  BuilderBlockInput,
  BuilderBlockRegistry,
  BuilderStructureValidationResult,
  BuilderValidationResult,
  ValidatedBuilderBlock,
} from './types';

function formatError(error: ZodError) {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'document';
    return `${path}: ${issue.message}`;
  });
}

function validateBlock(block: BuilderBlockInput, registry: BuilderBlockRegistry): ValidatedBuilderBlock {
  const children = (block.children ?? []).map((child) => validateBlock(child, registry));
  const definition = registry.get(block.type);

  if (!definition) {
    return {
      children,
      id: block.id,
      kind: 'unknown',
      props: block.props ?? {},
      reason: 'unregistered',
      type: block.type,
    };
  }

  if (!definition.supportsChildren && children.length > 0) {
    return {
      children,
      errors: [`Block "${block.type}" does not allow child blocks.`],
      id: block.id,
      kind: 'invalid',
      rawProps: block.props ?? {},
      reason: 'children-not-supported',
      type: block.type,
    };
  }

  const mergedProps = definition.defaultProps ? { ...definition.defaultProps, ...(block.props ?? {}) } : (block.props ?? {});
  const parsedProps = definition.propsSchema.safeParse(mergedProps);

  if (!parsedProps.success) {
    return {
      children,
      errors: formatError(parsedProps.error),
      id: block.id,
      kind: 'invalid',
      rawProps: block.props ?? {},
      reason: 'invalid-props',
      type: block.type,
    };
  }

  return {
    children,
    definition,
    id: block.id,
    kind: 'known',
    props: parsedProps.data,
    type: block.type,
  };
}

export function validateBuilderDocumentStructure(input: unknown): BuilderStructureValidationResult {
  const migrated = migrateBuilderDocument(input);

  if (!migrated.success) {
    return migrated;
  }

  const parsedDocument = builderDocumentSchema.safeParse(migrated.document);

  if (!parsedDocument.success) {
    return {
      errors: formatError(parsedDocument.error),
      success: false,
    };
  }

  return {
    document: parsedDocument.data,
    success: true,
  };
}

export function validateBuilderDocument(input: unknown, registry: BuilderBlockRegistry): BuilderValidationResult {
  const structuralValidation = validateBuilderDocumentStructure(input);

  if (!structuralValidation.success) {
    return structuralValidation;
  }

  const document = {
    blocks: structuralValidation.document.blocks.map((block) => validateBlock(block, registry)),
    schema: structuralValidation.document.schema,
    version: 1 as const,
    ...(structuralValidation.document.meta ? { meta: structuralValidation.document.meta } : {}),
  };

  return {
    document,
    success: true,
  };
}
