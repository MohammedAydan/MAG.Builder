import { describe, expect, it } from 'vitest';
import { assertValidMarketplacePackageManifest, validateMarketplacePackageManifest } from './manifest';

describe('marketplace package manifest validation', () => {
  it('accepts a safe versioned local package manifest', () => {
    const manifest = assertValidMarketplacePackageManifest({
      capabilities: ['plugins:local-module'],
      compatibility: {
        packageApiVersion: 1,
        platform: 'nexpress',
        platformVersionRange: '>=0.1.0 <1.0.0',
        scopeMode: 'global',
      },
      description: 'Safe local package manifest.',
      distribution: {
        artifactId: 'artifact-safe-plugin',
        channel: 'stable',
        registry: 'local',
      },
      id: 'plugin-safe-plugin',
      integrity: {
        artifacts: [
          {
            artifactId: 'artifact-safe-plugin',
            checksum: {
              algorithm: 'sha256',
              value: 'a'.repeat(64),
            },
            fileName: 'safe-plugin.json',
            provenance: {
              builderId: 'local-build',
            },
            sbom: {
              digest: 'b'.repeat(64),
              format: 'spdx-json',
            },
            signature: {
              format: 'catalog-attestation',
              keyId: 'local-root',
              status: 'verified',
            },
          },
        ],
        installable: true,
      },
      manifestVersion: 1,
      metadata: {
        'vendor:category': 'plugin',
      },
      name: 'Safe Plugin Package',
      references: {
        pluginId: 'safe-plugin',
      },
      schema: 'nexpress-package-manifest',
      type: 'plugin',
      version: '1.2.3',
    });

    expect(manifest.id).toBe('plugin-safe-plugin');
    expect(manifest.references?.pluginId).toBe('safe-plugin');
  });

  it('rejects protected keys and remote script-like content', () => {
    const result = validateMarketplacePackageManifest({
      capabilities: ['plugins:local-module'],
      compatibility: {
        packageApiVersion: 1,
        platform: 'nexpress',
        platformVersionRange: '>=0.1.0 <1.0.0',
        scopeMode: 'global',
      },
      description: 'Safe local package manifest.',
      distribution: {
        artifactId: 'artifact-unsafe-plugin',
        channel: 'stable',
        registry: 'local',
      },
      id: 'plugin-unsafe-plugin',
      integrity: {
        artifacts: [
          {
            artifactId: 'artifact-unsafe-plugin',
            checksum: {
              algorithm: 'sha256',
              value: 'a'.repeat(64),
            },
            fileName: 'unsafe-plugin.json',
            signature: {
              format: 'catalog-attestation',
              keyId: 'local-root',
              status: 'verified',
            },
          },
        ],
        installable: true,
      },
      manifestVersion: 1,
      name: 'Unsafe Plugin Package',
      schema: 'nexpress-package-manifest',
      scripts: {
        install: 'pnpm install evil',
      },
      type: 'plugin',
      version: '1.0.0',
    });

    expect(result.success).toBe(false);
    expect(result.success ? '' : result.errors.join(' ')).toContain('protected keys');
  });

  it('rejects invalid checksum lengths', () => {
    const result = validateMarketplacePackageManifest({
      capabilities: ['themes:tokens'],
      compatibility: {
        packageApiVersion: 1,
        platform: 'nexpress',
        platformVersionRange: '>=0.1.0 <1.0.0',
        scopeMode: 'global',
      },
      description: 'Theme package.',
      distribution: {
        artifactId: 'artifact-theme',
        channel: 'stable',
        registry: 'local',
      },
      id: 'theme-invalid',
      integrity: {
        artifacts: [
          {
            artifactId: 'artifact-theme',
            checksum: {
              algorithm: 'sha256',
              value: 'abc123',
            },
            fileName: 'theme.json',
            signature: {
              format: 'catalog-attestation',
              keyId: 'local-root',
              status: 'verified',
            },
          },
        ],
        installable: true,
      },
      manifestVersion: 1,
      name: 'Theme Package',
      schema: 'nexpress-package-manifest',
      type: 'theme',
      version: '1.0.0',
    });

    expect(result.success).toBe(false);
    expect(result.success ? '' : result.errors.join(' ')).toContain('64 hex chars');
  });
});
