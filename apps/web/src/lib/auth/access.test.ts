import {
  AuthorizationError,
  canAccessAdminPanel,
  createPublishedContentAccessWhere,
  canReadOwnUser,
  createSelfOrPermissionWhere,
  getUserRole,
  hasPermission,
  isMemberIdentity,
  requirePermission,
} from '@/lib/auth/access';
import { describe, expect, it } from 'vitest';

describe('auth access helpers', () => {
  const superAdmin = { id: '1', role: 'super-admin' };
  const admin = { id: '2', role: 'admin' };
  const editor = { id: '3', role: 'editor' };
  const member = { collection: 'members', email: 'member@example.com', id: '4' };

  it('parses explicit typed roles', () => {
    expect(getUserRole(superAdmin)).toBe('super-admin');
    expect(getUserRole({ id: 'x', role: 'unknown' })).toBeNull();
    expect(getUserRole(null)).toBeNull();
  });

  it('applies the permission matrix centrally', () => {
    expect(hasPermission(superAdmin, 'users:create')).toBe(true);
    expect(hasPermission(superAdmin, 'audit:read')).toBe(true);
    expect(hasPermission(admin, 'admin:access')).toBe(true);
    expect(hasPermission(admin, 'users:create')).toBe(false);
    expect(hasPermission(editor, 'admin:access')).toBe(false);
    expect(hasPermission(null, 'admin:access')).toBe(false);
  });

  it('treats only admin roles as admin-panel users', () => {
    expect(canAccessAdminPanel(superAdmin)).toBe(true);
    expect(canAccessAdminPanel(admin)).toBe(true);
    expect(canAccessAdminPanel(editor)).toBe(false);
    expect(canAccessAdminPanel(member)).toBe(false);
  });

  it('supports self-read/update checks without granting global access', () => {
    expect(canReadOwnUser(editor, '3')).toBe(true);
    expect(canReadOwnUser(editor, '8')).toBe(false);
    expect(createSelfOrPermissionWhere({ user: editor }, 'users:read')).toEqual({
      id: { equals: '3' },
    });
    expect(createSelfOrPermissionWhere({ user: superAdmin }, 'users:read')).toBe(true);
    expect(createSelfOrPermissionWhere({ user: null }, 'users:read')).toBe(false);
  });

  it('throws typed authorization errors for denied permissions', () => {
    expect(() => requirePermission(editor, 'users:create')).toThrow(AuthorizationError);
    expect(() => requirePermission(superAdmin, 'users:create')).not.toThrow();
  });

  it('keeps members distinct from admin users and grants member-aware published reads only', () => {
    expect(isMemberIdentity(member)).toBe(true);
    expect(isMemberIdentity(editor)).toBe(false);
    expect(createPublishedContentAccessWhere(member)).toEqual({
      _status: {
        equals: 'published',
      },
    });
    expect(createPublishedContentAccessWhere(null)).toEqual({
      and: [
        {
          _status: {
            equals: 'published',
          },
        },
        {
          or: [
            {
              accessLevel: {
                equals: 'public',
              },
            },
            {
              accessLevel: {
                exists: false,
              },
            },
          ],
        },
      ],
    });
  });
});
