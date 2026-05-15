import { defaultThemeRegistry, starterTemplateManifest } from '@nexpress/themes';
import { localPluginDefinitions } from '@nexpress/plugins';
import type { PluginDefinition } from '@nexpress/plugins';
import { createMarketplaceCatalog } from './catalog';
import type { MarketplacePackageDefinition } from './types';

const sha256 = (seed: string) => {
  const hex = [...seed]
    .map((char) => char.charCodeAt(0).toString(16))
    .join('');

  return hex.padEnd(64, 'a').slice(0, 64);
};

function createArtifact(artifactId: string, fileName: string) {
  return {
    artifactId,
    checksum: {
      algorithm: 'sha256' as const,
      value: sha256(artifactId.replace(/-/g, 'a')),
    },
    fileName,
    provenance: {
      buildType: 'local-catalog',
      builderId: 'nexpress-phase-24',
      sourceRepository: 'workspace://MAG-Builder',
    },
    sbom: {
      digest: sha256(`${artifactId}-sbom`),
      format: 'spdx-json' as const,
    },
    signature: {
      format: 'catalog-attestation' as const,
      keyId: 'nexpress-local-catalog',
      status: 'verified' as const,
      verifiedAt: '2026-05-15T00:00:00.000Z',
    },
  };
}

const pluginPackages = (localPluginDefinitions as readonly PluginDefinition[]).flatMap((definition) => {
  const artifactId = `artifact-${definition.manifest.id}`;
  const baseManifest = {
    capabilities: ['plugins:local-module'] as const,
    compatibility: {
      packageApiVersion: 1 as const,
      platform: 'nexpress' as const,
      platformVersionRange: '>=0.1.0 <1.0.0',
      scopeMode: 'global' as const,
    },
    ...(definition.manifest.conflicts ? { conflicts: definition.manifest.conflicts } : {}),
    ...(definition.manifest.dependencies
      ? {
          dependencies: definition.manifest.dependencies.map((dependency) => ({
            packageId: `plugin-${dependency.pluginId}`,
            packageType: 'plugin' as const,
            ...(dependency.versionRange ? { versionRange: dependency.versionRange } : {}),
          })),
        }
      : {}),
    description: definition.manifest.description,
    distribution: {
      artifactId,
      channel: 'stable' as const,
      registry: 'local' as const,
    },
    id: `plugin-${definition.manifest.id}`,
    integrity: {
      artifacts: [createArtifact(artifactId, `${definition.manifest.id}-${definition.manifest.version}.json`)],
      installable: true,
    },
    manifestVersion: 1 as const,
    metadata: {
      'nexpress:category': definition.manifest.metadata?.['nexpress:category'] ?? 'plugin',
      'nexpress:source': 'local-allowlisted',
    },
    name: `${definition.manifest.name} Package`,
    references: {
      pluginId: definition.manifest.id,
    },
    schema: 'nexpress-package-manifest' as const,
    type: 'plugin' as const,
    version: definition.manifest.version,
  };

  if (definition.manifest.id !== 'blog-pack') {
    return [{ manifest: baseManifest, source: 'local' as const }];
  }

  return [
    {
      manifest: baseManifest,
      source: 'local' as const,
    },
    {
      manifest: {
        ...baseManifest,
        description: 'Dry-run stable update metadata for the local blog package.',
        integrity: {
          artifacts: [createArtifact(artifactId, 'blog-pack-0.1.1.json')],
          installable: true,
        },
        metadata: {
          ...baseManifest.metadata,
          'nexpress:update-notes': 'Adds safe marketplace package metadata only.',
        },
        version: '0.1.1',
      },
      source: 'local' as const,
    },
  ];
});

const defaultTheme = defaultThemeRegistry.get('nexpress-default');

const themePackages: MarketplacePackageDefinition[] = defaultTheme
  ? [
      {
        manifest: {
          capabilities: ['themes:tokens'],
          compatibility: {
            packageApiVersion: 1,
            platform: 'nexpress',
            platformVersionRange: '>=0.1.0 <1.0.0',
            scopeMode: 'global',
          },
          description: defaultTheme.description ?? 'Default allowlisted public theme token package.',
          distribution: {
            artifactId: 'artifact-theme-nexpress-default',
            channel: 'stable',
            registry: 'local',
          },
          id: 'theme-nexpress-default',
          integrity: {
            artifacts: [createArtifact('artifact-theme-nexpress-default', 'nexpress-default-theme.json')],
            installable: true,
          },
          manifestVersion: 1,
          metadata: {
            'nexpress:theme-label': defaultTheme.label,
          },
          name: 'Default Theme Package',
          references: {
            themeId: defaultTheme.id,
          },
          schema: 'nexpress-package-manifest',
          type: 'theme',
          version: '0.1.0',
        },
        source: 'local',
      },
    ]
  : [];

const templatePackages: MarketplacePackageDefinition[] = [
  {
    manifest: {
      capabilities: ['templates:content'],
      compatibility: {
        packageApiVersion: 1,
        platform: 'nexpress',
        platformVersionRange: '>=0.1.0 <1.0.0',
        scopeMode: 'global',
      },
      dependencies: [
        {
          packageId: `theme-${starterTemplateManifest.theme.id}`,
          packageType: 'theme',
          versionRange: '>=0.1.0',
        },
      ],
      description: 'Starter-site template package metadata backed by the safe template manifest foundation.',
      distribution: {
        artifactId: 'artifact-template-starter-site',
        channel: 'stable',
        registry: 'local',
      },
      id: 'template-starter-site',
      integrity: {
        artifacts: [createArtifact('artifact-template-starter-site', 'starter-site-template.json')],
        installable: true,
      },
      manifestVersion: 1,
      metadata: {
        'nexpress:template-label': starterTemplateManifest.metadata.label,
      },
      name: 'Starter Site Template Package',
      references: {
        templateId: starterTemplateManifest.metadata.id,
      },
      schema: 'nexpress-package-manifest',
      type: 'template',
      version: '0.1.0',
    },
    source: 'local',
  },
];

export const localMarketplacePackages = [
  ...pluginPackages,
  ...themePackages,
  ...templatePackages,
] as const satisfies readonly MarketplacePackageDefinition[];

export const defaultMarketplaceCatalog = createMarketplaceCatalog(localMarketplacePackages);
