import { type BasePayload, type PayloadRequest } from 'payload';

export async function getSiteMemberships(
  payload: BasePayload,
  userId: number,
  req?: PayloadRequest,
) {
  return payload.find({
    collection: 'site-memberships',
    where: {
      user: {
        equals: userId,
      },
    },
    ...(req ? { req } : {}),
  });
}

export async function isSiteMember(
  payload: BasePayload,
  userId: number,
  siteId: number,
  req?: PayloadRequest,
) {
  const memberships = await payload.find({
    collection: 'site-memberships',
    where: {
      and: [
        {
          user: {
            equals: userId,
          },
        },
        {
          site: {
            equals: siteId,
          },
        },
      ],
    },
    limit: 1,
    ...(req ? { req } : {}),
  });

  return memberships.docs.length > 0;
}

export async function getSiteUserRole(
  payload: BasePayload,
  userId: number,
  siteId: number,
  req?: PayloadRequest,
) {
  const memberships = await payload.find({
    collection: 'site-memberships',
    where: {
      and: [
        {
          user: {
            equals: userId,
          },
        },
        {
          site: {
            equals: siteId,
          },
        },
      ],
    },
    limit: 1,
    ...(req ? { req } : {}),
  });

  return memberships.docs[0]?.role ?? null;
}
