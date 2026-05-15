import { createElement, Fragment } from 'react';
import { renderValidatedBuilderDocument } from '@nexpress/builder-core';
import { validatePublishedBuilderDocument } from '@/lib/builder/kernel';
import { renderCommerceBuilderBlock } from '@/lib/commerce/storefront';

export type PublishedPageContent = Readonly<{
  body: string;
  builder?: unknown | null;
}>;

function getLegacyParagraphs(body: string) {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function renderLegacyPageBody(body: string) {
  const paragraphs = getLegacyParagraphs(body);

  return createElement(
    'div',
    {
      className: 'space-y-5 text-base leading-8 text-[var(--color-ink)]',
    },
    ...paragraphs.map((paragraph) =>
      createElement(
        'p',
        {
          key: paragraph,
        },
        paragraph,
      ),
    ),
  );
}

export async function renderPublishedPageContent(page: PublishedPageContent) {
  if (page.builder == null) {
    return renderLegacyPageBody(page.body);
  }

  const validation = validatePublishedBuilderDocument(page.builder);

  if (!validation.success || validation.document.blocks.length === 0) {
    return renderLegacyPageBody(page.body);
  }

  return createElement(
    Fragment,
    null,
    renderValidatedBuilderDocument(validation.document, {
      context: {
        renderExternalBlock: renderCommerceBuilderBlock,
        surface: 'public',
      },
      fallback: renderLegacyPageBody(page.body),
    }),
  );
}
