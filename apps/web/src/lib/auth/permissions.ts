import type { AppRole } from '@/lib/auth/roles';

export const APP_PERMISSIONS = [
  'admin:access',
  'analytics:admin',
  'analytics:read',
  'audit:read',
  'automation:manage',
  'automation:read',
  'commerce:manage',
  'commerce:read',
  'content:delete',
  'content:read',
  'content:write',
  'forms:manage',
  'forms:read',
  'media:manage',
  'marketplace:manage',
  'marketplace:read',
  'plugins:manage',
  'plugins:read',
  'redirects:manage',
  'redirects:read',
  'search:read',
  'system:install',
  'system:read',
  'users:create',
  'users:delete',
  'users:read',
  'users:update',
  'users:roles:manage',
  'sites:read',
  'sites:manage',
  'webhooks:read',
  'webhooks:manage',
  'integrations:read',
  'integrations:manage',
] as const;

export type AppPermission = (typeof APP_PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<AppRole, readonly AppPermission[]> = {
  'super-admin': APP_PERMISSIONS,
  admin: [
    'admin:access',
    'analytics:admin',
    'analytics:read',
    'automation:manage',
    'automation:read',
    'commerce:manage',
    'commerce:read',
    'content:delete',
    'content:read',
    'content:write',
    'forms:manage',
    'forms:read',
    'media:manage',
    'marketplace:manage',
    'marketplace:read',
    'plugins:manage',
    'plugins:read',
    'redirects:manage',
    'redirects:read',
    'search:read',
    'sites:read',
    'sites:manage',
    'webhooks:read',
    'webhooks:manage',
    'integrations:read',
    'integrations:manage',
  ],
  editor: ['content:delete', 'content:read', 'content:write', 'forms:read', 'media:manage', 'search:read'],
};

export function getRolePermissions(role: AppRole): readonly AppPermission[] {
  return ROLE_PERMISSIONS[role];
}

export function roleHasPermission(role: AppRole, permission: AppPermission) {
  return ROLE_PERMISSIONS[role].includes(permission);
}
