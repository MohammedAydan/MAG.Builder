/**
 * Defines standard API scopes.
 */
export const ApiScopes = {
  PUBLIC_READ: 'public:read',
  MEMBER_READ: 'member:read',
  MEMBER_WRITE: 'member:write',
  ADMIN_READ: 'admin:read',
  ADMIN_WRITE: 'admin:write',
  SYSTEM: 'system',
} as const;

export type ApiScope = (typeof ApiScopes)[keyof typeof ApiScopes];

export interface ApiKeyData {
  id: string;
  scopes: ApiScope[];
  expiresAt?: string;
}

/**
 * Validates if the provided scopes contain the required scope.
 */
export function hasScope(requiredScope: ApiScope, availableScopes: ApiScope[]): boolean {
  if (availableScopes.includes(ApiScopes.SYSTEM)) {
    return true; // SYSTEM scope has all access
  }
  return availableScopes.includes(requiredScope);
}
