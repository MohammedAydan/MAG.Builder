export const APP_ROLES = ['super-admin', 'admin', 'editor'] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  'super-admin': 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
};

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === 'string' && APP_ROLES.includes(value as AppRole);
}

export function getRoleLabel(role: AppRole) {
  return ROLE_LABELS[role];
}
