import type { Metadata } from 'next';
import type { PayloadRequest, Where } from 'payload';
import type { AuthenticatedMemberLike } from '@/lib/auth/access';
import type { ContentAccessLevel } from '@/lib/content/access-fields';
import { buildSeoMetadata, type SeoFieldValue } from '@/lib/content/seo';
import { normalizeContentPath } from '@/lib/content/paths';
import { buildMemberLoginPath } from '@/lib/members/service';
import { getPayloadClient } from '@/lib/payload';
import { createSiteScopeWhere, resolveCurrentSite, type ResolvedSite } from '@/lib/sites/service';

type PayloadFindResult<T> = {
  docs: T[];
};

type PayloadPublicReader = {
  find: <T>(args: Record<string, unknown>) => Promise<PayloadFindResult<T>>;
};

export type PublishedMedia = {
  alt?: string | null;
  filename?: string | null;
  id: number | string;
  url?: string | null;
};

export type PublishedPage = {
  accessLevel?: ContentAccessLevel | null;
  body: string;
  builder?: unknown | null;
  excerpt?: string | null;
  heroImage?: PublishedMedia | number | string | null;
  id: number | string;
  publishedAt?: string | null;
  seo?: SeoFieldValue | null;
  site?: number | { id: number | string } | string | null;
  slug: string;
  title: string;
};

export type PublishedPost = {
  accessLevel?: ContentAccessLevel | null;
  body: string;
  excerpt?: string | null;
  featuredImage?: PublishedMedia | number | string | null;
  id: number | string;
  publishedAt?: string | null;
  seo?: SeoFieldValue | null;
  site?: number | { id: number | string } | string | null;
  slug: string;
  title: string;
};

export type PublishedRedirect = {
  destinationPath: string;
  id: number | string;
  isActive: boolean;
  site?: number | { id: number | string } | string | null;
  sourcePath: string;
  type: '301' | '302';
};

export type SitemapEntry = {
  lastModified?: string | null;
  path: string;
};

export type ProtectedContentAccessResult<T> =
  | {
      kind: 'granted';
      document: T;
    }
  | {
      kind: 'login-required';
      loginPath: string;
    }
  | {
      kind: 'not-found';
    };

async function getPublicReader() {
  return (await getPayloadClient()) as unknown as PayloadPublicReader;
}

function createMemberAwareReq(member: AuthenticatedMemberLike | null | undefined) {
  if (!member) {
    return undefined;
  }

  return {
    user: member,
  } as PayloadRequest;
}

function createMemberAwareWhere(
  slug: string,
  member: AuthenticatedMemberLike | null | undefined,
  site: ResolvedSite,
): Where {
  const slugClause = {
    slug: {
      equals: slug,
    },
  };
  const publishedClause = {
    _status: {
      equals: 'published',
    },
  };

  if (member) {
    return {
      and: [slugClause, publishedClause, createSiteScopeWhere(site)],
    };
  }

  return {
    and: [
      slugClause,
      publishedClause,
      createSiteScopeWhere(site),
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
  };
}

async function findFirstPublishedBySlug<T>(
  collection: 'pages' | 'posts',
  slug: string,
  site: ResolvedSite,
  member?: AuthenticatedMemberLike | null,
) {
  const payload = await getPublicReader();
  const result = await payload.find<T>({
    collection,
    depth: 1,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    ...(member ? { req: createMemberAwareReq(member) } : {}),
    where: createMemberAwareWhere(slug, member, site),
  });

  return result.docs[0] ?? null;
}

async function findProtectedDocumentBySlug<T>(collection: 'pages' | 'posts', slug: string, site: ResolvedSite) {
  const payload = await getPublicReader();
  const result = await payload.find<T>({
    collection,
    depth: 1,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
        createSiteScopeWhere(site),
      ],
    },
  });

  return result.docs[0] ?? null;
}

