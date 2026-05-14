import type { AuthenticatedUserLike } from '@/lib/auth/access';
import {
  canAccessDashboardContent,
  canAccessDashboardSettings,
  resolveDashboardAccess,
} from '@/lib/dashboard/access';
import { getDashboardUser } from '@/lib/dashboard/session';
import { redirect } from 'next/navigation';

export async function requireDashboardUser(): Promise<AuthenticatedUserLike> {
  const user = await getDashboardUser();
  const access = resolveDashboardAccess(user);

  if (access.kind === 'redirect') {
    redirect(access.to);
  }

  return user as AuthenticatedUserLike;
}

export async function requireDashboardSettingsUser() {
  const user = await requireDashboardUser();

  if (!canAccessDashboardSettings(user)) {
    redirect('/dashboard');
  }

  return user;
}

export async function requireDashboardContentUser() {
  const user = await requireDashboardUser();

  if (!canAccessDashboardContent(user)) {
    redirect('/dashboard');
  }

  return user;
}
