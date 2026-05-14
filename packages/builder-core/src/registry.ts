import type { BuilderBlockDefinition, BuilderBlockRegistry, JsonObject, ResolvedBuilderBlockDefinition } from './types';

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeAvailability(entry: BuilderBlockDefinition): ResolvedBuilderBlockDefinition['availability'] {
  return {
    admin: entry.availability?.admin ?? false,
    public: entry.availability?.public ?? true,
  };
}

function toDefinition(entry: BuilderBlockDefinition): ResolvedBuilderBlockDefinition {
  if (!entry.type.trim()) {
    throw new Error('Builder block definitions must have a non-empty type.');
  }

  if (!entry.displayName.trim()) {
    throw new Error(`Builder block "${entry.type}" must have a non-empty displayName.`);
  }

  if (typeof entry.render !== 'function') {
    throw new Error(`Builder block "${entry.type}" must provide a render function.`);
  }

  if (entry.defaultProps !== undefined) {
    if (!isJsonObject(entry.defaultProps)) {
      throw new Error(`Builder block "${entry.type}" defaultProps must be a JSON object.`);
    }

    const defaultProps = entry.propsSchema.safeParse(entry.defaultProps);

    if (!defaultProps.success) {
      const [issue] = defaultProps.error.issues;
      throw new Error(
        `Builder block "${entry.type}" has invalid defaultProps${issue ? `: ${issue.message}` : '.'}`,
      );
    }
  }

  return {
    availability: normalizeAvailability(entry),
    displayName: entry.displayName,
    propsSchema: entry.propsSchema,
    render: entry.render,
    supportsChildren: entry.supportsChildren ?? false,
    type: entry.type,
    ...(entry.defaultProps ? { defaultProps: entry.defaultProps } : {}),
  };
}

export function createBlockRegistry(entries: readonly BuilderBlockDefinition[]): BuilderBlockRegistry {
  const definitions = new Map<string, ResolvedBuilderBlockDefinition>();

  for (const entry of entries) {
    if (definitions.has(entry.type)) {
      throw new Error(`Duplicate builder block type "${entry.type}" is not allowed.`);
    }

    definitions.set(entry.type, toDefinition(entry));
  }

  return {
    get(type) {
      return definitions.get(type);
    },
    has(type) {
      return definitions.has(type);
    },
    list() {
      return [...definitions.values()];
    },
  };
}

export function mergeBlockRegistries(...registries: readonly BuilderBlockRegistry[]) {
  return createBlockRegistry(registries.flatMap((registry) => registry.list()));
}
