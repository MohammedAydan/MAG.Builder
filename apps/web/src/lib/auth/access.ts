import { APP_ROLES, type AppRole, isAppRole } from '@/lib/auth/roles';
import { type AppPermission, getRolePermissions } from '@/lib/auth/permissions';
import type { Access, PayloadRequest, Where } from 'payload';

export type AuthenticatedUserLike = {
  collection?: string | null;
  email?: string | null;
  id: number | string;
  role?: string | null;
};

export class AuthorizationError extends Error {
  constructor(
    message: string,
    readonly permission: AppPermission,
  ) {
    super(message);
  }
}

export function getUserRole(user: AuthenticatedUserLike | null | undefined): AppRole | null {
  return isAppRole(user?.role) ? user.role : null;
}

export function isAdminRole(role: AppRole | null) {
  return role === 'super-admin' || role === 'admin';
}

export function hasPermission(
  user: AuthenticatedUserLike | null | undefined,
  permission: AppPermission,
) {
  const role = getUserRole(user);

  if (!role) {
    return false;
  }

  return getRolePermissions(role).includes(permission);
}

export function canAccessAdminPanel(user: AuthenticatedUserLike | null | undefined) {
  return hasPermission(user, 'admin:access');
}

export function canReadOwnUser(
  user: AuthenticatedUserLike | null | undefined,
  requestedID?: number | string | null,
) {
  if (!user || requestedID == null) {
    return false;
  }

  return String(user.id) === String(requestedID);
}

export function requirePermission(
  user: AuthenticatedUserLike | null | undefined,
  permission: AppPermission,
  message = 'Forbidden',
) {
  if (!hasPermission(user, permission)) {
    throw new AuthorizationError(message, permission);
  }
}

export function createSelfOrPermissionWhere(
  req: { user: AuthenticatedUserLike | null | undefined },
  permission: AppPermission,
): boolean | Where {
  if (hasPermission(req.user as AuthenticatedUserLike | undefined, permission)) {
    return true;
  }

  if (!req.user) {
    return false;
  }

  return {
    id: {
      equals: req.user.id,
    },
  };
}

export const usersAdminAccess: Access = ({ req }) =>
  canAccessAdminPanel(req.user as AuthenticatedUserLike | undefined);

export function usersCollectionAdminAccess({ req }: { req: PayloadRequest }) {
  return canAccessAdminPanel(req.user as AuthenticatedUserLike | undefined);
}

export const usersReadAccess: Access = ({ req }) =>
  createSelfOrPermissionWhere(
    { user: req.user as AuthenticatedUserLike | null | undefined },
    'users:read',
  );

export const usersCreateAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'users:create');

export const usersUpdateAccess: Access = ({ req }) =>
  createSelfOrPermissionWhere(
    { user: req.user as AuthenticatedUserLike | null | undefined },
    'users:update',
  );

export const usersDeleteAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'users:delete');

export const usersUnlockAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'users:update');

export const usersManageRolesAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'users:roles:manage');

export function usersManageRolesFieldAccess({ req }: { req: PayloadRequest }) {
  return hasPermission(req.user as AuthenticatedUserLike | undefined, 'users:roles:manage');
}

export const auditLogsReadAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'audit:read');

export const installationStateReadAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'system:read');

export function getRoleOptions() {
  return APP_ROLES.map((role) => ({
    label: role === 'super-admin' ? 'Super Admin' : `${role.slice(0, 1).toUpperCase()}${role.slice(1)}`,
    value: role,
  }));
}
