import type { AppRole } from '@/lib/auth/roles';

export const APP_PERMISSIONS = [
  'admin:access',
  'audit:read',
  'content:delete',
  'content:read',
  'content:write',
  'media:manage',
  'redirects:manage',
  'redirects:read',
  'system:read',
  'system:install',
  'users:create',
  'users:delete',
  'users:read',
  'users:update',
  'users:roles:manage',
] as const;

export type AppPermission = (typeof APP_PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<AppRole, readonly AppPermission[]> = {
  'super-admin': APP_PERMISSIONS,
  admin: [
    'admin:access',
    'content:delete',
    'content:read',
    'content:write',
    'media:manage',
    'redirects:manage',
    'redirects:read',
  ],
  editor: ['content:delete', 'content:read', 'content:write', 'media:manage'],
};

export function getRolePermissions(role: AppRole): readonly AppPermission[] {
  return ROLE_PERMISSIONS[role];
}

export function roleHasPermission(role: AppRole, permission: AppPermission) {
  return ROLE_PERMISSIONS[role].includes(permission);
}
