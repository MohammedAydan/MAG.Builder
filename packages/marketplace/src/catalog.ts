import { assertValidMarketplacePackageManifest, validateMarketplacePackageManifest } from './manifest';
import { compareVersions } from './semver';
import type {
  MarketplaceCatalog,
  MarketplaceCatalogEntry,
  MarketplacePackageDefinition,
  UpdateChannel,
} from './types';

const channelPriority: Record<UpdateChannel, number> = {
  stable: 3,
  beta: 2,
  dev: 1,
};

function sortDefinitions(
  left: MarketplacePackageDefinition,
  right: MarketplacePackageDefinition,
) {
  if (left.manifest.id !== right.manifest.id) {
    return left.manifest.id.localeCompare(right.manifest.id);
  }

  const versionOrder = compareVersions(right.manifest.version, left.manifest.version);

  if (versionOrder !== 0) {
    return versionOrder;
  }

  return channelPriority[right.manifest.distribution.channel] - channelPriority[left.manifest.distribution.channel];
}

export function createMarketplaceCatalog(entries: readonly MarketplacePackageDefinition[]): MarketplaceCatalog {
  const definitions = new Map<string, MarketplacePackageDefinition[]>();

  for (const entry of entries) {
    const validation = validateMarketplacePackageManifest(entry.manifest);

    if (!validation.success) {
      throw new Error(`Invalid marketplace package manifest: ${validation.errors.join('; ')}`);
    }

    const manifest = assertValidMarketplacePackageManifest(validation.manifest);
    const versions = definitions.get(manifest.id) ?? [];

    if (versions.some((versionEntry) => versionEntry.manifest.version === manifest.version)) {
      throw new Error(`Duplicate marketplace package version "${manifest.id}@${manifest.version}" is not allowed.`);
    }

    versions.push({
      manifest,
      source: entry.source,
    });
    versions.sort(sortDefinitions);
    definitions.set(manifest.id, versions);
  }

  return {
    get(packageId, version) {
      const versions = definitions.get(packageId);

      if (!versions) {
        return undefined;
      }

      if (!version) {
        return versions[0];
      }

      return versions.find((entry) => entry.manifest.version === version);
    },
    getLatest(packageId, channel) {
      const versions = definitions.get(packageId);

      if (!versions) {
        return undefined;
      }

      return versions.find((entry) => !channel || entry.manifest.distribution.channel === channel);
    },
    list() {
      return [...definitions.values()].flat().sort(sortDefinitions);
    },
    listEntries() {
      const entries: MarketplaceCatalogEntry[] = [];

      for (const versions of definitions.values()) {
        const latest = [...versions].sort(sortDefinitions)[0];
        if (!latest) {
          continue;
        }

        entries.push({
          channels: [...new Set(versions.map((entry) => entry.manifest.distribution.channel))],
          description: latest.manifest.description,
          id: latest.manifest.id,
          latestVersion: latest.manifest.version,
          name: latest.manifest.name,
          type: latest.manifest.type,
        });
      }

      return entries.sort((left, right) => left.id.localeCompare(right.id));
    },
    listVersions(packageId) {
      return [...(definitions.get(packageId) ?? [])];
    },
  };
}
