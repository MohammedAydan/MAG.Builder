import { coreBlockRegistry, validateBuilderDocument, validateBuilderDocumentStructure } from '@nexpress/builder-core';

export const publicBuilderRegistry = coreBlockRegistry;

export function validateBuilderFieldValue(value: unknown) {
  if (value == null) {
    return true;
  }

  const result = validateBuilderDocumentStructure(value);

  return result.success ? true : result.errors[0] ?? 'Builder document is invalid.';
}

export function validatePublishedBuilderDocument(value: unknown) {
  return validateBuilderDocument(value, publicBuilderRegistry);
}
