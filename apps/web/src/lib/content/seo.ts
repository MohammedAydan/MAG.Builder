import type { Field } from 'payload';
import type { Metadata } from 'next';

export type SeoFieldValue = {
  canonicalUrl?: string | null;
  metaDescription?: string | null;
  metaTitle?: string | null;
  noIndex?: boolean | null;
  noFollow?: boolean | null;
};

export function createSeoFields(): Field[] {
  return [
    {
      name: 'seo',
      label: 'SEO',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          maxLength: 70,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          maxLength: 160,
        },
        {
          name: 'canonicalUrl',
          type: 'text',
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'noFollow',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ];
}

type MetadataInput = {
  fallbackDescription?: string | null;
  fallbackTitle: string;
  seo?: SeoFieldValue | null;
};

export function buildSeoMetadata({ fallbackDescription, fallbackTitle, seo }: MetadataInput): Metadata {
  const title = seo?.metaTitle?.trim() || fallbackTitle;
  const description = seo?.metaDescription?.trim() || fallbackDescription || undefined;
  const noIndex = seo?.noIndex === true;
  const noFollow = seo?.noFollow === true;
  const canonical = seo?.canonicalUrl?.trim() || undefined;

  return {
    title,
    description,
    ...(canonical
      ? {
          alternates: {
            canonical,
          },
        }
      : {}),
    openGraph: {
      title,
      ...(description ? { description } : {}),
      type: 'article',
    },
    robots: {
      follow: !noFollow,
      index: !noIndex,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      ...(description ? { description } : {}),
    },
  };
}
