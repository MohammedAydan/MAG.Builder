import {
  BUILDER_DOCUMENT_SCHEMA,
  CURRENT_BUILDER_DOCUMENT_VERSION,
  type JsonObject,
  type JsonValue,
  migrateBuilderDocument,
  type BuilderBlockInput,
  type BuilderBlockRegistry,
  type BuilderDocumentInput,
  type ValidatedBuilderBlock,
  validateBuilderDocument,
  validateBuilderDocumentStructure,
} from '@nexpress/builder-core';
import type { EditorComponentData, EditorConversionResult, EditorData } from './types';

function createEmptyEditorData(): EditorData {
  return {
    content: [],
    root: {},
  };
}

function isJsonValue(value: unknown): value is JsonValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every((entry) => isJsonValue(entry));
  }

  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).every((entry) => isJsonValue(entry));
  }

  return false;
}

function toJsonObject(input: Record<string, unknown>): JsonObject {
  const output: Record<string, JsonValue> = {};

  for (const [key, value] of Object.entries(input)) {
    if (isJsonValue(value)) {
      output[key] = value;
    }
  }

  return output;
}

function toEditorComponent(block: ValidatedBuilderBlock, warnings: string[]): EditorComponentData | null {
  if (block.kind !== 'known') {
    warnings.push(`Dropped unsupported builder block "${block.type}" while opening the visual editor.`);
    return null;
  }

  const props: Record<string, unknown> = {
    id: block.id,
    ...block.props,
  };

  if (block.definition.supportsChildren) {
    props.content = block.children
      .map((child) => toEditorComponent(child, warnings))
      .filter((child): child is EditorComponentData => child !== null);
  }

  return {
    props: props as EditorComponentData['props'],
    type: block.type,
  };
}

export function builderDocumentToEditorData(
  input: unknown,
  registry: BuilderBlockRegistry,
): EditorConversionResult {
  if (input == null) {
    return {
      data: createEmptyEditorData(),
      warnings: ['This page does not have builder JSON yet. The visual editor is starting from an empty draft.'],
    };
  }

  const migrated = migrateBuilderDocument(input);

  if (!migrated.success) {
    return {
      data: createEmptyEditorData(),
      warnings: [
        'The existing builder document could not be migrated safely. The visual editor is starting from an empty draft.',
      ],
    };
  }

  const validated = validateBuilderDocument(migrated.document, registry);

  if (!validated.success) {
    return {
      data: createEmptyEditorData(),
      warnings: ['The existing builder document is invalid. The visual editor is starting from an empty draft.'],
    };
  }

  const warnings: string[] = [];

  return {
    data: {
      content: validated.document.blocks
        .map((block) => toEditorComponent(block, warnings))
        .filter((block): block is EditorComponentData => block !== null),
      root: {},
    },
    warnings,
  };
}

function toBuilderBlock(component: EditorComponentData, registry: BuilderBlockRegistry): BuilderBlockInput | null {
  const definition = registry.get(component.type);

  if (!definition) {
    return null;
  }

  const { content, id, ...restProps } = component.props;
  const nextBlock: {
    children?: BuilderBlockInput[];
    id: string;
    props: JsonObject;
    type: string;
  } = {
    id,
    props: toJsonObject(restProps),
    type: component.type,
  };

  if (definition.supportsChildren && Array.isArray(content)) {
    const nextChildren = content
      .map((child) => toBuilderBlock(child, registry))
      .filter((child): child is BuilderBlockInput => child !== null);

    if (nextChildren.length > 0) {
      nextBlock.children = nextChildren;
    }
  }

  return nextBlock;
}

export function editorDataToBuilderDocument(
  data: EditorData,
  registry: BuilderBlockRegistry,
  version = CURRENT_BUILDER_DOCUMENT_VERSION,
) {
  const document: BuilderDocumentInput = {
    blocks: data.content
      .map((component) => toBuilderBlock(component, registry))
      .filter((component): component is BuilderBlockInput => component !== null),
    schema: BUILDER_DOCUMENT_SCHEMA,
    version,
  };

  return validateBuilderDocumentStructure(document);
}
