import { headers } from 'next/headers';
import { DEFAULT_SITE_ID, DEFAULT_SITE_SLUG, buildDefaultSiteName, isDevelopmentHostname, normalizeHostname } from '@/lib/sites/model';

type SiteDomain = {
  developmentOnly?: boolean | null;
  hostname?: string | null;
  primary?: boolean | null;
};

type SiteRecord = {
  domains?: SiteDomain[] | null;
  id: number | string;
  isDefault?: boolean | null;
  name: string;
  siteId: string;
  slug: string;
  status?: 'active' | 'suspended' | null;
};

type InstallationStateRecord = {
  siteName?: string | null;
};

type PayloadFindResult<T> = {
  docs: T[];
};

type SitePayloadClient = {
  create: (args: Record<string, unknown>) => Promise<unknown>;
  find: <T>(args: Record<string, unknown>) => Promise<PayloadFindResult<T>>;
};

export type ResolvedSite = {
  id: number | string;
  isDefault: boolean;
  name: string;
  primaryHostname: string | null;
  siteId: string;
  slug: string;
};

function toResolvedSite(record: SiteRecord): ResolvedSite {
  const primaryDomain = (record.domains ?? []).find((domain) => domain.primary && domain.hostname)?.hostname ?? null;

  return {
    id: record.id,
    isDefault: Boolean(record.isDefault),
    name: record.name,
    primaryHostname: primaryDomain,
    siteId: record.siteId,
    slug: record.slug,
  };
}

async function getSitePayloadClient(payload?: SitePayloadClient) {
  if (payload) {
    return payload;
  }

  const { getPayloadClient } = await import('@/lib/payload');
  return getPayloadClient() as unknown as Promise<SitePayloadClient>;
}

export async function ensureDefaultSiteRecord(payloadArg?: SitePayloadClient) {
  const payload = await getSitePayloadClient(payloadArg);
  const existing = await payload.find<SiteRecord>({
    collection: 'sites',
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
  });

  const matchedDefault = existing.docs.find((site) => site.siteId === DEFAULT_SITE_ID || site.slug === DEFAULT_SITE_SLUG || site.isDefault);

  if (matchedDefault) {
    return toResolvedSite(matchedDefault);
  }

  const installation = await payload.find<InstallationStateRecord>({
    collection: 'installation-state',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
  });

  const created = (await payload.create({
    collection: 'sites',
    data: {
      domains: [],
      isDefault: true,
      name: buildDefaultSiteName(installation.docs[0]?.siteName),
      siteId: DEFAULT_SITE_ID,
      slug: DEFAULT_SITE_SLUG,
      status: 'active',
    },
    overrideAccess: true,
  })) as SiteRecord;

  return toResolvedSite(created);
}

function shouldUseDefaultForHost(hostname: string | null, sites: SiteRecord[]) {
  if (!hostname) {
    return true;
  }

  if (isDevelopmentHostname(hostname)) {
    return true;
  }

  const hasMappedProductionDomain = sites.some((site) =>
    (site.domains ?? []).some((domain) => domain.hostname && !domain.developmentOnly),
  );

  return !hasMappedProductionDomain;
}

export async function resolveSiteFromHostname(hostname: string | null, payloadArg?: SitePayloadClient): Promise<ResolvedSite | null> {
  const payload = await getSitePayloadClient(payloadArg);
  const normalizedHost = hostname ? normalizeHostname(hostname) : null;
  const sites = await payload.find<SiteRecord>({
    collection: 'sites',
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    where: {
      status: {
        not_equals: 'suspended',
      },
    },
  });

  const matchedSite = normalizedHost
    ? sites.docs.find((site) =>
        (site.domains ?? []).some((domain) => normalizeHostname(domain.hostname ?? '') === normalizedHost),
      )
    : undefined;

  if (matchedSite) {
    return toResolvedSite(matchedSite);
  }

  if (!shouldUseDefaultForHost(normalizedHost, sites.docs)) {
    return null;
  }

  return ensureDefaultSiteRecord(payload);
}

function shouldTrustForwardedHost() {
  return process.env.NEXPRESS_TRUST_PROXY_HOST === 'true';
}

export function extractHostnameFromHeaders(headerBag: Headers) {
  const forwardedHost = shouldTrustForwardedHost() ? headerBag.get('x-forwarded-host') : null;
  const candidate = forwardedHost?.split(',')[0]?.trim() || headerBag.get('host')?.trim() || null;

  return candidate ? normalizeHostname(candidate) : null;
}

export async function resolveSiteFromHeaders(headerBag: Headers, payloadArg?: SitePayloadClient) {
  const hostname = extractHostnameFromHeaders(headerBag);
  return resolveSiteFromHostname(hostname, payloadArg);
}

export async function resolveCurrentSite() {
  const currentHeaders = await headers();
  return resolveSiteFromHeaders(new Headers(currentHeaders));
}

export function createSiteScopeWhere(site: ResolvedSite) {
  if (site.isDefault) {
    return {
      or: [
        {
          site: {
            equals: site.id,
          },
        },
        {
          site: {
            exists: false,
          },
        },
      ],
    };
  }

  return {
    site: {
      equals: site.id,
    },
  };
}

export function extractSiteRelationshipId(value: number | string | { id: number | string } | null | undefined) {
  if (value == null) {
    return null;
  }

  if (typeof value === 'object') {
    return value.id ?? null;
  }

  return value;
}

export async function getSelectedSiteId(): Promise<string> {
  const site = await resolveCurrentSite();
  return String(site?.id || DEFAULT_SITE_ID);
}

export function isResolvedSiteMatch(site: ResolvedSite, relation: number | string | { id: number | string } | null | undefined) {
  const relationId = extractSiteRelationshipId(relation);

  if (relationId == null) {
    return site.isDefault;
  }

  return String(relationId) === String(site.id);
}
