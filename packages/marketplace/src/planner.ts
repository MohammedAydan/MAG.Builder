import { compareVersions, satisfiesVersionRange } from './semver';
import {
  MARKETPLACE_CAPABILITIES,
  MARKETPLACE_PACKAGE_TYPES,
  NEXPRESS_PLATFORM_VERSION,
  type InstalledPackageSnapshot,
  type MarketplaceCatalog,
  type MarketplacePackageDefinition,
  type MarketplacePlanInput,
  type MarketplacePlanResult,
  type PackageCompatibilityContext,
  type PackageCompatibilityResult,
  type PackageIntegrityAssessment,
} from './types';

function getInstalledMap(installedPackages: readonly InstalledPackageSnapshot[] | undefined) {
  return new Map((installedPackages ?? []).map((entry) => [entry.packageId, entry] as const));
}

export function assessPackageIntegrity(definition: MarketplacePackageDefinition): PackageIntegrityAssessment {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (definition.manifest.distribution.registry !== 'local') {
    errors.push(`Package "${definition.manifest.id}" must come from the local allowlisted registry.`);
  }

  if (definition.manifest.integrity.installable !== true) {
    errors.push(`Package "${definition.manifest.id}" is not marked installable.`);
  }

  for (const artifact of definition.manifest.integrity.artifacts) {
    if (!artifact.signature) {
      errors.push(`Artifact "${artifact.artifactId}" is missing signature metadata.`);
      continue;
    }

    if (artifact.signature.status !== 'verified') {
      errors.push(`Artifact "${artifact.artifactId}" is not verified for installation.`);
    }

    if (!artifact.sbom) {
      warnings.push(`Artifact "${artifact.artifactId}" is missing SBOM metadata.`);
    }

    if (!artifact.provenance?.builderId) {
      warnings.push(`Artifact "${artifact.artifactId}" is missing provenance.builderId.`);
    }
  }

  return {
    errors,
    warnings,
  };
}

export function evaluatePackageCompatibility(
  definition: MarketplacePackageDefinition,
  context: PackageCompatibilityContext,
  catalog?: MarketplaceCatalog,
): PackageCompatibilityResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const installedMap = getInstalledMap(context.installedPackages);

  if (!context.supportedPackageTypes.includes(definition.manifest.type)) {
    errors.push(`Package type "${definition.manifest.type}" is not supported by this platform.`);
  }

  for (const capability of definition.manifest.capabilities) {
    if (!context.supportedCapabilities.includes(capability)) {
      errors.push(`Capability "${capability}" is not supported by this platform.`);
    }
  }

  if (!satisfiesVersionRange(context.platformVersion, definition.manifest.compatibility.platformVersionRange)) {
    errors.push(
      `Platform version "${context.platformVersion}" does not satisfy "${definition.manifest.compatibility.platformVersionRange}".`,
    );
  }

  for (const dependency of definition.manifest.dependencies ?? []) {
    const installed = installedMap.get(dependency.packageId);

    if (!installed) {
      const available = catalog?.getLatest(dependency.packageId);

      if (!available) {
        errors.push(`Dependency "${dependency.packageId}" is not installed and no local allowlisted package was found.`);
        continue;
      }

      if (dependency.packageType && available.manifest.type !== dependency.packageType) {
        errors.push(`Dependency "${dependency.packageId}" must be type "${dependency.packageType}".`);
        continue;
      }

      if (!satisfiesVersionRange(available.manifest.version, dependency.versionRange)) {
        errors.push(`Dependency "${dependency.packageId}" does not have a compatible local version.`);
        continue;
      }

      warnings.push(`Dependency "${dependency.packageId}" must be planned alongside this package.`);
      continue;
    }

    if (dependency.packageType && installed.packageType && installed.packageType !== dependency.packageType) {
      errors.push(`Installed dependency "${dependency.packageId}" has the wrong package type.`);
    }

    if (!satisfiesVersionRange(installed.version, dependency.versionRange)) {
      errors.push(`Installed dependency "${dependency.packageId}@${installed.version}" does not satisfy "${dependency.versionRange}".`);
    }
  }

  for (const conflictId of definition.manifest.conflicts ?? []) {
    if (installedMap.has(conflictId)) {
      errors.push(`Installed package "${conflictId}" conflicts with "${definition.manifest.id}".`);
    }
  }

  for (const installed of installedMap.values()) {
    const installedDefinition = catalog?.get(installed.packageId, installed.version);

    if (installedDefinition?.manifest.conflicts?.includes(definition.manifest.id)) {
      errors.push(`Installed package "${installed.packageId}" declares a conflict with "${definition.manifest.id}".`);
    }
  }

  return {
    errors,
    warnings,
  };
}

