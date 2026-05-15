import {
  membersCreateAccess,
  membersDeleteAccess,
  membersReadAccess,
  membersUnlockAccess,
  membersUpdateAccess,
} from '@/lib/auth/access';
import { createSiteRelationshipField } from '@/lib/sites/fields';
import {
  AUDIT_ACTIONS,
  getAuditActorFromRequest,
  writeAuditEntry,
} from '@/lib/audit/service';
import type {
  CollectionAfterChangeHook,
  CollectionAfterLoginHook,
  CollectionConfig,
} from 'payload';

const auditMemberChange: CollectionAfterChangeHook = async ({ context, doc, operation, req }) => {
  const actor = getAuditActorFromRequest(req, context) ?? {
    email: 'email' in doc ? doc.email ?? undefined : undefined,
    role: null,
    source: 'user' as const,
    userId: doc.id,
  };

  await writeAuditEntry(req.payload, {
    action: operation === 'create' ? AUDIT_ACTIONS.memberRegistered : AUDIT_ACTIONS.memberProfileUpdated,
    actor,
    metadata: {
      email: 'email' in doc ? doc.email : undefined,
      source: 'member-change',
    },
    result: 'success',
    targetCollection: 'members',
    targetId: doc.id,
  }, req);

  return doc;
};

const auditMemberLogin: CollectionAfterLoginHook = async ({ context, req, user }) => {
  const actor = getAuditActorFromRequest(req, context) ?? {
    email: 'email' in user ? user.email ?? undefined : undefined,
    role: null,
    source: 'user' as const,
    userId: user.id,
  };

  await writeAuditEntry(req.payload, {
    action: AUDIT_ACTIONS.memberLoginSucceeded,
    actor,
    result: 'success',
    targetCollection: 'members',
    targetId: user.id,
  }, req);

  return user;
};

export const Members: CollectionConfig = {
  slug: 'members',
  auth: true,
  admin: {
    hidden: true,
    useAsTitle: 'email',
  },
  access: {
    admin: () => false,
    create: membersCreateAccess,
    delete: membersDeleteAccess,
    read: membersReadAccess,
    unlock: membersUnlockAccess,
    update: membersUpdateAccess,
  },
  hooks: {
    afterChange: [auditMemberChange],
    afterLogin: [auditMemberLogin],
  },
  fields: [
    createSiteRelationshipField(),
    {
      name: 'firstName',
      type: 'text',
      maxLength: 80,
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      maxLength: 80,
    },
  ],
};
