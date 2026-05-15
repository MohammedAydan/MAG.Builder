import { z } from 'zod';
import {
  CHECKSUM_ALGORITHMS,
  CURRENT_MARKETPLACE_PACKAGE_API_VERSION,
  CURRENT_MARKETPLACE_PACKAGE_MANIFEST_VERSION,
  MARKETPLACE_CAPABILITIES,
  MARKETPLACE_PACKAGE_SCHEMA,
  MARKETPLACE_PACKAGE_TYPES,
  NEXPRESS_PLATFORM_ID,
  PACKAGE_SCOPE_MODES,
  SBOM_FORMATS,
  SIGNATURE_FORMATS,
  SIGNATURE_STATUSES,
  UPDATE_CHANNELS,
  type PackageManifest,
  type PackageMetadataValue,
} from './types';
import { isValidVersion, satisfiesVersionRange } from './semver';

const normalizedProtectedKeys = new Set([
  'accesstoken',
  'admintoken',
  'apikey',
  'authorization',
  'command',
  'commands',
  'cookie',
  'databaseurl',
  'env',
  'hook',
  'hooks',
  'installscript',
  'installscripts',
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
  /(<\/?[a-z][^>]*>)|(<script\b)|(<iframe\b)|(javascript:)|(data:text\/html)|(eval\()|(new Function)|(\bprocess\.env\b)|(\bPAYLOAD_SECRET\b)|(\bDATABASE_URL\b)|(\btoken\b)|(\bpassword\b)|(\bshell\b)|(\bnpm\s+(install|exec|run)\b)|(\bpnpm\s+(install|exec|run)\b)|(\byarn\s+(install|add|run)\b)|(\bcurl\s+https?:\/\/)|(\bwget\s+https?:\/\/)|(\bhttps?:\/\/)/i;

const packageIdSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Package id must contain lowercase letters, numbers, and hyphens only.');

const versionSchema = z
  .string()
  .trim()
  .refine((value) => isValidVersion(value), 'Version must be an explicit semver string.');

const rangeSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => satisfiesVersionRange('0.1.0', value) || /^(<=|>=|<|>|=)?\s*\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\s+(<=|>=|<|>|=)\s*\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)*$/.test(value), 'Version range must use simple comparator syntax such as ">=0.1.0 <1.0.0".');

const safeTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .refine((value) => !forbiddenStringPattern.test(value), 'Unsafe HTML, secrets, commands, or remote URLs are not allowed.');

const safeDescriptionSchema = z
  .string()
  .trim()
  .min(1)
  .max(1000)
  .refine((value) => !forbiddenStringPattern.test(value), 'Unsafe HTML, secrets, commands, or remote URLs are not allowed.');

const checksumLengthByAlgorithm = {
  sha256: 64,
  sha384: 96,
  sha512: 128,
} as const;

const metadataValueSchema: z.ZodType<PackageMetadataValue> = z.lazy(() =>
  z.union([
    z.string().max(500).refine((value) => !forbiddenStringPattern.test(value), 'Unsafe metadata content is not allowed.'),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(metadataValueSchema).max(50),
    z.record(z.string(), metadataValueSchema),
  ]),
);

const rawMarketplaceManifestSchema = z
  .object({
    capabilities: z.array(z.enum(MARKETPLACE_CAPABILITIES)).min(1).max(20),
    compatibility: z
      .object({
        packageApiVersion: z.literal(CURRENT_MARKETPLACE_PACKAGE_API_VERSION),
        platform: z.literal(NEXPRESS_PLATFORM_ID),
        platformVersionRange: rangeSchema,
        scopeMode: z.enum(PACKAGE_SCOPE_MODES),
      })
      .strict(),
    conflicts: z.array(packageIdSchema).max(20).optional(),
    dependencies: z
      .array(
        z
          .object({
            packageId: packageIdSchema,
            packageType: z.enum(MARKETPLACE_PACKAGE_TYPES).optional(),
            versionRange: rangeSchema.optional(),
          })
          .strict(),
      )
      .max(20)
      .optional(),
    description: safeDescriptionSchema,
    distribution: z
      .object({
        artifactId: packageIdSchema,
        channel: z.enum(UPDATE_CHANNELS),
        registry: z.literal('local'),
      })
      .strict(),
    id: packageIdSchema,
    integrity: z
      .object({
        artifacts: z.array(
          z
            .object({
              artifactId: packageIdSchema,
              checksum: z
                .object({
                  algorithm: z.enum(CHECKSUM_ALGORITHMS),
                  value: z.string().trim().regex(/^[a-f0-9]+$/i, 'Checksum value must be hex-encoded.'),
                })
                .strict(),
              fileName: z.string().trim().min(1).max(160).refine((value) => !/[\\/]/.test(value), 'Artifact fileName must be a plain file name.'),
              provenance: z
                .object({
                  buildType: z.string().trim().max(160).optional(),
                  builderId: z.string().trim().max(160).optional(),
                  sourceRepository: z.string().trim().max(200).optional(),
                })
                .strict()
                .optional(),
              sbom: z
                .object({
                  digest: z.string().trim().regex(/^[a-f0-9]+$/i, 'SBOM digest must be hex-encoded.'),
                  format: z.enum(SBOM_FORMATS),
                })
                .strict()
                .optional(),
              signature: z
                .object({
                  format: z.enum(SIGNATURE_FORMATS),
                  keyId: z.string().trim().min(1).max(160),
                  status: z.enum(SIGNATURE_STATUSES),
                  verifiedAt: z.string().trim().datetime().optional(),
                })
                .strict()
                .optional(),
            })
            .strict(),
        ).min(1).max(10),
        installable: z.boolean(),
      })
      .strict(),
    manifestVersion: z.literal(CURRENT_MARKETPLACE_PACKAGE_MANIFEST_VERSION),
    metadata: z
      .record(
        z
          .string()
          .regex(/^[a-z0-9]+:[a-z0-9-]+$/, 'Metadata keys must use a safe namespace such as "vendor:key".'),
        metadataValueSchema,
      )
      .optional(),
    name: safeTextSchema,
    references: z
      .object({
        integrationId: packageIdSchema.optional(),
        pluginId: packageIdSchema.optional(),
        templateId: packageIdSchema.optional(),
        themeId: packageIdSchema.optional(),
      })
      .strict()
      .optional(),
    schema: z.literal(MARKETPLACE_PACKAGE_SCHEMA),
    type: z.enum(MARKETPLACE_PACKAGE_TYPES),
    version: versionSchema,
  })
  .strict();

function scanUnsafeInput(input: unknown, path = 'manifest', errors: string[] = []) {
  if (Array.isArray(input)) {
    input.forEach((value, index) => scanUnsafeInput(value, `${path}[${index}]`, errors));
    return errors;
  }

  if (input && typeof input === 'object') {
    for (const [key, value] of Object.entries(input)) {
      const normalizedKey = key.replace(/[_-]/g, '').toLowerCase();

      if (normalizedProtectedKeys.has(normalizedKey)) {
        errors.push(`${path}.${key}: protected keys are not allowed in marketplace package manifests.`);
      }

      scanUnsafeInput(value, `${path}.${key}`, errors);
    }

    return errors;
  }

  if (typeof input === 'string' && forbiddenStringPattern.test(input)) {
    errors.push(`${path}: unsafe HTML, secrets, commands, or remote URLs are not allowed.`);
  }

  return errors;
}

function findDuplicates(values: readonly string[]) {
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

export function validateMarketplacePackageManifest(input: unknown) {
  const unsafeErrors = scanUnsafeInput(input);

  if (unsafeErrors.length > 0) {
    return {
      errors: unsafeErrors,
      success: false as const,
    };
  }

  const parsed = rawMarketplaceManifestSchema.safeParse(input);

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
  const dependencyIds = manifest.dependencies?.map((entry) => entry.packageId) ?? [];
  const conflictIds = manifest.conflicts ?? [];
  const artifactIds = manifest.integrity.artifacts.map((entry) => entry.artifactId);
  const duplicateDependencies = findDuplicates(dependencyIds);
  const duplicateConflicts = findDuplicates(conflictIds);
  const duplicateArtifacts = findDuplicates(artifactIds);

  if (duplicateDependencies.length > 0) {
    return {
      errors: duplicateDependencies.map((packageId) => `dependencies contains duplicate package "${packageId}".`),
      success: false as const,
    };
  }

  if (duplicateConflicts.length > 0) {
    return {
      errors: duplicateConflicts.map((packageId) => `conflicts contains duplicate package "${packageId}".`),
      success: false as const,
    };
  }

  if (duplicateArtifacts.length > 0) {
    return {
      errors: duplicateArtifacts.map((artifactId) => `integrity.artifacts contains duplicate artifact "${artifactId}".`),
      success: false as const,
    };
  }

  for (const artifact of manifest.integrity.artifacts) {
    const expectedLength = checksumLengthByAlgorithm[artifact.checksum.algorithm];

    if (artifact.checksum.value.length !== expectedLength) {
      return {
        errors: [
          `integrity.artifacts checksum for "${artifact.artifactId}" must be ${expectedLength} hex chars for ${artifact.checksum.algorithm}.`,
        ],
        success: false as const,
      };
    }
  }

  if (!artifactIds.includes(manifest.distribution.artifactId)) {
    return {
      errors: [
        `distribution.artifactId "${manifest.distribution.artifactId}" must exist in integrity.artifacts.`,
      ],
      success: false as const,
    };
  }

  if ((manifest.references?.pluginId ? 1 : 0)
    + (manifest.references?.themeId ? 1 : 0)
    + (manifest.references?.templateId ? 1 : 0)
    + (manifest.references?.integrationId ? 1 : 0) > 1) {
    return {
      errors: ['references must point to at most one package foundation id.'],
      success: false as const,
    };
  }

  if (manifest.dependencies?.some((dependency) => dependency.packageId === manifest.id)) {
    return {
      errors: ['dependencies must not include the package itself.'],
      success: false as const,
    };
  }

  if (manifest.conflicts?.includes(manifest.id)) {
    return {
      errors: ['conflicts must not include the package itself.'],
      success: false as const,
    };
  }

  const expectedCapabilityByType = {
    integration: 'integrations:webhooks',
    plugin: 'plugins:local-module',
    template: 'templates:content',
    theme: 'themes:tokens',
  } as const;

  if (!manifest.capabilities.includes(expectedCapabilityByType[manifest.type])) {
    return {
      errors: [`Package type "${manifest.type}" must include capability "${expectedCapabilityByType[manifest.type]}".`],
      success: false as const,
    };
  }

  return {
    manifest: manifest as PackageManifest,
    success: true as const,
  };
}

export function assertValidMarketplacePackageManifest(input: unknown) {
  const result = validateMarketplacePackageManifest(input);

  if (!result.success) {
    throw new Error(result.errors.join('; '));
  }

  return result.manifest;
}
