import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SITE_ID,
  buildDefaultSiteName,
  normalizeHostname,
  normalizeSiteSlug,
  validateDomainHostname,
} from '@/lib/sites/model';
import {
  createSiteScopeWhere,
  isResolvedSiteMatch,
  resolveSiteFromHostname,
} from '@/lib/sites/service';

describe('site model helpers', () => {
  it('normalizes slugs and hostnames safely', () => {
    expect(normalizeSiteSlug(' Primary Site ')).toBe('primary-site');
    expect(normalizeHostname('WWW.Example.com.')).toBe('www.example.com');
    expect(buildDefaultSiteName('  NexPress  ')).toBe('NexPress');
  });

  it('rejects unsafe production hostnames', () => {
    expect(validateDomainHostname('example.com', false)).toBe(true);
    expect(validateDomainHostname('localhost', false)).not.toBe(true);
    expect(validateDomainHostname('10.0.0.4', false)).not.toBe(true);
    expect(validateDomainHostname('localhost', true)).toBe(true);
  });
});

describe('site resolution', () => {
const payload = {
    create: async ({ data }: Record<string, unknown>) => ({
      id: 'created-default',
      ...(data as Record<string, unknown>),
    }),
    find: async ({ collection }: Record<string, unknown>) => {
      if (collection === 'sites') {
        return {
          docs: [
            {
              domains: [{ hostname: 'alpha.example.com', primary: true }],
              id: 'site-a',
              isDefault: false,
              name: 'Alpha',
              siteId: 'alpha',
              slug: 'alpha',
              status: 'active',
            },
            {
              domains: [],
              id: 'site-default',
              isDefault: true,
              name: 'Default',
              siteId: DEFAULT_SITE_ID,
              slug: 'default',
              status: 'active',
            },
          ],
        };
      }

      return {
        docs: [{ siteName: 'Default' }],
      };
    },
  } as unknown as Parameters<typeof resolveSiteFromHostname>[1];

  it('resolves explicit domain mappings before falling back', async () => {
    await expect(resolveSiteFromHostname('alpha.example.com', payload)).resolves.toEqual({
      id: 'site-a',
      isDefault: false,
      name: 'Alpha',
      primaryHostname: 'alpha.example.com',
      siteId: 'alpha',
      slug: 'alpha',
    });
  });

  it('uses the default site for localhost development requests', async () => {
    await expect(resolveSiteFromHostname('localhost', payload)).resolves.toEqual({
      id: 'site-default',
      isDefault: true,
      name: 'Default',
      primaryHostname: null,
      siteId: 'default',
      slug: 'default',
    });
  });

  it('fails closed for unknown production hosts when domains are configured', async () => {
    await expect(resolveSiteFromHostname('unknown.example.com', payload)).resolves.toBeNull();
  });
});

describe('site scope helpers', () => {
  it('matches default-site fallback for missing relations and rejects cross-site ids', () => {
    const defaultSite = {
      id: 'site-default',
      isDefault: true,
      name: 'Default',
      primaryHostname: null,
      siteId: 'default',
      slug: 'default',
    } as const;
    const tenantSite = {
      id: 'site-a',
      isDefault: false,
      name: 'Tenant',
      primaryHostname: 'tenant.example.com',
      siteId: 'tenant',
      slug: 'tenant',
    } as const;

    expect(createSiteScopeWhere(defaultSite)).toEqual({
      or: [
        { site: { equals: 'site-default' } },
        { site: { exists: false } },
      ],
    });
    expect(isResolvedSiteMatch(defaultSite, null)).toBe(true);
    expect(isResolvedSiteMatch(tenantSite, null)).toBe(false);
    expect(isResolvedSiteMatch(tenantSite, 'site-a')).toBe(true);
    expect(isResolvedSiteMatch(tenantSite, 'site-b')).toBe(false);
  });
});
