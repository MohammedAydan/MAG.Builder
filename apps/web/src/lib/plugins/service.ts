import {
  defaultPluginRegistry,
  planPluginMigrations,
  type PluginCapability,
  type PluginMigrationRecord,
  type PluginMigrationPlan,
  type PluginStateSnapshot,
} from '@nexpress/plugins';
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
  activatedAt?: string | null;
  deactivatedAt?: string | null;
  enabled?: boolean | null;
  enabledModules?: { moduleId?: string | null }[] | null;
  id: number | string;
  migrations?:
    | {
        destructive?: boolean | null;
        description?: string | null;
        executedAt?: string | null;
        migrationId?: string | null;
        name?: string | null;
        status?: 'applied' | 'pending' | null;
        version?: string | null;
      }[]
    | null;
  pluginId: string;
  pluginVersion: string;
};

type PayloadFindResult<T> = {
  docs: T[];
};

export type PluginServicePayloadClient = {
  create: (args: Record<string, unknown>) => Promise<unknown>;
  find: (args: Record<string, unknown>) => Promise<PayloadFindResult<PayloadPluginStateDoc>>;
  update: (args: Record<string, unknown>) => Promise<unknown>;
};

const activateRequestSchema = z
  .object({
    enabledModules: z.array(z.string().trim().min(1)).max(50).optional(),
    pluginId: z.string().trim().min(1),
  })
  .strict();

const deactivateRequestSchema = z
  .object({
    pluginId: z.string().trim().min(1),
  })
  .strict();

const migrationPlanRequestSchema = z
  .object({
    pluginId: z.string().trim().min(1),
  })
  .strict();

const migrationRunRequestSchema = z
  .object({
    allowDestructive: z.boolean().optional(),
    migrationId: z.string().trim().min(1),
    pluginId: z.string().trim().min(1),
  })
  .strict();

export class PluginFlowError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function assertPluginManagerUser(
  user: AuthenticatedUserLike | null | undefined,
): asserts user is AuthenticatedUserLike {
  if (!user || !canAccessAdminPanel(user) || !hasPermission(user, 'plugins:manage')) {
    throw new PluginFlowError('Forbidden', 403);
  }
}

function createPluginAuditActor(user: AuthenticatedUserLike) {
  return {
    ...(user.email ? { email: user.email } : {}),
    role: getUserRole(user),
    source: 'user' as const,
    userId: user.id,
  };
}

function normalizeMigrationRecords(
  migrations: PayloadPluginStateDoc['migrations'],
): readonly PluginMigrationRecord[] {
  return (migrations ?? [])
    .filter(
      (migration): migration is NonNullable<PayloadPluginStateDoc['migrations']>[number] =>
        Boolean(migration?.migrationId) && Boolean(migration.version),
    )
    .map((migration) => ({
      ...(migration.executedAt ? { executedAt: migration.executedAt } : {}),
      id: String(migration.migrationId),
      status: migration.status === 'applied' ? 'applied' : 'pending',
      version: String(migration.version),
    }));
}

function mapPluginStateRecord(record: PayloadPluginStateDoc): PluginStateSnapshot {
  return {
    enabled: record.enabled === true,
    enabledModules: (record.enabledModules ?? [])
      .map((entry) => entry.moduleId)
      .filter((value): value is string => typeof value === 'string' && value.length > 0)
      .sort(),
    migrations: normalizeMigrationRecords(record.migrations),
    pluginId: record.pluginId,
  };
}

function toEnabledModuleData(moduleIds: readonly string[]) {
  return moduleIds.map((moduleId) => ({
    moduleId,
  }));
}

function toMigrationStateData(plan: PluginMigrationPlan) {
  return plan.steps.map((step) => ({
    description: step.definition.description,
    destructive: step.definition.destructive === true,
    ...(step.executedAt ? { executedAt: step.executedAt } : {}),
    migrationId: step.definition.id,
    name: step.definition.name,
    status: step.status,
    version: step.definition.version,
  }));
}

async function findPluginStateRecord(
  payload: PluginServicePayloadClient,
  pluginId: string,
  user: AuthenticatedUserLike,
) {
  const result = await payload.find({
    collection: 'plugin-states',
    limit: 1,
    overrideAccess: false,
    pagination: false,
    user,
    where: {
      pluginId: {
        equals: pluginId,
      },
    },
  });

  return result.docs[0] ?? null;
}

async function listPluginStateSnapshots(
  payload: PluginServicePayloadClient,
  user: AuthenticatedUserLike,
) {
  const result = await payload.find({
    collection: 'plugin-states',
    limit: 100,
    overrideAccess: false,
    pagination: false,
    user,
  });

  return result.docs.map(mapPluginStateRecord);
}

