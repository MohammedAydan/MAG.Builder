import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionSlug,
} from 'payload';
import {
  AUDIT_ACTIONS,
  getAuditActorFromRequest,
  writeAuditEntry,
} from '@/lib/audit/service';

type AuditCollectionOptions = {
  collection: CollectionSlug;
  labelField?: string;
};

export function createAuditedAfterChangeHook({
  collection,
  labelField = 'title',
}: AuditCollectionOptions): CollectionAfterChangeHook {
  return async ({ context, doc, operation, req }) => {
    const actor = getAuditActorFromRequest(req, context);
    const title =
      typeof doc?.[labelField] === 'string'
        ? (doc[labelField] as string)
        : typeof doc?.slug === 'string'
          ? (doc.slug as string)
          : undefined;

    await writeAuditEntry(req.payload, {
      action: operation === 'create' ? AUDIT_ACTIONS.contentCreated : AUDIT_ACTIONS.contentUpdated,
      ...(actor ? { actor } : {}),
      metadata: {
        collection,
        slug: typeof doc?.slug === 'string' ? doc.slug : undefined,
        status: typeof doc?._status === 'string' ? doc._status : undefined,
        title,
      },
      result: 'success',
      targetCollection: collection,
      targetId: doc.id,
    }, req);

    return doc;
  };
}

export function createAuditedAfterDeleteHook({
  collection,
  labelField = 'title',
}: AuditCollectionOptions): CollectionAfterDeleteHook {
  return async ({ context, doc, req }) => {
    const actor = getAuditActorFromRequest(req, context);
    const title =
      typeof doc?.[labelField] === 'string'
        ? (doc[labelField] as string)
        : typeof doc?.slug === 'string'
          ? (doc.slug as string)
          : undefined;

    await writeAuditEntry(req.payload, {
      action: AUDIT_ACTIONS.contentDeleted,
      ...(actor ? { actor } : {}),
      metadata: {
        collection,
        slug: typeof doc?.slug === 'string' ? doc.slug : undefined,
        title,
      },
      result: 'success',
      targetCollection: collection,
      targetId: doc.id,
    }, req);

    return doc;
  };
}
