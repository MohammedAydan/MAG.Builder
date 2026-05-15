import type { Metadata } from 'next';
import type { PayloadRequest, Where } from 'payload';
import type { AuthenticatedMemberLike } from '@/lib/auth/access';
import type { ContentAccessLevel } from '@/lib/content/access-fields';
import { buildSeoMetadata, type SeoFieldValue } from '@/lib/content/seo';
import { normalizeContentPath } from '@/lib/content/paths';
import { buildMemberLoginPath } from '@/lib/members/service';
import { getPayloadClient } from '@/lib/payload';

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
  slug: string;
  title: string;
};

export type PublishedRedirect = {
  destinationPath: string;
  id: number | string;
  isActive: boolean;
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

function createMemberAwareWhere(slug: string, member: AuthenticatedMemberLike | null | undefined): Where {
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
      and: [slugClause, publishedClause],
    };
  }

  return {
    and: [
      slugClause,
      publishedClause,
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
    where: createMemberAwareWhere(slug, member),
  });

  return result.docs[0] ?? null;
}

async function findProtectedDocumentBySlug<T>(collection: 'pages' | 'posts', slug: string) {
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
      ],
    },
  });

  return result.docs[0] ?? null;
}

export async function resolvePublishedPageAccessBySlug(
  slug: string,
  member?: AuthenticatedMemberLike | null,
): Promise<ProtectedContentAccessResult<PublishedPage>> {
  const page = await findFirstPublishedBySlug<PublishedPage>('pages', slug, member);

  if (page) {
    return {
      document: page,
      kind: 'granted',
    };
  }

  const protectedPage = await findProtectedDocumentBySlug<PublishedPage>('pages', slug);

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
): Promise<ProtectedContentAccessResult<PublishedPost>> {
  const post = await findFirstPublishedBySlug<PublishedPost>('posts', slug, member);

  if (post) {
    return {
      document: post,
      kind: 'granted',
    };
  }

  const protectedPost = await findProtectedDocumentBySlug<PublishedPost>('posts', slug);

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

export async function getPublishedRedirectByPath(pathname: string) {
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
      ],
    },
  });

  return result.docs[0] ?? null;
}

async function getPublishedCollectionEntries<T extends { publishedAt?: string | null; slug: string }>(
  collection: 'pages' | 'posts',
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

export async function getPublishedSitemapEntries() {
  const [pages, posts] = await Promise.all([
    getPublishedCollectionEntries<PublishedPage>('pages'),
    getPublishedCollectionEntries<PublishedPost>('posts', '/journal'),
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

export async function getPublishedPageBySlug(slug: string, member?: AuthenticatedMemberLike | null) {
  const result = await resolvePublishedPageAccessBySlug(slug, member);

  return result.kind === 'granted' ? result.document : null;
}

export async function getPublishedPostBySlug(slug: string, member?: AuthenticatedMemberLike | null) {
  const result = await resolvePublishedPostAccessBySlug(slug, member);

  return result.kind === 'granted' ? result.document : null;
}
