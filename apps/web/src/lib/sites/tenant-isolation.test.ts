import { describe, expect, it } from 'vitest';
import { sitesReadAccess, sitesManageAccess, siteMembershipsReadAccess } from '@/lib/auth/access';
import type { AuthenticatedUserLike } from '@/lib/auth/access';
import type { AccessArgs, Access } from 'payload';

describe('tenant isolation access control', () => {
  const superAdmin: AuthenticatedUserLike = { id: 'sa', role: 'super-admin' };
  const admin: AuthenticatedUserLike = { id: 'adm', role: 'admin' };
  const editor: AuthenticatedUserLike = { id: 'ed', role: 'editor' };

  it('allows super-admin to read all sites', async () => {
    const access = sitesReadAccess as Access;
    const result = await access({
      req: { user: superAdmin },
    } as AccessArgs);
    expect(result).toBe(true);
  });

  it('allows admin to read all sites', async () => {
    const access = sitesReadAccess as Access;
    const result = await access({
      req: { user: admin },
    } as AccessArgs);
    expect(result).toBe(true);
  });

  it('restricts editor to sites they are members of', async () => {
    const access = sitesReadAccess as Access;
    const result = await access({
      req: { user: editor },
    } as AccessArgs);
    
    expect(result).toEqual({
      id: {
        in: {
          relationTo: 'site-memberships',
          path: 'site',
          where: {
            user: {
              equals: 'ed',
            },
          },
        },
      },
    });
  });

  it('restricts site management to super-admin, admin, or site-owners/admins', async () => {
    const access = sitesManageAccess as Access;
    
    const superAdminResult = await access({
      req: { user: superAdmin },
    } as AccessArgs);
    expect(superAdminResult).toBe(true);

    const adminResult = await access({
      req: { user: admin },
    } as AccessArgs);
    expect(adminResult).toBe(true);

    const editorResult = await access({
      req: { user: editor },
    } as AccessArgs);
    
    expect(editorResult).toEqual({
      id: {
        in: {
          relationTo: 'site-memberships',
          path: 'site',
          where: {
            and: [
              { user: { equals: 'ed' } },
              { role: { in: ['site-owner', 'site-admin'] } },
            ],
          },
        },
      },
    });
  });

  it('isolates memberships to own user unless super-admin/admin', async () => {
    const access = siteMembershipsReadAccess as Access;

    const saResult = await access({
      req: { user: superAdmin },
    } as AccessArgs);
    expect(saResult).toBe(true);

    const edResult = await access({
      req: { user: editor },
    } as AccessArgs);
    expect(edResult).toEqual({
      user: {
        equals: 'ed',
      },
    });
  });
});
