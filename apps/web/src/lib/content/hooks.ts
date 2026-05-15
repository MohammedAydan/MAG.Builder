import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, FieldHook } from 'payload';
import { fireAutomationTrigger } from '@/lib/automation/hooks';
import { normalizeContentPath } from '@/lib/content/paths';
import { normalizeSlugSegment } from '@/lib/content/slug';
import { enqueueWebhookDelivery } from '@/lib/webhooks/outbound';
import { ensureDefaultSiteRecord } from '@/lib/sites/service';

export const populateSlugFromSiblingData: FieldHook = ({ operation, siblingData, value }) => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return normalizeSlugSegment(value);
  }

  if (operation === 'create' || operation === 'update') {
    const title = typeof siblingData?.title === 'string' ? siblingData.title : '';
    return normalizeSlugSegment(title);
  }

  return value;
};

export const normalizePathField: FieldHook = ({ value }) => {
  if (typeof value !== 'string') {
    return value;
  }

  return normalizeContentPath(value);
};

export const assignDefaultSiteField: FieldHook = async ({ req, value }) => {
  if (value != null && value !== '') {
    return value;
  }

  const site = await ensureDefaultSiteRecord(req.payload as unknown as Parameters<typeof ensureDefaultSiteRecord>[0]);
  return site.id;
};

type HookContentDoc = {
  accessLevel?: string | null;
  id: number | string;
  publishedAt?: string | null;
  site?: number | string | { id: number | string } | null;
  slug?: string | null;
  title?: string | null;
  _status?: string | null;
};

function toAutomationAccessLevel(value: string | null | undefined) {
  return value === 'members' || value === 'members-only' ? 'members-only' : 'public';
}

function isPublished(doc: HookContentDoc | undefined) {
  return doc?._status === 'published';
}

export function createContentLifecycleAfterChangeHook(
  contentType: 'page' | 'post',
): CollectionAfterChangeHook {
  return async ({ doc, previousDoc }) => {
    const current = doc as HookContentDoc;
    const previous = previousDoc as HookContentDoc | undefined;

    if (!current.slug || !current.title) {
      return doc;
    }

    if (isPublished(current)) {
      await fireAutomationTrigger({
        payload: {
          accessLevel: toAutomationAccessLevel(current.accessLevel),
          contentId: String(current.id),
          contentType,
          siteId: current.site != null ? String(typeof current.site === 'object' ? current.site.id : current.site) : undefined,
          slug: current.slug,
          title: current.title,
        },
        trigger: 'content.published',
      });

      if (contentType === 'page') {
        await enqueueWebhookDelivery({
          data: {
            pageId: String(current.id),
            slug: current.slug,
          },
          event: 'page.published',
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        });
      }
    }

    if (isPublished(previous) && !isPublished(current)) {
      await fireAutomationTrigger({
        payload: {
          contentId: String(current.id),
          contentType,
          siteId: current.site != null ? String(typeof current.site === 'object' ? current.site.id : current.site) : undefined,
        },
        trigger: 'content.unpublished',
      });

      if (contentType === 'page' && current.slug) {
        await enqueueWebhookDelivery({
          data: {
            pageId: String(current.id),
            slug: current.slug,
          },
          event: 'page.unpublished',
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        });
      }
    }

    return doc;
  };
}

export function createContentLifecycleAfterDeleteHook(
  contentType: 'page' | 'post',
): CollectionAfterDeleteHook {
  return async ({ doc }) => {
    const current = doc as HookContentDoc;

    await fireAutomationTrigger({
      payload: {
        contentId: String(current.id),
        contentType,
        siteId: current.site != null ? String(typeof current.site === 'object' ? current.site.id : current.site) : undefined,
      },
      trigger: 'content.unpublished',
    });

    if (contentType === 'page' && current.slug) {
      await enqueueWebhookDelivery({
        data: {
          pageId: String(current.id),
          slug: current.slug,
        },
        event: 'page.unpublished',
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      });
    }

    return doc;
  };
}
