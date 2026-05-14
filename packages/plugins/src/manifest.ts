import { z } from 'zod';
import {
  CURRENT_PLUGIN_API_VERSION,
  CURRENT_PLUGIN_MANIFEST_VERSION,
  PLUGIN_CAPABILITIES,
  PLUGIN_MANIFEST_SCHEMA,
  type PluginManifest,
  type PluginMetadataValue,
} from './types';

const normalizedProtectedKeys = new Set([
  'accesstoken',
  'admintoken',
  'apikey',
  'authorization',
  'command',
  'cookie',
  'databaseurl',
  'env',
  'hook',
  'hooks',
  'password',
  'payloadsecret',
  'privateconfig',
  'privatekey',
  'script',
  'scripts',
  'secret',
  'shell',
  'token',
]);

const forbiddenStringPattern =
  /(<\/?[a-z][^>]*>)|(<script\b)|(<iframe\b)|(javascript:)|(data:text\/html)|(eval\()|(new Function)|(\bprocess\.env\b)|(\bPAYLOAD_SECRET\b)|(\bDATABASE_URL\b)|(\btoken\b)|(\bpassword\b)|(\bshell\b)|(\bcurl\s+https?:\/\/)|(\bnpm\s+(install|exec|run)\b)|(\bpnpm\s+(install|exec|run)\b)/i;

const pluginIdSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Plugin id must contain lowercase letters, numbers, and hyphens only.');

const versionSchema = z
  .string()
  .trim()
  .regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, 'Version must be an explicit semver string.');

const safeTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine((value) => !forbiddenStringPattern.test(value), 'Unsafe HTML, executable content, secrets, or shell-like commands are not allowed.');

const safeDescriptionSchema = z
  .string()
  .trim()
  .min(1)
  .max(1000)
  .refine((value) => !forbiddenStringPattern.test(value), 'Unsafe HTML, executable content, secrets, or shell-like commands are not allowed.');

const metadataValueSchema: z.ZodType<PluginMetadataValue> = z.lazy(() =>
  z.union([
    z.string().max(500).refine((value) => !forbiddenStringPattern.test(value), 'Unsafe metadata content is not allowed.'),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(metadataValueSchema).max(50),
    z.record(z.string(), metadataValueSchema),
  ]),
);

const metadataSchema = z
  .record(
    z
      .string()
      .regex(/^[a-z0-9]+:[a-z0-9-]+$/, 'Metadata keys must use a safe namespace such as "vendor:key".'),
    metadataValueSchema,
  )
  .optional();

const rawPluginManifestSchema = z
  .object({
    capabilities: z.array(z.enum(PLUGIN_CAPABILITIES)).max(50),
    compatibility: z
      .object({
        platform: z.literal('nexpress'),
        pluginApiVersion: z.literal(CURRENT_PLUGIN_API_VERSION),
      })
      .strict(),
    conflicts: z.array(pluginIdSchema).max(50).optional(),
    dependencies: z
      .array(
        z
          .object({
            pluginId: pluginIdSchema,
            versionRange: z.string().trim().max(100).optional(),
          })
          .strict(),
      )
      .max(50)
      .optional(),
    description: safeDescriptionSchema,
    id: pluginIdSchema,
    manifestVersion: z.literal(CURRENT_PLUGIN_MANIFEST_VERSION),
    metadata: metadataSchema,
    migrations: z
      .array(
        z
          .object({
            description: safeDescriptionSchema,
            destructive: z.boolean().optional(),
            id: pluginIdSchema,
            name: safeTextSchema.max(120),
            version: versionSchema,
          })
          .strict(),
      )
      .max(100)
      .optional(),
    modules: z
      .array(
        z
          .object({
            capabilities: z.array(z.enum(PLUGIN_CAPABILITIES)).max(50),
            description: safeDescriptionSchema,
            enabledByDefault: z.boolean().optional(),
            id: pluginIdSchema,
            name: safeTextSchema.max(120),
          })
          .strict(),
      )
      .max(50)
      .optional(),
    name: safeTextSchema.max(120),
    schema: z.literal(PLUGIN_MANIFEST_SCHEMA),
    version: versionSchema,
  })
  .strict();

function scanUnsafeManifestInput(input: unknown, path = 'manifest', errors: string[] = []) {
  if (Array.isArray(input)) {
    input.forEach((value, index) => scanUnsafeManifestInput(value, `${path}[${index}]`, errors));
    return errors;
  }

  if (input && typeof input === 'object') {
    for (const [key, value] of Object.entries(input)) {
      const normalizedKey = key.replace(/[_-]/g, '').toLowerCase();

      if (normalizedProtectedKeys.has(normalizedKey)) {
        errors.push(`${path}.${key}: protected keys are not allowed in plugin manifests.`);
      }

      scanUnsafeManifestInput(value, `${path}.${key}`, errors);
    }

    return errors;
  }

  if (typeof input === 'string' && forbiddenStringPattern.test(input)) {
    errors.push(`${path}: unsafe HTML, executable content, secrets, or shell-like commands are not allowed.`);
  }

  return errors;
}

function findDuplicateEntries(values: readonly string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
      continue;
    }

    seen.add(value);
  }

  return [...duplicates].sort();
}

export function validatePluginManifest(input: unknown) {
  const unsafeErrors = scanUnsafeManifestInput(input);

  if (unsafeErrors.length > 0) {
    return {
      errors: unsafeErrors,
      success: false as const,
    };
  }

  const parsed = rawPluginManifestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      errors: parsed.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'manifest';
        return `${path}: ${issue.message}`;
      }),
      success: false as const,
    };
  }

  const manifest = parsed.data;
  const moduleIds = manifest.modules?.map((moduleEntry) => moduleEntry.id) ?? [];
  const duplicateModules = findDuplicateEntries(moduleIds);

  if (duplicateModules.length > 0) {
    return {
      errors: duplicateModules.map((moduleId) => `modules contains duplicate id "${moduleId}".`),
      success: false as const,
    };
  }

  const migrationIds = manifest.migrations?.map((migration) => migration.id) ?? [];
  const duplicateMigrations = findDuplicateEntries(migrationIds);

  if (duplicateMigrations.length > 0) {
    return {
      errors: duplicateMigrations.map((migrationId) => `migrations contains duplicate id "${migrationId}".`),
      success: false as const,
    };
  }

  const dependencyIds = manifest.dependencies?.map((dependency) => dependency.pluginId) ?? [];
  const duplicateDependencies = findDuplicateEntries(dependencyIds);

  if (duplicateDependencies.length > 0) {
    return {
      errors: duplicateDependencies.map((pluginId) => `dependencies contains duplicate plugin "${pluginId}".`),
      success: false as const,
    };
  }

  if (manifest.conflicts?.includes(manifest.id)) {
    return {
      errors: ['conflicts must not include the plugin itself.'],
      success: false as const,
    };
  }

  if (manifest.dependencies?.some((dependency) => dependency.pluginId === manifest.id)) {
    return {
      errors: ['dependencies must not include the plugin itself.'],
      success: false as const,
    };
  }

  return {
    manifest: manifest as PluginManifest,
    success: true as const,
  };
}

export function assertValidPluginManifest(input: unknown): PluginManifest {
  const result = validatePluginManifest(input);

  if (!result.success) {
    throw new Error(result.errors.join('; '));
  }

  return result.manifest;
}
