import type { Field, FieldHook } from 'payload';
import { ensureDefaultSiteRecord } from '@/lib/sites/service';

export const assignDefaultSiteRelationship: FieldHook = async ({ req, value }) => {
  if (value != null && value !== '') {
    return value;
  }

  const site = await ensureDefaultSiteRecord(req.payload as unknown as Parameters<typeof ensureDefaultSiteRecord>[0]);
  return site.id;
};

export function createSiteRelationshipField(): Field {
  return {
    name: 'site',
    type: 'relationship',
    relationTo: 'sites',
    index: true,
    admin: {
      description: 'Tenant/site boundary. Defaults to the default site for existing single-site data.',
      position: 'sidebar',
    },
    hooks: {
      beforeValidate: [assignDefaultSiteRelationship],
    },
  };
}
