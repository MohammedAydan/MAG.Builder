export const NEXPRESS_PLATFORM_ID = 'nexpress' as const;
export const NEXPRESS_PLATFORM_VERSION = '0.1.0' as const;

export const MARKETPLACE_PACKAGE_SCHEMA = 'nexpress-package-manifest' as const;
export const CURRENT_MARKETPLACE_PACKAGE_MANIFEST_VERSION = 1 as const;
export const CURRENT_MARKETPLACE_PACKAGE_API_VERSION = 1 as const;

export const MARKETPLACE_PACKAGE_TYPES = [
  'integration',
  'plugin',
  'template',
  'theme',
] as const;

export const MARKETPLACE_CAPABILITIES = [
  'integrations:webhooks',
  'plugins:local-module',
  'templates:content',
  'themes:tokens',
] as const;

export const UPDATE_CHANNELS = ['stable', 'beta', 'dev'] as const;
export const CHECKSUM_ALGORITHMS = ['sha256', 'sha384', 'sha512'] as const;
export const SIGNATURE_FORMATS = ['catalog-attestation', 'cosign', 'minisign'] as const;
export const SIGNATURE_STATUSES = ['placeholder', 'unverified', 'verified'] as const;
export const SBOM_FORMATS = ['cyclonedx-json', 'spdx-json'] as const;
export const PACKAGE_SCOPE_MODES = ['global', 'site'] as const;

export type MarketplacePackageType = (typeof MARKETPLACE_PACKAGE_TYPES)[number];
export type MarketplaceCapability = (typeof MARKETPLACE_CAPABILITIES)[number];
export type UpdateChannel = (typeof UPDATE_CHANNELS)[number];
export type ChecksumAlgorithm = (typeof CHECKSUM_ALGORITHMS)[number];
export type SignatureFormat = (typeof SIGNATURE_FORMATS)[number];
export type SignatureStatus = (typeof SIGNATURE_STATUSES)[number];
export type SbomFormat = (typeof SBOM_FORMATS)[number];
export type PackageScopeMode = (typeof PACKAGE_SCOPE_MODES)[number];

export type PackageMetadataValue =
  | boolean
  | number
  | string
  | null
  | readonly PackageMetadataValue[]
  | { readonly [key: string]: PackageMetadataValue };

export type PackageDependency = Readonly<{
  packageId: string;
  packageType?: MarketplacePackageType;
  versionRange?: string;
}>;

export type PackageArtifactChecksum = Readonly<{
  algorithm: ChecksumAlgorithm;
  value: string;
}>;

export type PackageArtifactSignature = Readonly<{
  format: SignatureFormat;
  keyId: string;
  status: SignatureStatus;
  verifiedAt?: string;
}>;

export type PackageArtifactSbom = Readonly<{
  digest: string;
  format: SbomFormat;
}>;

export type PackageArtifactProvenance = Readonly<{
  buildType?: string;
  builderId?: string;
  sourceRepository?: string;
}>;

export type PackageArtifactManifest = Readonly<{
  artifactId: string;
  checksum: PackageArtifactChecksum;
  fileName: string;
  provenance?: PackageArtifactProvenance;
  sbom?: PackageArtifactSbom;
  signature?: PackageArtifactSignature;
}>;

export type PackageManifest = Readonly<{
  capabilities: readonly MarketplaceCapability[];
  compatibility: Readonly<{
    packageApiVersion: typeof CURRENT_MARKETPLACE_PACKAGE_API_VERSION;
    platform: typeof NEXPRESS_PLATFORM_ID;
    platformVersionRange: string;
    scopeMode: PackageScopeMode;
  }>;
  conflicts?: readonly string[];
  dependencies?: readonly PackageDependency[];
  description: string;
  distribution: Readonly<{
    artifactId: string;
    channel: UpdateChannel;
    registry: 'local';
  }>;
  id: string;
  integrity: Readonly<{
    artifacts: readonly PackageArtifactManifest[];
    installable: boolean;
  }>;
  manifestVersion: typeof CURRENT_MARKETPLACE_PACKAGE_MANIFEST_VERSION;
  metadata?: Readonly<Record<string, PackageMetadataValue>>;
  name: string;
  references?: Readonly<{
    integrationId?: string;
    pluginId?: string;
    templateId?: string;
    themeId?: string;
  }>;
  schema: typeof MARKETPLACE_PACKAGE_SCHEMA;
  type: MarketplacePackageType;
  version: string;
}>;

export type MarketplacePackageDefinition = Readonly<{
  manifest: PackageManifest;
  source: 'local';
}>;

export type MarketplaceCatalogEntry = Readonly<{
  channels: readonly UpdateChannel[];
  description: string;
  id: string;
  latestVersion: string;
  name: string;
  type: MarketplacePackageType;
}>;

export type InstalledPackageSnapshot = Readonly<{
  enabled?: boolean;
  packageId: string;
  packageType?: MarketplacePackageType;
  version: string;
}>;

export type CompatibilityIssueLevel = 'error' | 'warning';

export type CompatibilityIssue = Readonly<{
  level: CompatibilityIssueLevel;
  message: string;
}>;

export type PackageCompatibilityContext = Readonly<{
  installedPackages?: readonly InstalledPackageSnapshot[];
  platformVersion: string;
  supportedCapabilities: readonly MarketplaceCapability[];
  supportedPackageTypes: readonly MarketplacePackageType[];
}>;

export type PackageCompatibilityResult = Readonly<{
  errors: readonly string[];
  warnings: readonly string[];
}>;

export type PackageIntegrityAssessment = Readonly<{
  errors: readonly string[];
  warnings: readonly string[];
}>;

export type MarketplacePlanAction = 'disable' | 'enable' | 'install' | 'update';
export type MarketplacePlanStatus = 'blocked' | 'noop' | 'ready';

export type MarketplacePlanInput = Readonly<{
  action: MarketplacePlanAction;
  channel?: UpdateChannel;
  installedPackages?: readonly InstalledPackageSnapshot[];
  packageId: string;
  platformVersion?: string;
}>;

export type MarketplacePlanResult = Readonly<{
  action: MarketplacePlanAction;
  compatibility: PackageCompatibilityResult;
  dryRun: true;
  errors: readonly string[];
  packageId: string;
  status: MarketplacePlanStatus;
  steps: readonly string[];
  targetVersion?: string;
  warnings: readonly string[];
}>;

export type MarketplaceCatalog = Readonly<{
  get: (packageId: string, version?: string) => MarketplacePackageDefinition | undefined;
  getLatest: (packageId: string, channel?: UpdateChannel) => MarketplacePackageDefinition | undefined;
  list: () => readonly MarketplacePackageDefinition[];
  listEntries: () => readonly MarketplaceCatalogEntry[];
  listVersions: (packageId: string) => readonly MarketplacePackageDefinition[];
}>;
