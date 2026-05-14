export const PLUGIN_MANIFEST_SCHEMA = 'nexpress-plugin-manifest' as const;
export const CURRENT_PLUGIN_MANIFEST_VERSION = 1 as const;
export const CURRENT_PLUGIN_API_VERSION = 1 as const;

export const PLUGIN_CAPABILITIES = [
  'builder:blocks',
  'commerce:catalog',
  'content:posts',
  'forms:submissions',
  'members:protected-routes',
  'seo:metadata',
] as const;

export type PluginCapability = (typeof PLUGIN_CAPABILITIES)[number];

export type PluginMetadataValue =
  | boolean
  | number
  | string
  | null
  | PluginMetadataValue[]
  | { readonly [key: string]: PluginMetadataValue };

export type PluginDependency = Readonly<{
  pluginId: string;
  versionRange?: string;
}>;

export type PluginModuleManifest = Readonly<{
  capabilities: readonly PluginCapability[];
  description: string;
  enabledByDefault?: boolean;
  id: string;
  name: string;
}>;

export type PluginMigrationManifest = Readonly<{
  description: string;
  destructive?: boolean;
  id: string;
  name: string;
  version: string;
}>;

export type PluginManifest = Readonly<{
  capabilities: readonly PluginCapability[];
  compatibility: Readonly<{
    pluginApiVersion: typeof CURRENT_PLUGIN_API_VERSION;
    platform: 'nexpress';
  }>;
  conflicts?: readonly string[];
  dependencies?: readonly PluginDependency[];
  description: string;
  id: string;
  manifestVersion: typeof CURRENT_PLUGIN_MANIFEST_VERSION;
  metadata?: Readonly<Record<string, PluginMetadataValue>>;
  modules?: readonly PluginModuleManifest[];
  migrations?: readonly PluginMigrationManifest[];
  name: string;
  schema: typeof PLUGIN_MANIFEST_SCHEMA;
  version: string;
}>;

export type PluginDefinition = Readonly<{
  manifest: PluginManifest;
  source: 'local';
}>;

export type PluginActivationInput = Readonly<{
  enabledModules?: readonly string[];
  pluginId: string;
}>;

export type PluginActivationValidationSuccess = Readonly<{
  manifest: PluginManifest;
  pluginId: string;
  resolvedCapabilities: readonly PluginCapability[];
  resolvedModuleIds: readonly string[];
  success: true;
}>;

export type PluginActivationValidationFailure = Readonly<{
  errors: readonly string[];
  success: false;
}>;

export type PluginActivationValidationResult =
  | PluginActivationValidationFailure
  | PluginActivationValidationSuccess;

export type PluginMigrationRecord = Readonly<{
  executedAt?: string;
  id: string;
  status: 'applied' | 'pending';
  version: string;
}>;

export type PluginMigrationPlanEntry = Readonly<{
  definition: PluginMigrationManifest;
  executedAt?: string;
  status: 'applied' | 'pending';
}>;

export type PluginMigrationPlan = Readonly<{
  pending: readonly PluginMigrationPlanEntry[];
  pluginId: string;
  steps: readonly PluginMigrationPlanEntry[];
}>;

export type PluginStateSnapshot = Readonly<{
  enabled: boolean;
  enabledModules: readonly string[];
  migrations?: readonly PluginMigrationRecord[];
  pluginId: string;
}>;

export type PluginCapabilitySnapshot = Readonly<{
  capabilities: readonly PluginCapability[];
  enabled: boolean;
  enabledModules: readonly string[];
  pluginId: string;
}>;

export type PluginRegistry = Readonly<{
  get: (pluginId: string) => PluginDefinition | undefined;
  has: (pluginId: string) => boolean;
  list: () => readonly PluginDefinition[];
  listIds: () => readonly string[];
  resolveCapabilitySnapshot: (state: PluginStateSnapshot) => PluginCapabilitySnapshot;
  validateActivation: (
    input: PluginActivationInput,
    activeStates?: readonly PluginStateSnapshot[],
  ) => PluginActivationValidationResult;
}>;