function selectTargetVersion(catalog: MarketplaceCatalog, input: MarketplacePlanInput) {
  if (input.action === 'update') {
    const installed = (input.installedPackages ?? []).find((entry) => entry.packageId === input.packageId);

    if (!installed) {
      return {
        error: `Package "${input.packageId}" is not installed.`,
      };
    }

    const candidates = catalog
      .listVersions(input.packageId)
      .filter((entry) => (!input.channel || entry.manifest.distribution.channel === input.channel))
      .filter((entry) => compareVersions(entry.manifest.version, installed.version) > 0)
      .sort((left, right) => compareVersions(right.manifest.version, left.manifest.version));

    return {
      currentVersion: installed.version,
      target: candidates[0],
    };
  }

  return {
    target: catalog.getLatest(input.packageId, input.channel),
  };
}

export function createMarketplacePlan(
  catalog: MarketplaceCatalog,
  input: MarketplacePlanInput,
): MarketplacePlanResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const steps: string[] = [];
  const platformVersion = input.platformVersion ?? NEXPRESS_PLATFORM_VERSION;
  const installedMap = getInstalledMap(input.installedPackages);
  const installed = installedMap.get(input.packageId);

  if (input.action === 'disable') {
    if (!installed?.enabled) {
      return {
        action: input.action,
        compatibility: { errors: [], warnings: [] },
        dryRun: true,
        errors: [],
        packageId: input.packageId,
        status: 'noop',
        steps: ['No enabled package state exists to disable.'],
        warnings: [],
      };
    }

    const dependents = (input.installedPackages ?? []).filter((entry) => {
      const definition = catalog.get(entry.packageId, entry.version);
      return definition?.manifest.dependencies?.some((dependency) => dependency.packageId === input.packageId);
    });

    if (dependents.length > 0) {
      errors.push(`Cannot disable "${input.packageId}" while dependent packages remain installed: ${dependents.map((entry) => entry.packageId).join(', ')}.`);
    }

    steps.push('Validate that no installed packages depend on the target package.');
    steps.push('Record a dry-run disable plan only. No state changes or plugin deactivation will execute.');

    return {
      action: input.action,
      compatibility: { errors, warnings },
      dryRun: true,
      errors,
      packageId: input.packageId,
      status: errors.length > 0 ? 'blocked' : 'ready',
      steps,
      targetVersion: installed.version,
      warnings,
    };
  }

  const selected = selectTargetVersion(catalog, input);

  if ('error' in selected) {
    return {
      action: input.action,
      compatibility: { errors: [selected.error], warnings: [] },
      dryRun: true,
      errors: [selected.error],
      packageId: input.packageId,
      status: 'blocked',
      steps: [],
      warnings: [],
    };
  }

  if (!selected.target) {
    const message = input.action === 'update'
      ? `No newer compatible package version was found for "${input.packageId}".`
      : `Unknown package "${input.packageId}".`;

    return {
      action: input.action,
      compatibility: { errors: [], warnings: [] },
      dryRun: true,
      errors: [],
      packageId: input.packageId,
      status: input.action === 'update' ? 'noop' : 'blocked',
      steps: [message],
      warnings: [],
    };
  }

  const target = selected.target;
  const compatibility = evaluatePackageCompatibility(target, {
    ...(input.installedPackages ? { installedPackages: input.installedPackages } : {}),
    platformVersion,
    supportedCapabilities: MARKETPLACE_CAPABILITIES,
    supportedPackageTypes: MARKETPLACE_PACKAGE_TYPES,
  }, catalog);
  const integrity = assessPackageIntegrity(target);

  errors.push(...compatibility.errors, ...integrity.errors);
  warnings.push(...compatibility.warnings, ...integrity.warnings);

  steps.push('Validate the package manifest against the local allowlisted schema.');
  steps.push('Verify compatibility for platform version, package type, capabilities, dependencies, and conflicts.');
  steps.push('Verify artifact integrity metadata, signatures, provenance, and SBOM references.');

  if (target.manifest.dependencies?.length) {
    for (const dependency of target.manifest.dependencies) {
      if (!installedMap.has(dependency.packageId)) {
        steps.push(`Dependency package "${dependency.packageId}" would need its own dry-run install plan before execution.`);
      }
    }
  }

  if (input.action === 'enable') {
    if (!installed) {
      errors.push(`Package "${input.packageId}" must be installed before it can be enabled.`);
    }

    steps.push('Prepare an enable plan only. No plugin activation or database writes will execute.');
  } else if (input.action === 'install') {
    steps.push('Prepare an install plan only. No files, package managers, or database records will be modified.');
  } else {
    steps.push('Prepare an update plan only. No files, package managers, or database records will be modified.');
  }

  return {
    action: input.action,
    compatibility,
    dryRun: true,
    errors,
    packageId: input.packageId,
    status: errors.length > 0 ? 'blocked' : 'ready',
    steps,
    targetVersion: target.manifest.version,
    warnings,
  };
}
