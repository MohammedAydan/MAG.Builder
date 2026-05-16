import {
  createMarketplacePlan,
  defaultMarketplaceCatalog,
  NEXPRESS_PLATFORM_VERSION,
  type InstalledPackageSnapshot,
  type MarketplacePlanAction,
  type UpdateChannel,
} from '@nexpress/marketplace';
import { z } from 'zod';
import { AUDIT_ACTIONS, writeAuditEntry } from '@/lib/audit/service';
import {
  canAccessAdminPanel,
  getUserRole,
  hasPermission,
  type AuthenticatedUserLike,
} from '@/lib/auth/access';
import { getPayloadClient } from '@/lib/payload';

type PayloadPluginStateDoc = {
  enabled?: boolean | null;
  pluginId: string;
  pluginVersion: string;
};

type PayloadFindResult<T> = {
  docs: T[];
};

type MarketplaceServicePayloadClient = {
  create: (args: Record<string, unknown>) => Promise<unknown>;
  find: (args: Record<string, unknown>) => Promise<PayloadFindResult<PayloadPluginStateDoc>>;
};

const marketplacePlanRequestSchema = z
  .object({
    action: z.enum(['disable', 'enable', 'install', 'update']),
    channel: z.enum(['stable', 'beta', 'dev']).optional(),
    packageId: z.string().trim().min(1),
  })
  .strict();

export class MarketplaceFlowError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function assertMarketplaceReader(
  user: AuthenticatedUserLike | null | undefined,
): asserts user is AuthenticatedUserLike {
  if (!user || !canAccessAdminPanel(user) || !hasPermission(user, 'marketplace:read')) {
    throw new MarketplaceFlowError('Forbidden', 403);
  }
}

function assertMarketplaceManager(
  user: AuthenticatedUserLike | null | undefined,
): asserts user is AuthenticatedUserLike {
  if (!user || !canAccessAdminPanel(user) || !hasPermission(user, 'marketplace:manage')) {
    throw new MarketplaceFlowError('Forbidden', 403);
  }
}

function createMarketplaceAuditActor(user: AuthenticatedUserLike) {
  return {
    ...(user.email ? { email: user.email } : {}),
    role: getUserRole(user),
    source: 'user' as const,
    userId: user.id,
  };
}

function mapInstalledPluginPackages(records: readonly PayloadPluginStateDoc[]): InstalledPackageSnapshot[] {
  return records
    .filter((record) => typeof record.pluginId === 'string' && typeof record.pluginVersion === 'string')
    .map((record) => ({
      enabled: record.enabled === true,
      packageId: `plugin-${record.pluginId}`,
      packageType: 'plugin' as const,
      version: record.pluginVersion,
    }));
}

async function findInstalledPluginPackages(
  payload: MarketplaceServicePayloadClient,
  user: AuthenticatedUserLike,
) {
  const result = await payload.find({
    collection: 'plugin-states',
    limit: 100,
    overrideAccess: false,
    pagination: false,
    user,
  });

  return mapInstalledPluginPackages(result.docs);
}

export function parseMarketplacePlanRequest(input: unknown) {
  return marketplacePlanRequestSchema.safeParse(input);
}

export async function listMarketplacePackagesWithPayload(
  payload: MarketplaceServicePayloadClient,
  user: AuthenticatedUserLike | null | undefined,
) {
  assertMarketplaceReader(user);
  const installed = await findInstalledPluginPackages(payload, user);
  const installedMap = new Map(installed.map((entry) => [entry.packageId, entry] as const));

  return defaultMarketplaceCatalog.listEntries().map((entry) => {
    const installedPackage = installedMap.get(entry.id);

    return {
      ...entry,
      installed: Boolean(installedPackage),
      installedVersion: installedPackage?.version,
      enabled: installedPackage?.enabled ?? false,
    };
  });
}

export async function listMarketplacePackages(user: AuthenticatedUserLike | null | undefined) {
  const payload = await getPayloadClient();
  return listMarketplacePackagesWithPayload(
    payload as unknown as MarketplaceServicePayloadClient,
    user,
  );
}

export async function getMarketplacePackage(
  packageId: string,
  user: AuthenticatedUserLike | null | undefined,
) {
  const packages = await listMarketplacePackages(user);
  return packages.find((pkg) => pkg.id === packageId);
}

export async function createMarketplacePlanWithPayload(
  payload: MarketplaceServicePayloadClient,
  args: {
    action: MarketplacePlanAction;
    channel?: UpdateChannel;
    packageId: string;
    user: AuthenticatedUserLike | null | undefined;
  },
) {
  assertMarketplaceManager(args.user);
  const user = args.user;
  const installedPackages = await findInstalledPluginPackages(payload, user);
  const plan = createMarketplacePlan(defaultMarketplaceCatalog, {
    action: args.action,
    ...(args.channel ? { channel: args.channel } : {}),
    installedPackages,
    packageId: args.packageId,
    platformVersion: NEXPRESS_PLATFORM_VERSION,
  });

  await writeAuditEntry(payload, {
    action: AUDIT_ACTIONS.marketplacePackagePlanCreated,
    actor: createMarketplaceAuditActor(user),
    metadata: {
      action: args.action,
      channel: args.channel,
      dryRun: true,
      packageId: args.packageId,
      status: plan.status,
      targetVersion: plan.targetVersion,
    },
    result: 'success',
    targetCollection: 'plugin-states',
    targetId: args.packageId,
  });

  return plan;
}

export async function createMarketplacePlanForPackage(args: {
  action: MarketplacePlanAction;
  channel?: UpdateChannel;
  packageId: string;
  user: AuthenticatedUserLike | null | undefined;
}) {
  const payload = await getPayloadClient();
  return createMarketplacePlanWithPayload(
    payload as unknown as MarketplaceServicePayloadClient,
    args,
  );
}

export function parseMarketplaceRequestOrThrow<T>(result: z.ZodSafeParseResult<T>) {
  if (result.success) {
    return result.data;
  }

  const message = result.error.issues.map((issue) => issue.message).join('; ');
  throw new MarketplaceFlowError(message || 'Invalid marketplace request.', 400);
}

export function normalizeMarketplaceError(error: unknown) {
  if (error instanceof MarketplaceFlowError) {
    return error;
  }

  if (error instanceof Error) {
    return new MarketplaceFlowError(error.message, 400);
  }

  return new MarketplaceFlowError('Marketplace request failed.', 400);
}
