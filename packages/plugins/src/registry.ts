import {
  assertValidPluginManifest,
  validatePluginManifest,
} from './manifest';
import type {
  PluginActivationInput,
  PluginActivationValidationResult,
  PluginCapability,
  PluginCapabilitySnapshot,
  PluginDefinition,
  PluginManifest,
  PluginMigrationPlan,
  PluginMigrationRecord,
  PluginRegistry,
  PluginStateSnapshot,
} from './types';

function resolveModuleIds(
  manifest: PluginManifest,
  enabledModules: readonly string[] | undefined,
) {
  const modules = manifest.modules ?? [];
  const moduleMap = new Map(modules.map((moduleEntry) => [moduleEntry.id, moduleEntry] as const));
  const requested = enabledModules ?? modules.filter((moduleEntry) => moduleEntry.enabledByDefault === true).map((moduleEntry) => moduleEntry.id);
  const errors: string[] = [];
  const normalized = new Set<string>();

  for (const moduleId of requested) {
    if (!moduleMap.has(moduleId)) {
      errors.push(`Unknown module "${moduleId}" for plugin "${manifest.id}".`);
      continue;
    }

    normalized.add(moduleId);
  }

  return {
    errors,
    moduleIds: [...normalized].sort(),
  };
}

export function resolvePluginCapabilities(
  manifest: PluginManifest,
  enabledModules: readonly string[] | undefined,
) {
  const { errors, moduleIds } = resolveModuleIds(manifest, enabledModules);

  if (errors.length > 0) {
    return {
      errors,
      success: false as const,
    };
  }

  const capabilities = new Set<PluginCapability>(manifest.capabilities);
  const moduleMap = new Map((manifest.modules ?? []).map((moduleEntry) => [moduleEntry.id, moduleEntry] as const));

  for (const moduleId of moduleIds) {
    for (const capability of moduleMap.get(moduleId)?.capabilities ?? []) {
      capabilities.add(capability);
    }
  }

  return {
    capabilities: [...capabilities].sort(),
    moduleIds,
    success: true as const,
  };
}

export function planPluginMigrations(
  manifest: PluginManifest,
  appliedMigrations: readonly PluginMigrationRecord[] | undefined,
): PluginMigrationPlan {
  const appliedMap = new Map((appliedMigrations ?? []).map((migration) => [migration.id, migration] as const));
  const steps = (manifest.migrations ?? []).map((migration) => {
    const existing = appliedMap.get(migration.id);

    return {
      definition: migration,
      ...(existing?.executedAt ? { executedAt: existing.executedAt } : {}),
      status: existing?.status === 'applied' ? 'applied' : 'pending',
    } as const;
  });

  return {
    pending: steps.filter((step) => step.status === 'pending'),
    pluginId: manifest.id,
    steps,
  };
}

function resolveActiveStateMap(activeStates: readonly PluginStateSnapshot[] | undefined) {
  const map = new Map<string, PluginStateSnapshot>();

  for (const state of activeStates ?? []) {
    if (state.enabled) {
      map.set(state.pluginId, state);
    }
  }

  return map;
}

function validateDependenciesAndConflicts(
  manifest: PluginManifest,
  activeMap: ReadonlyMap<string, PluginStateSnapshot>,
) {
  const errors: string[] = [];

  for (const dependency of manifest.dependencies ?? []) {
    if (!activeMap.has(dependency.pluginId)) {
      errors.push(`Plugin "${manifest.id}" requires "${dependency.pluginId}" to be enabled first.`);
    }
  }

  for (const conflictId of manifest.conflicts ?? []) {
    if (activeMap.has(conflictId)) {
      errors.push(`Plugin "${manifest.id}" conflicts with enabled plugin "${conflictId}".`);
    }
  }

  return errors;
}

