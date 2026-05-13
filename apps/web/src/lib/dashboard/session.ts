import { getPayloadClient } from '@/lib/payload';
import { headers } from 'next/headers';
import { getUserRole, type AuthenticatedUserLike } from '@/lib/auth/access';
import type { DashboardIdentity } from '@/lib/dashboard/types';

export async function getDashboardUser(): Promise<AuthenticatedUserLike | null> {
  const payload = await getPayloadClient();
  const requestHeaders = await headers();
  const authResult = await payload.auth({
    headers: requestHeaders,
  });

  if (!authResult.user) {
    return null;
  }

  return {
    collection: 'collection' in authResult.user ? authResult.user.collection ?? 'users' : 'users',
    email: 'email' in authResult.user ? authResult.user.email ?? null : null,
    id: authResult.user.id,
    role: 'role' in authResult.user && typeof authResult.user.role === 'string'
      ? authResult.user.role
      : null,
  };
}

export async function getDashboardIdentity(): Promise<DashboardIdentity | null> {
  const user = await getDashboardUser();

  if (!user) {
    return null;
  }

  return {
    email: user.email ?? null,
    id: user.id,
    role: getUserRole(user),
  };
}