async function writePluginAudit(
  payload: PluginServicePayloadClient,
  args: {
    action: (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
    metadata: Record<string, unknown>;
    targetId: string;
    user: AuthenticatedUserLike;
  },
) {
  await writeAuditEntry(payload, {
    action: args.action,
    actor: createPluginAuditActor(args.user),
    metadata: args.metadata,
    result: 'success',
    targetCollection: 'plugin-states',
    targetId: args.targetId,
  });
}

function createStateSummary(
  pluginId: string,
  enabled: boolean,
  enabledModules: readonly string[],
  migrationPlan: PluginMigrationPlan,
) {
  return {
    enabled,
    enabledModules,
    pendingMigrations: migrationPlan.pending.map((step) => step.definition.id),
    pluginId,
  };
}

export function parsePluginActivationRequest(input: unknown) {
  return activateRequestSchema.safeParse(input);
}

export function parsePluginDeactivationRequest(input: unknown) {
  return deactivateRequestSchema.safeParse(input);
}

export function parsePluginMigrationPlanRequest(input: unknown) {
  return migrationPlanRequestSchema.safeParse(input);
}

export function parsePluginMigrationRunRequest(input: unknown) {
  return migrationRunRequestSchema.safeParse(input);
}

export async function listAvailablePluginsWithPayload(
  payload: PluginServicePayloadClient,
  user: AuthenticatedUserLike | null | undefined,
) {
  assertPluginManagerUser(user);
  const states = await listPluginStateSnapshots(payload, user);
  const stateMap = new Map(states.map((state) => [state.pluginId, state] as const));

  return defaultPluginRegistry.list().map((definition) => {
    const currentState = stateMap.get(definition.manifest.id) ?? {
      enabled: false,
      enabledModules: [],
      migrations: [],
      pluginId: definition.manifest.id,
    };
    const capabilitySnapshot = defaultPluginRegistry.resolveCapabilitySnapshot(currentState);
    const migrationPlan = planPluginMigrations(
      definition.manifest,
      currentState.migrations,
    );

    return {
      capabilities: capabilitySnapshot.capabilities,
      dependencies: definition.manifest.dependencies ?? [],
      description: definition.manifest.description,
      enabled: currentState.enabled,
      enabledModules: capabilitySnapshot.enabledModules,
      id: definition.manifest.id,
      modules: definition.manifest.modules ?? [],
      pendingMigrationCount: migrationPlan.pending.length,
      version: definition.manifest.version,
    };
  });
}

export async function listAvailablePlugins(user: AuthenticatedUserLike | null | undefined) {
  const payload = await getPayloadClient();
  return listAvailablePluginsWithPayload(payload as unknown as PluginServicePayloadClient, user);
}

export async function getPlugin(
  pluginId: string,
  user: AuthenticatedUserLike | null | undefined,
) {
  const plugins = await listAvailablePlugins(user);
  return plugins.find((plugin) => plugin.id === pluginId);
}

export async function activatePluginWithPayload(
  payload: PluginServicePayloadClient,
  args: {
    enabledModules?: readonly string[];
    pluginId: string;
    user: AuthenticatedUserLike | null | undefined;
  },
) {
  assertPluginManagerUser(args.user);
  const user = args.user;
  const activeStates = await listPluginStateSnapshots(payload, user);
  const validation = defaultPluginRegistry.validateActivation(
    {
      ...(args.enabledModules ? { enabledModules: args.enabledModules } : {}),
      pluginId: args.pluginId,
    },
    activeStates,
  );

  if (!validation.success) {
    throw new PluginFlowError(validation.errors.join('; '), 400);
  }

  const existing = await findPluginStateRecord(payload, args.pluginId, user);
  const migrationPlan = planPluginMigrations(
    validation.manifest,
    existing ? normalizeMigrationRecords(existing.migrations) : [],
  );
  const isIdempotent =
    existing?.enabled === true
    && JSON.stringify(mapPluginStateRecord(existing).enabledModules) === JSON.stringify(validation.resolvedModuleIds)
    && existing.pluginVersion === validation.manifest.version;

  if (!isIdempotent) {
    const data = {
      activatedAt: new Date().toISOString(),
      activatedBy: user.id,
      deactivatedAt: null,
      deactivatedBy: null,
      enabled: true,
      enabledModules: toEnabledModuleData(validation.resolvedModuleIds),
      migrations: toMigrationStateData(migrationPlan),
      pluginId: validation.pluginId,
      pluginVersion: validation.manifest.version,
    };

    if (existing) {
      await payload.update({
        collection: 'plugin-states',
        data,
        id: existing.id,
        overrideAccess: false,
        user,
      });
    } else {
      await payload.create({
        collection: 'plugin-states',
        data,
        overrideAccess: false,
        user,
      });
    }
  }

  await writePluginAudit(payload, {
    action: AUDIT_ACTIONS.pluginActivated,
    metadata: {
      capabilities: validation.resolvedCapabilities,
      modules: validation.resolvedModuleIds,
      pendingMigrationCount: migrationPlan.pending.length,
      status: isIdempotent ? 'already-enabled' : 'enabled',
    },
    targetId: validation.pluginId,
    user,
  });

  return {
    ...createStateSummary(
      validation.pluginId,
      true,
      validation.resolvedModuleIds,
      migrationPlan,
    ),
    capabilities: validation.resolvedCapabilities,
    status: isIdempotent ? 'already-enabled' : 'enabled',
  };
}

export async function activatePlugin(args: {
  enabledModules?: readonly string[];
  pluginId: string;
  user: AuthenticatedUserLike | null | undefined;
}) {
  const payload = await getPayloadClient();
  return activatePluginWithPayload(payload as unknown as PluginServicePayloadClient, args);
}

export async function deactivatePluginWithPayload(
  payload: PluginServicePayloadClient,
  args: {
    pluginId: string;
    user: AuthenticatedUserLike | null | undefined;
  },
) {
  assertPluginManagerUser(args.user);
  const user = args.user;
  const definition = defaultPluginRegistry.get(args.pluginId);

  if (!definition) {
    throw new PluginFlowError(`Unknown plugin "${args.pluginId}".`, 404);
  }

  const existing = await findPluginStateRecord(payload, args.pluginId, user);
  const migrationPlan = planPluginMigrations(
    definition.manifest,
    existing ? normalizeMigrationRecords(existing.migrations) : [],
  );

  if (!existing || existing.enabled !== true) {
    await writePluginAudit(payload, {
      action: AUDIT_ACTIONS.pluginDeactivated,
      metadata: {
        modules: [],
        status: 'already-disabled',
      },
      targetId: args.pluginId,
      user,
    });

    return {
      ...createStateSummary(args.pluginId, false, [], migrationPlan),
      status: 'already-disabled',
    };
  }

  await payload.update({
    collection: 'plugin-states',
    data: {
      deactivatedAt: new Date().toISOString(),
      deactivatedBy: user.id,
      enabled: false,
      enabledModules: [],
      migrations: toMigrationStateData(migrationPlan),
      pluginId: existing.pluginId,
      pluginVersion: definition.manifest.version,
    },
    id: existing.id,
    overrideAccess: false,
    user,
  });

  await writePluginAudit(payload, {
    action: AUDIT_ACTIONS.pluginDeactivated,
    metadata: {
      modules: [],
      status: 'disabled',
    },
    targetId: args.pluginId,
    user,
  });

  return {
    ...createStateSummary(args.pluginId, false, [], migrationPlan),
    status: 'disabled',
  };
}

export async function deactivatePlugin(args: {
  pluginId: string;
  user: AuthenticatedUserLike | null | undefined;
}) {
  const payload = await getPayloadClient();
  return deactivatePluginWithPayload(payload as unknown as PluginServicePayloadClient, args);
}

export async function planPluginMigrationsWithPayload(
  payload: PluginServicePayloadClient,
  args: {
    pluginId: string;
    user: AuthenticatedUserLike | null | undefined;
  },
) {
  assertPluginManagerUser(args.user);
  const user = args.user;
  const definition = defaultPluginRegistry.get(args.pluginId);

  if (!definition) {
    throw new PluginFlowError(`Unknown plugin "${args.pluginId}".`, 404);
  }

  const existing = await findPluginStateRecord(payload, args.pluginId, user);
  const migrationPlan = planPluginMigrations(
    definition.manifest,
    existing ? normalizeMigrationRecords(existing.migrations) : [],
  );

  await writePluginAudit(payload, {
    action: AUDIT_ACTIONS.pluginMigrationPlanned,
    metadata: {
      pendingMigrationIds: migrationPlan.pending.map((step) => step.definition.id),
      stepCount: migrationPlan.steps.length,
    },
    targetId: args.pluginId,
    user,
  });

  return migrationPlan;
}

export async function planPluginMigrationsForPlugin(args: {
  pluginId: string;
  user: AuthenticatedUserLike | null | undefined;
}) {
  const payload = await getPayloadClient();
  return planPluginMigrationsWithPayload(payload as unknown as PluginServicePayloadClient, args);
}

export async function runPluginMigrationWithPayload(
  payload: PluginServicePayloadClient,
  args: {
    allowDestructive?: boolean;
    migrationId: string;
    pluginId: string;
    user: AuthenticatedUserLike | null | undefined;
  },
) {
  assertPluginManagerUser(args.user);
  const user = args.user;
  const definition = defaultPluginRegistry.get(args.pluginId);

  if (!definition) {
    throw new PluginFlowError(`Unknown plugin "${args.pluginId}".`, 404);
  }

  const existing = await findPluginStateRecord(payload, args.pluginId, user);

  if (!existing || existing.enabled !== true) {
    throw new PluginFlowError(
      `Plugin "${args.pluginId}" must be enabled before migrations can run.`,
      409,
    );
  }

  const migrationPlan = planPluginMigrations(
    definition.manifest,
    normalizeMigrationRecords(existing.migrations),
  );
  const targetStep = migrationPlan.steps.find(
    (step) => step.definition.id === args.migrationId,
  );

  if (!targetStep) {
    throw new PluginFlowError(
      `Unknown migration "${args.migrationId}" for plugin "${args.pluginId}".`,
      404,
    );
  }

  if (targetStep.definition.destructive === true && args.allowDestructive !== true) {
    throw new PluginFlowError(
      `Migration "${args.migrationId}" is marked destructive and requires explicit confirmation.`,
      409,
    );
  }

  if (targetStep.status === 'applied') {
    await writePluginAudit(payload, {
      action: AUDIT_ACTIONS.pluginMigrationExecuted,
      metadata: {
        destructive: targetStep.definition.destructive === true,
        migrationId: targetStep.definition.id,
        status: 'already-applied',
      },
      targetId: args.pluginId,
      user,
    });

    return {
      migrationId: targetStep.definition.id,
      pluginId: args.pluginId,
      status: 'already-applied',
    };
  }

  const executedAt = new Date().toISOString();
  const nextPlan = {
    ...migrationPlan,
    pending: migrationPlan.pending.filter(
      (step) => step.definition.id !== targetStep.definition.id,
    ),
    steps: migrationPlan.steps.map((step) =>
      step.definition.id === targetStep.definition.id
        ? {
            ...step,
            executedAt,
            status: 'applied' as const,
          }
        : step,
    ),
  };

  await payload.update({
    collection: 'plugin-states',
    data: {
      enabled: true,
      enabledModules: existing.enabledModules ?? [],
      migrations: nextPlan.steps.map((step) => ({
        description: step.definition.description,
        destructive: step.definition.destructive === true,
        ...(step.executedAt ? { executedAt: step.executedAt } : {}),
        migrationId: step.definition.id,
        name: step.definition.name,
        status: step.status,
        version: step.definition.version,
      })),
      pluginId: existing.pluginId,
      pluginVersion: definition.manifest.version,
    },
    id: existing.id,
    overrideAccess: false,
    user,
  });

  await writePluginAudit(payload, {
    action: AUDIT_ACTIONS.pluginMigrationExecuted,
    metadata: {
      destructive: targetStep.definition.destructive === true,
      migrationId: targetStep.definition.id,
      status: 'applied',
    },
    targetId: args.pluginId,
    user,
  });

  return {
    executedAt,
    migrationId: targetStep.definition.id,
    pluginId: args.pluginId,
    status: 'applied',
  };
}

export async function runPluginMigration(args: {
  allowDestructive?: boolean;
  migrationId: string;
  pluginId: string;
  user: AuthenticatedUserLike | null | undefined;
}) {
  const payload = await getPayloadClient();
  return runPluginMigrationWithPayload(payload as unknown as PluginServicePayloadClient, args);
}

export async function hasActivePluginCapabilityWithPayload(
  payload: PluginServicePayloadClient,
  args: {
    capability: PluginCapability;
    pluginId: string;
  },
) {
  const result = await payload.find({
    collection: 'plugin-states',
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        {
          pluginId: {
            equals: args.pluginId,
          },
        },
        {
          enabled: {
            equals: true,
          },
        },
      ],
    },
  });

  const record = result.docs[0];

  if (!record) {
    return false;
  }

  const snapshot = defaultPluginRegistry.resolveCapabilitySnapshot(
    mapPluginStateRecord(record),
  );

  return snapshot.enabled && snapshot.capabilities.includes(args.capability);
}

export async function hasActivePluginCapability(args: {
  capability: PluginCapability;
  pluginId: string;
}) {
  const payload = await getPayloadClient();
  return hasActivePluginCapabilityWithPayload(
    payload as unknown as PluginServicePayloadClient,
    args,
  );
}

export function parsePluginRequestOrThrow<T>(result: z.ZodSafeParseResult<T>) {
  if (result.success) {
    return result.data;
  }

  const message = result.error.issues.map((issue) => issue.message).join('; ');
  throw new PluginFlowError(message || 'Invalid plugin request.', 400);
}

export function normalizePluginError(error: unknown) {
  if (error instanceof PluginFlowError) {
    return error;
  }

  if (error instanceof Error) {
    return new PluginFlowError(error.message, 400);
  }

  return new PluginFlowError('Plugin request failed.', 400);
}

