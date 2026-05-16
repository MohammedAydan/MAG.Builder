import {
  getRoleOptions,
  usersCollectionAdminAccess,
  usersCreateAccess,
  usersDeleteAccess,
  usersManageRolesFieldAccess,
  usersReadAccess,
  usersUnlockAccess,
  usersUpdateAccess,
} from '@/lib/auth/access';
import { isAppRole } from '@/lib/auth/roles';
import {
  AUDIT_ACTIONS,
  getAuditActorFromRequest,
  writeAuditEntry,
} from '@/lib/audit/service';
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionAfterLoginHook,
  CollectionAfterLogoutHook,
  CollectionConfig,
} from 'payload';

const auditUserChange: CollectionAfterChangeHook = async ({
  context,
  doc,
  operation,
  req,
}) => {
  const actor = getAuditActorFromRequest(req, context);

  await writeAuditEntry(req.payload, {
    action: operation === 'create' ? AUDIT_ACTIONS.userCreated : AUDIT_ACTIONS.userUpdated,
    ...(actor ? { actor } : {}),
    metadata: {
      email: 'email' in doc ? doc.email : undefined,
      role: 'role' in doc ? doc.role : undefined,
      source: 'user-change',
    },
    result: 'success',
    targetCollection: 'users',
    targetId: doc.id,
  }, req);

  return doc;
};

const auditUserDelete: CollectionAfterDeleteHook = async ({ context, doc, req }) => {
  const actor = getAuditActorFromRequest(req, context);

  await writeAuditEntry(req.payload, {
    action: AUDIT_ACTIONS.userDeleted,
    ...(actor ? { actor } : {}),
    metadata: {
      email: 'email' in doc ? doc.email : undefined,
      role: 'role' in doc ? doc.role : undefined,
      source: 'user-delete',
    },
    result: 'success',
    targetCollection: 'users',
    targetId: doc.id,
  }, req);

  return doc;
};

const auditLogin: CollectionAfterLoginHook = async ({ context, req, user }) => {
  const actor = getAuditActorFromRequest(req, context) ?? {
    ...('email' in user && user.email ? { email: user.email } : {}),
    ...('role' in user && isAppRole(user.role) ? { role: user.role } : { role: null }),
    source: 'user' as const,
    ...(user.id ? { userId: user.id } : {}),
  };

  await writeAuditEntry(req.payload, {
    action: AUDIT_ACTIONS.authLoginSucceeded,
    actor,
    result: 'success',
    targetCollection: 'users',
    targetId: user.id,
  }, req);

  return user;
};

const auditLogout: CollectionAfterLogoutHook = async ({ context, req }) => {
  const actor = getAuditActorFromRequest(req, context);

  await writeAuditEntry(req.payload, {
    action: AUDIT_ACTIONS.authLogoutSucceeded,
    ...(actor ? { actor } : {}),
    result: 'success',
    targetCollection: 'users',
    ...(req.user?.id != null ? { targetId: req.user.id } : {}),
  }, req);
};

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'System & Marketplace',
  },
  access: {
    admin: usersCollectionAdminAccess,
    create: usersCreateAccess,
    delete: usersDeleteAccess,
    read: usersReadAccess,
    unlock: usersUnlockAccess,
    update: usersUpdateAccess,
  },
  hooks: {
    afterChange: [auditUserChange],
    afterDelete: [auditUserDelete],
    afterLogin: [auditLogin],
    afterLogout: [auditLogout],
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      access: {
        create: usersManageRolesFieldAccess,
        update: usersManageRolesFieldAccess,
      },
      options: getRoleOptions(),
    },
  ],
};
