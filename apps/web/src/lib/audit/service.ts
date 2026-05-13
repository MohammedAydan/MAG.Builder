import { isAppRole, type AppRole } from '@/lib/auth/roles';

export const AUDIT_CONTEXT_KEY = 'nexpressAudit';

export const AUDIT_ACTIONS = {
  authLoginSucceeded: 'auth.login.succeeded',
  authLogoutSucceeded: 'auth.logout.succeeded',
  contentCreated: 'content.created',
  contentDeleted: 'content.deleted',
  contentUpdated: 'content.updated',
  installCompleted: 'system.install.completed',
  userCreated: 'users.created',
  userDeleted: 'users.deleted',
  userUpdated: 'users.updated',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
export type AuditResult = 'failure' | 'success';

export type AuditActor = {
  email?: string;
  role?: AppRole | null;
  source?: 'anonymous' | 'system' | 'user';
  userId?: number | string;
};

export type AuditMetadata = Record<string, unknown>;

export type AuditEntryInput = {
  action: AuditAction;
  actor?: AuditActor;
  metadata?: AuditMetadata;
  result: AuditResult;
  targetCollection?: string;
  targetId?: number | string;
};

type AuditContext = {
  actor?: AuditActor;
  metadata?: AuditMetadata;
  source?: string;
};

const SENSITIVE_KEYS = new Set([
  'adminpassword',
  'authorization',
  'cookie',
  'databaseurl',
  'password',
  'payloadsecret',
  'secret',
  'token',
]);

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      const normalizedKey = key.replace(/[_-]/g, '').toLowerCase();

      if (SENSITIVE_KEYS.has(normalizedKey)) {
        continue;
      }

      const nextValue = sanitizeValue(nestedValue);
      if (typeof nextValue !== 'undefined') {
        sanitized[key] = nextValue;
      }
    }

    return sanitized;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  return undefined;
}

export function sanitizeAuditMetadata(metadata?: AuditMetadata) {
  if (!metadata) {
    return undefined;
  }

  const sanitized = sanitizeValue(metadata);

  if (!sanitized || typeof sanitized !== 'object' || Array.isArray(sanitized)) {
    return undefined;
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

export function createAuditContext(context: AuditContext) {
  return {
    [AUDIT_CONTEXT_KEY]: context,
  };
}

export function getAuditContext(context: Record<string, unknown> | undefined) {
  const value = context?.[AUDIT_CONTEXT_KEY];

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  return value as AuditContext;
}

export function getAuditActorFromRequest(
  req: { user?: { email?: string | null; id?: number | string; role?: string | null } | null },
  context?: Record<string, unknown>,
): AuditActor | undefined {
  const contextualActor = getAuditContext(context)?.actor;
  if (contextualActor) {
    return contextualActor;
  }

  if (!req.user) {
    return undefined;
  }

  return {
    ...(req.user.email ? { email: req.user.email } : {}),
    ...(isAppRole(req.user.role) ? { role: req.user.role } : { role: null }),
    source: 'user',
    ...(req.user.id != null ? { userId: req.user.id } : {}),
  };
}

export async function writeAuditEntry(payload: unknown, entry: AuditEntryInput) {
  try {
    const auditPayload = payload as {
      create: (args: Record<string, unknown>) => Promise<unknown>;
    };

    await auditPayload.create({
      collection: 'audit-logs',
      data: {
        action: entry.action,
        actorEmail: entry.actor?.email,
        actorRole: entry.actor?.role,
        actorSource: entry.actor?.source ?? (entry.actor ? 'user' : 'system'),
        actorUser: entry.actor?.userId,
        metadata: sanitizeAuditMetadata(entry.metadata),
        occurredAt: new Date().toISOString(),
        result: entry.result,
        targetCollection: entry.targetCollection,
        targetId: entry.targetId != null ? String(entry.targetId) : undefined,
      },
      overrideAccess: true,
    });
  } catch {
    console.error('[audit] Failed to write audit entry.');
  }
}
