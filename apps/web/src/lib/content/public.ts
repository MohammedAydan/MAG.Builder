import type { Metadata } from 'next';
import { buildSeoMetadata, type SeoFieldValue } from '@/lib/content/seo';
import { normalizeContentPath } from '@/lib/content/paths';
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
  body: string;
  excerpt?: string | null;
  heroImage?: PublishedMedia | number | string | null;
  id: number | string;
  publishedAt?: string | null;
  seo?: SeoFieldValue | null;
  slug: string;
  title: string;
};

export type PublishedPost = {
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

async function getPublicReader() {
  return (await getPayloadClient()) as unknown as PayloadPublicReader;
}

async function findFirstPublishedBySlug<T>(collection: 'pages' | 'posts', slug: string) {
  const payload = await getPublicReader();
  const result = await payload.find<T>({
    collection,
    depth: 1,
    limit: 1,
    overrideAccess: false,
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

export async function getPublishedPageBySlug(slug: string) {
  return findFirstPublishedBySlug<PublishedPage>('pages', slug);
}

export async function getPublishedPostBySlug(slug: string) {
  return findFirstPublishedBySlug<PublishedPost>('posts', slug);
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
      _status: {
        equals: 'published',
      },
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