export function createPluginRegistry(entries: readonly PluginDefinition[]): PluginRegistry {
  const definitions = new Map<string, PluginDefinition>();

  for (const entry of entries) {
    const validation = validatePluginManifest(entry.manifest);

    if (!validation.success) {
      throw new Error(`Invalid plugin manifest: ${validation.errors.join('; ')}`);
    }

    const manifest = validation.manifest;

    if (definitions.has(manifest.id)) {
      throw new Error(`Duplicate plugin id "${manifest.id}" is not allowed.`);
    }

    definitions.set(manifest.id, {
      manifest: assertValidPluginManifest(manifest),
      source: entry.source,
    });
  }

  for (const definition of definitions.values()) {
    for (const dependency of definition.manifest.dependencies ?? []) {
      if (!definitions.has(dependency.pluginId)) {
        throw new Error(
          `Plugin "${definition.manifest.id}" depends on unknown plugin "${dependency.pluginId}".`,
        );
      }
    }

    for (const conflictId of definition.manifest.conflicts ?? []) {
      if (!definitions.has(conflictId)) {
        throw new Error(
          `Plugin "${definition.manifest.id}" conflicts with unknown plugin "${conflictId}".`,
        );
      }
    }
  }

  return {
    get(pluginId) {
      return definitions.get(pluginId);
    },
    has(pluginId) {
      return definitions.has(pluginId);
    },
    list() {
      return [...definitions.values()].sort((left, right) =>
        left.manifest.id.localeCompare(right.manifest.id),
      );
    },
    listIds() {
      return [...definitions.keys()].sort();
    },
    resolveCapabilitySnapshot(state: PluginStateSnapshot): PluginCapabilitySnapshot {
      const definition = definitions.get(state.pluginId);

      if (!definition || !state.enabled) {
        return {
          capabilities: [],
          enabled: false,
          enabledModules: state.enabledModules,
          pluginId: state.pluginId,
        };
      }

      const resolved = resolvePluginCapabilities(
        definition.manifest,
        state.enabledModules,
      );

      if (!resolved.success) {
        return {
          capabilities: [],
          enabled: false,
          enabledModules: state.enabledModules,
          pluginId: state.pluginId,
        };
      }

      return {
        capabilities: resolved.capabilities,
        enabled: true,
        enabledModules: resolved.moduleIds,
        pluginId: state.pluginId,
      };
    },
    validateActivation(
      input: PluginActivationInput,
      activeStates?: readonly PluginStateSnapshot[],
    ): PluginActivationValidationResult {
      const definition = definitions.get(input.pluginId);

      if (!definition) {
        return {
          errors: [`Unknown plugin "${input.pluginId}".`],
          success: false,
        };
      }

      const activeMap = resolveActiveStateMap(activeStates);
      activeMap.delete(input.pluginId);

      const dependencyAndConflictErrors = validateDependenciesAndConflicts(
        definition.manifest,
        activeMap,
      );
      const capabilityResult = resolvePluginCapabilities(
        definition.manifest,
        input.enabledModules,
      );

      if (!capabilityResult.success) {
        return {
          errors: [...dependencyAndConflictErrors, ...capabilityResult.errors],
          success: false,
        };
      }

      const reverseConflictErrors = [...activeMap.keys()]
        .map((pluginId) => definitions.get(pluginId))
        .filter((value): value is PluginDefinition => Boolean(value))
        .filter((activeDefinition) =>
          (activeDefinition.manifest.conflicts ?? []).includes(definition.manifest.id),
        )
        .map(
          (activeDefinition) =>
            `Enabled plugin "${activeDefinition.manifest.id}" conflicts with "${definition.manifest.id}".`,
        );

      const errors = [
        ...dependencyAndConflictErrors,
        ...reverseConflictErrors,
      ];

      if (errors.length > 0) {
        return {
          errors,
          success: false,
        };
      }

      return {
        manifest: definition.manifest,
        pluginId: definition.manifest.id,
        resolvedCapabilities: capabilityResult.capabilities,
        resolvedModuleIds: capabilityResult.moduleIds,
        success: true,
      };
    },
  };
}
