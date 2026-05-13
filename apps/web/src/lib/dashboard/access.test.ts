import { describe, expect, it } from 'vitest';
import {
  canAccessDashboardSettings,
  resolveDashboardAccess,
} from '@/lib/dashboard/access';
import { getDashboardNavigation } from '@/lib/dashboard/navigation';

describe('dashboard access decisions', () => {
  const superAdmin = { collection: 'users', email: 'root@example.com', id: '1', role: 'super-admin' };
  const admin = { collection: 'users', email: 'admin@example.com', id: '2', role: 'admin' };
  const editor = { collection: 'users', email: 'editor@example.com', id: '3', role: 'editor' };

  it('redirects anonymous users to Payload admin login', () => {
    expect(resolveDashboardAccess(null)).toEqual({
      kind: 'redirect',
      to: '/admin',
    });
  });

  it('redirects authenticated non-admin users away from the dashboard shell', () => {
    expect(resolveDashboardAccess(editor)).toEqual({
      kind: 'redirect',
      to: '/',
    });
  });

  it('allows admin-capable roles into the dashboard shell', () => {
    expect(resolveDashboardAccess(admin)).toEqual({ kind: 'allow' });
    expect(resolveDashboardAccess(superAdmin)).toEqual({ kind: 'allow' });
  });

  it('keeps settings access limited to super-admin capabilities', () => {
    expect(canAccessDashboardSettings(superAdmin)).toBe(true);
    expect(canAccessDashboardSettings(admin)).toBe(false);
  });
});

describe('dashboard navigation', () => {
  const superAdmin = { collection: 'users', email: 'root@example.com', id: '1', role: 'super-admin' };
  const admin = { collection: 'users', email: 'admin@example.com', id: '2', role: 'admin' };
  const editor = { collection: 'users', email: 'editor@example.com', id: '3', role: 'editor' };

  it('shows only allowed navigation items for each role', () => {
    expect(getDashboardNavigation(superAdmin).map((item) => item.title)).toEqual([
      'Overview',
      'Content Studio',
      'Settings',
    ]);

    expect(getDashboardNavigation(admin).map((item) => item.title)).toEqual([
      'Overview',
      'Content Studio',
    ]);

    expect(getDashboardNavigation(editor)).toEqual([]);
  });
});
