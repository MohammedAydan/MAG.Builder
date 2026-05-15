import type { AppRole } from '@/lib/auth/roles';

export const APP_PERMISSIONS = [
  'admin:access',
  'audit:read',
  'commerce:manage',
  'commerce:read',
  'content:delete',
  'content:read',
  'content:write',
  'forms:manage',
  'forms:read',
  'media:manage',
  'plugins:manage',
  'plugins:read',
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
    'commerce:manage',
    'commerce:read',
    'content:delete',
    'content:read',
    'content:write',
    'forms:manage',
    'forms:read',
    'media:manage',
    'plugins:manage',
    'plugins:read',
    'redirects:manage',
    'redirects:read',
  ],
  editor: ['content:delete', 'content:read', 'content:write', 'forms:read', 'media:manage'],
};

export function getRolePermissions(role: AppRole): readonly AppPermission[] {
  return ROLE_PERMISSIONS[role];
}

export function roleHasPermission(role: AppRole, permission: AppPermission) {
  return ROLE_PERMISSIONS[role].includes(permission);
}
