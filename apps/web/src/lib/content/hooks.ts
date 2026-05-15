import type { FieldHook } from 'payload';
import { normalizeContentPath } from '@/lib/content/paths';
import { normalizeSlugSegment } from '@/lib/content/slug';
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