export async function resolvePublishedPageAccessBySlug(
  slug: string,
  member?: AuthenticatedMemberLike | null,
  siteArg?: ResolvedSite | null,
): Promise<ProtectedContentAccessResult<PublishedPage>> {
  const site = siteArg === undefined ? await resolveCurrentSite() : siteArg;

  if (!site) {
    return {
      kind: 'not-found',
    };
  }

  const page = await findFirstPublishedBySlug<PublishedPage>('pages', slug, site, member);

  if (page) {
    return {
      document: page,
      kind: 'granted',
    };
  }

  const protectedPage = await findProtectedDocumentBySlug<PublishedPage>('pages', slug, site);

  if (protectedPage?.accessLevel === 'members' && !member) {
    return {
      kind: 'login-required',
      loginPath: buildMemberLoginPath(`/${slug}`),
    };
  }

  return {
    kind: 'not-found',
  };
}

export async function resolvePublishedPostAccessBySlug(
  slug: string,
  member?: AuthenticatedMemberLike | null,
  siteArg?: ResolvedSite | null,
): Promise<ProtectedContentAccessResult<PublishedPost>> {
  const site = siteArg === undefined ? await resolveCurrentSite() : siteArg;

  if (!site) {
    return {
      kind: 'not-found',
    };
  }

  const post = await findFirstPublishedBySlug<PublishedPost>('posts', slug, site, member);

  if (post) {
    return {
      document: post,
      kind: 'granted',
    };
  }

  const protectedPost = await findProtectedDocumentBySlug<PublishedPost>('posts', slug, site);

  if (protectedPost?.accessLevel === 'members' && !member) {
    return {
      kind: 'login-required',
      loginPath: buildMemberLoginPath(`/journal/${slug}`),
    };
  }

  return {
    kind: 'not-found',
  };
}

export async function getPublishedRedirectByPath(pathname: string, siteArg?: ResolvedSite | null) {
  const site = siteArg === undefined ? await resolveCurrentSite() : siteArg;

  if (!site) {
    return null;
  }

  const payload = await getPublicReader();
  const normalized = normalizeContentPath(pathname);
  const result = await payload.find<PublishedRedirect>({
    collection: 'redirects',
    limit: 1,
    overrideAccess: false,
    pagination: false,
    where: {
      and: [
        {
          sourcePath: {
            equals: normalized,
          },
        },
        {
          isActive: {
            equals: true,
          },
        },
        createSiteScopeWhere(site),
      ],
    },
  });

  return result.docs[0] ?? null;
}

async function getPublishedCollectionEntries<T extends { publishedAt?: string | null; slug: string }>(
  collection: 'pages' | 'posts',
  site: ResolvedSite,
  prefix = '',
) {
  const payload = await getPublicReader();
  const result = await payload.find<T>({
    collection,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    sort: '-publishedAt',
    where: {
      and: [
        {
          _status: {
            equals: 'published',
          },
        },
        createSiteScopeWhere(site),
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
    },
  });

  return result.docs.map((doc) => ({
    lastModified: doc.publishedAt ?? null,
    path: `${prefix}/${doc.slug}`.replace(/\/{2,}/g, '/'),
  }));
}

export async function getPublishedSitemapEntries(siteArg?: ResolvedSite | null) {
  const site = siteArg === undefined ? await resolveCurrentSite() : siteArg;

  if (!site) {
    return [];
  }

  const [pages, posts] = await Promise.all([
    getPublishedCollectionEntries<PublishedPage>('pages', site),
    getPublishedCollectionEntries<PublishedPost>('posts', site, '/journal'),
  ]);

  return [...pages, ...posts];
}

export function buildContentMetadata(
  document: Pick<PublishedPage, 'excerpt' | 'seo' | 'title'> | Pick<PublishedPost, 'excerpt' | 'seo' | 'title'>,
): Metadata {
  return buildSeoMetadata({
    fallbackDescription: document.excerpt ?? null,
    fallbackTitle: document.title,
    seo: document.seo ?? null,
  });
}

export async function getPublishedPageBySlug(slug: string, member?: AuthenticatedMemberLike | null, siteArg?: ResolvedSite | null) {
  const result = await resolvePublishedPageAccessBySlug(slug, member, siteArg);

  return result.kind === 'granted' ? result.document : null;
}

export async function getPublishedPostBySlug(slug: string, member?: AuthenticatedMemberLike | null, siteArg?: ResolvedSite | null) {
  const result = await resolvePublishedPostAccessBySlug(slug, member, siteArg);

  return result.kind === 'granted' ? result.document : null;
}
