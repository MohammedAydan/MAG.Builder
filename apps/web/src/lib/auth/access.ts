import { APP_ROLES, type AppRole, isAppRole } from '@/lib/auth/roles';
import { type AppPermission, getRolePermissions } from '@/lib/auth/permissions';
import { createSiteScopeWhere, resolveSiteFromHeaders } from '@/lib/sites/service';
import type { Access, PayloadRequest, Where } from 'payload';

export type AuthenticatedUserLike = {
  collection?: string | null;
  email?: string | null;
  id: number | string;
  role?: string | null;
};

export type AuthenticatedMemberLike = {
  collection?: string | null;
  email?: string | null;
  firstName?: string | null;
  id: number | string;
  lastName?: string | null;
  siteId?: number | string | null;
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

export function canManageContent(user: AuthenticatedUserLike | null | undefined) {
  return hasPermission(user, 'content:write');
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

export function isMemberIdentity(user: AuthenticatedUserLike | AuthenticatedMemberLike | null | undefined) {
  return user?.collection === 'members';
}

export function canReadOwnMember(
  user: AuthenticatedMemberLike | null | undefined,
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

export const pluginStatesReadAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'plugins:read');

export const pluginStatesManageAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'plugins:manage');

export const commerceReadAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'commerce:read');

export const commerceManageAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'commerce:manage');

export function createPublishedOrPermissionWhere(
  req: { user: AuthenticatedUserLike | null | undefined },
  permission: AppPermission,
): true | false | Where {
  if (hasPermission(req.user as AuthenticatedUserLike | undefined, permission)) {
    return true;
  }

  return {
    _status: {
      equals: 'published',
    },
  };
}

export const publishedContentReadAccess: Access = async ({ req }) => {
  const user = req.user as AuthenticatedUserLike | AuthenticatedMemberLike | null | undefined;

  if (hasPermission(user as AuthenticatedUserLike | undefined, 'content:read')) {
    return true;
  }

  if (!req.headers || !req.payload) {
    return createPublishedContentAccessWhere(user);
  }

  const site = await resolveSiteFromHeaders(
    req.headers instanceof Headers ? req.headers : new Headers(req.headers as HeadersInit),
    req.payload as unknown as Parameters<typeof resolveSiteFromHeaders>[1],
  );

  if (!site) {
    return false;
  }

  const baseWhere = createPublishedContentAccessWhere(user);

  if (baseWhere === true || baseWhere === false) {
    return baseWhere;
  }

  return {
    and: [baseWhere, createSiteScopeWhere(site)],
  };
};

export function createPublishedContentAccessWhere(
  user: AuthenticatedUserLike | AuthenticatedMemberLike | null | undefined,
): true | false | Where {
  if (hasPermission(user as AuthenticatedUserLike | undefined, 'content:read')) {
    return true;
  }

  if (isMemberIdentity(user)) {
    return {
      _status: {
        equals: 'published',
      },
    };
  }

  return {
    and: [
      {
        _status: {
          equals: 'published',
        },
      },
      {
        or: [
          {
            accessLevel: {
              equals: 'public',
            },
          },
          {
            accessLevel: {
              exists: false,
            },
          },
        ],
      },
    ],
  };
}

export const contentCreateAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'content:write');

export const contentUpdateAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'content:write');

export const contentDeleteAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'content:delete');

export const mediaReadAccess: Access = () => true;

export const mediaManageAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'media:manage');

export const redirectsReadAccess: Access = async ({ req }) => {
  if (hasPermission(req.user as AuthenticatedUserLike | undefined, 'redirects:read')) {
    return true;
  }

  if (!req.headers || !req.payload) {
    return {
      isActive: {
        equals: true,
      },
    };
  }

  const site = await resolveSiteFromHeaders(
    req.headers instanceof Headers ? req.headers : new Headers(req.headers as HeadersInit),
    req.payload as unknown as Parameters<typeof resolveSiteFromHeaders>[1],
  );

  if (!site) {
    return false;
  }

  return {
    and: [
      {
        isActive: {
          equals: true,
        },
      },
      createSiteScopeWhere(site),
    ],
  };
};

export const redirectsManageAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'redirects:manage');

