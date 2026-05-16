import {
  type CommerceAdapter,
  type CommerceCustomerRecord,
} from '@nexpress/commerce';
import { type ResolvedSite, createSiteScopeWhere } from '@/lib/sites/service';
import { getPayload, findMemberValue } from './common';
import {
  type CommerceServicePayloadClient,
  type PayloadCommerceCustomerDoc,
} from './types';

export async function ensureCommerceCustomerForMemberWithPayload(
  payload: CommerceServicePayloadClient,
  adapter: CommerceAdapter,
  member: { id: string | number; email?: string | null },
  site: ResolvedSite,
): Promise<CommerceCustomerRecord> {
  const existingLookup = await payload.find({
    collection: 'commerce-customers',
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        {
          member: {
            equals: member.id,
          },
        },
        createSiteScopeWhere(site),
      ],
    },
  });

  const existing = existingLookup.docs[0] as PayloadCommerceCustomerDoc | undefined;

  if (existing) {
    const remote = await adapter.customers.getByExternalId(existing.externalCustomerId);

    if (remote) {
      return remote;
    }
  }

  const created = await adapter.customers.create({
    email: member.email || '',
    firstName: 'Member',
    lastName: String(member.id),
    memberId: String(member.id),
  });

  await payload.create({
    collection: 'commerce-customers',
    data: {
      email: created.email,
      externalCustomerId: created.externalId,
      member: member.id,
      provider: adapter.provider,
      site: site.id,
    },
    overrideAccess: true,
  });

  return created;
}

export async function listAllCustomers(user: any) {
  const payload = await getPayload();

  const result = await payload.find({
    collection: 'commerce-customers',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    user,
  });

  return result.docs;
}
