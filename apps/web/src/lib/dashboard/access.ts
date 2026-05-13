import {
  canAccessAdminPanel,
  hasPermission,
  type AuthenticatedUserLike,
} from '@/lib/auth/access';

export type DashboardAccessDecision =
  | {
      kind: 'allow';
    }
  | {
      kind: 'redirect';
      to: '/' | '/admin';
    };

export function resolveDashboardAccess(
  user: AuthenticatedUserLike | null | undefined,
): DashboardAccessDecision {
  if (!user) {
    return {
      kind: 'redirect',
      to: '/admin',
    };
  }

  if (!canAccessAdminPanel(user)) {
    return {
      kind: 'redirect',
      to: '/',
    };
  }

  return {
    kind: 'allow',
  };
}

export function canAccessDashboardSettings(
  user: AuthenticatedUserLike | null | undefined,
) {
  return hasPermission(user, 'system:read');
}