export function getRoleOptions() {
  return APP_ROLES.map((role) => ({
    label: role === 'super-admin' ? 'Super Admin' : `${role.slice(0, 1).toUpperCase()}${role.slice(1)}`,
    value: role,
  }));
}

/**
 * Form definition read access: admin/editor with forms:read or content:read.
 * Public users must never read form definitions (they may contain workflow config).
 */
export const formDefinitionsAdminReadAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'forms:read') ||
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'content:read');

export const formDefinitionsManageAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'forms:manage');

export const membersAdminAccess: Access = () => false;

export const membersCreateAccess: Access = () => false;

export const membersDeleteAccess: Access = () => false;

export const membersReadAccess: Access = ({ req }) => {
  const user = req.user as AuthenticatedUserLike | AuthenticatedMemberLike | null | undefined;

  if (!isMemberIdentity(user)) {
    return false;
  }

  const member = user as AuthenticatedMemberLike;

  return {
    id: {
      equals: member.id,
    },
  };
};

export const membersUpdateAccess: Access = ({ req }) => {
  const user = req.user as AuthenticatedUserLike | AuthenticatedMemberLike | null | undefined;

  if (!isMemberIdentity(user)) {
    return false;
  }

  const member = user as AuthenticatedMemberLike;

  return {
    id: {
      equals: member.id,
    },
  };
};

export const membersUnlockAccess: Access = () => false;

export const webhooksReadAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'webhooks:read');

export const webhooksManageAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'webhooks:manage');

export const integrationsReadAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'integrations:read');

export const integrationsManageAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'integrations:manage');

// ---------------------------------------------------------------------------
// Phase 22 — Search, Analytics, Automation access helpers
// ---------------------------------------------------------------------------

/** Search is readable by authenticated admins/editors; public search is handled in the Route Handler. */
export const searchReadAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'search:read');

/** Analytics aggregates — admin-only */
export const analyticsAdminAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'analytics:admin');

/** Analytics events collection — admin read only */
export const analyticsReadAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'analytics:read') ||
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'analytics:admin');

/** Automation rules — admin manage */
export const automationManageAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'automation:manage');

/** Automation rules — admin read */
export const automationReadAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'automation:read') ||
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'automation:manage');

// ---------------------------------------------------------------------------
// Phase 33 — SaaS Control Plane access helpers
// ---------------------------------------------------------------------------

export const sitesReadAccess: Access = ({ req }) => {
  if (hasPermission(req.user as AuthenticatedUserLike | undefined, 'sites:read')) {
    return true;
  }

  if (!req.user) return false;

  // Users can read sites they are members of
  return {
    id: {
      in: {
        relationTo: 'site-memberships',
        path: 'site',
        where: {
          user: {
            equals: req.user.id,
          },
        },
      },
    },
  };
};

export const sitesManageAccess: Access = ({ req }) => {
  if (hasPermission(req.user as AuthenticatedUserLike | undefined, 'sites:manage')) {
    return true;
  }

  if (!req.user) return false;

  // Site owners/admins can manage their site
  return {
    id: {
      in: {
        relationTo: 'site-memberships',
        path: 'site',
        where: {
          and: [
            {
              user: {
                equals: req.user.id,
              },
            },
            {
              role: {
                in: ['site-owner', 'site-admin'],
              },
            },
          ],
        },
      },
    },
  };
};

export const siteMembershipsReadAccess: Access = ({ req }) => {
  if (hasPermission(req.user as AuthenticatedUserLike | undefined, 'sites:read')) {
    return true;
  }

  if (!req.user) return false;

  return {
    user: {
      equals: req.user.id,
    },
  };
};

export const siteMembershipsManageAccess: Access = ({ req }) => {
  if (hasPermission(req.user as AuthenticatedUserLike | undefined, 'sites:manage')) {
    return true;
  }

  if (!req.user) return false;

  // Site owners/admins can manage memberships of their sites
  return {
    site: {
      in: {
        relationTo: 'site-memberships',
        path: 'site',
        where: {
          and: [
            {
              user: {
                equals: req.user.id,
              },
            },
            {
              role: {
                in: ['site-owner', 'site-admin'],
              },
            },
          ],
        },
      },
    },
  };
};
