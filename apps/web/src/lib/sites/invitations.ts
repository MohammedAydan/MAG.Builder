import { type BasePayload, type PayloadRequest } from 'payload';
import crypto from 'crypto';
import type { Site } from '@/payload-types';

export type InvitationOptions = {
  email: string;
  siteId: number;
  role: 'site-admin' | 'site-editor';
  invitedBy: number;
};

export async function createSiteInvitation(
  payload: BasePayload,
  options: InvitationOptions,
  req?: PayloadRequest,
) {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Expires in 7 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await payload.create({
    collection: 'site-invitations',
    data: {
      email: options.email,
      site: options.siteId,
      role: options.role,
      invitedBy: options.invitedBy,
      token: hashedToken,
      expiresAt: expiresAt.toISOString(),
      status: 'pending',
    },
    ...(req ? { req } : {}),
  });

  return {
    ...invitation,
    token, // Return the raw token to be sent via email (not saved in DB)
  };
}

export async function acceptSiteInvitation(
  payload: BasePayload,
  token: string,
  userId: number,
  req?: PayloadRequest,
) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const invitations = await payload.find({
    collection: 'site-invitations',
    where: {
      and: [
        {
          token: {
            equals: hashedToken,
          },
        },
        {
          status: {
            equals: 'pending',
          },
        },
        {
          expiresAt: {
            greater_than: new Date().toISOString(),
          },
        },
      ],
    },
    limit: 1,
    ...(req ? { req } : {}),
  });

  if (invitations.docs.length === 0) {
    throw new Error('Invalid or expired invitation token.');
  }

  const invitation = invitations.docs[0];
  if (!invitation) {
    throw new Error('Invitation not found.');
  }

  // Create membership
  await payload.create({
    collection: 'site-memberships',
    data: {
      user: userId,
      site: typeof invitation.site === 'object' ? (invitation.site as Site).id : (invitation.site as number),
      role: invitation.role,
    },
    ...(req ? { req } : {}),
  });

  // Update invitation status
  await payload.update({
    collection: 'site-invitations',
    id: invitation.id,
    data: {
      status: 'accepted',
    },
    ...(req ? { req } : {}),
  });

  return invitation;
}
