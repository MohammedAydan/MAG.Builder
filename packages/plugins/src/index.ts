export {
  assertValidPluginManifest,
  validatePluginManifest,
} from './manifest';
export {
  createPluginRegistry,
  planPluginMigrations,
  resolvePluginCapabilities,
} from './registry';
export {
  defaultPluginRegistry,
  localPluginDefinitions,
} from './local-plugins';
export {
  CURRENT_PLUGIN_API_VERSION,
  CURRENT_PLUGIN_MANIFEST_VERSION,
  PLUGIN_CAPABILITIES,
  PLUGIN_MANIFEST_SCHEMA,
  type PluginActivationInput,
  type PluginActivationValidationResult,
  type PluginCapability,
  type PluginCapabilitySnapshot,
  type PluginDefinition,
  type PluginDependency,
  type PluginManifest,
  type PluginMetadataValue,
  type PluginMigrationManifest,
  type PluginMigrationPlan,
  type PluginMigrationPlanEntry,
  type PluginMigrationRecord,
  type PluginModuleManifest,
  type PluginRegistry,
  type PluginStateSnapshot,
} from './types';
