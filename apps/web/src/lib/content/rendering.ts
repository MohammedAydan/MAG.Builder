import { createElement, Fragment } from 'react';
import {
  renderValidatedBuilderDocument,
  type ValidatedBuilderBlock,
  type ValidatedBuilderDocument,
  type BuilderExternalBlockRenderArgs,
} from '@nexpress/builder-core';
import { validatePublishedBuilderDocument } from '@/lib/builder/kernel';
import { renderCommerceBuilderBlock } from '@/lib/commerce/storefront';
import { getPayloadClient } from '@/lib/payload';
import { PublicForm } from '@/components/forms/public-form';
import type { ResolvedSite } from '@/lib/sites/service';

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

/**
 * Recursively resolve media and form relations in a builder document.
 * This ensures public URLs and form definitions are available before rendering.
 */
async function resolveBuilderDocumentRelations(blocks: ValidatedBuilderBlock[], _site: ResolvedSite) {
  const payload = await getPayloadClient();

  for (const block of blocks) {
    if (block.kind === 'known') {
      // Resolve Media for Image blocks
      if (block.type === 'core.image' && block.props.mediaId) {
        try {
          const media = await payload.findByID({
            collection: 'media',
            depth: 0,
            id: block.props.mediaId as string,
          });

          if (media && typeof media === 'object' && 'url' in media && media.url) {
            block.props.src = media.url as string;
          }
        } catch (err) {
          console.error(`[builder] Failed to resolve media ${block.props.mediaId}:`, err);
        }
      }
    }

    if (block.children && block.children.length > 0) {
      await resolveBuilderDocumentRelations(block.children as ValidatedBuilderBlock[], _site);
    }
  }
}

/**
 * Custom external block renderer that supports forms and commerce.
 */
function renderExternalBlock(args: BuilderExternalBlockRenderArgs, site: ResolvedSite) {
  const { props, type } = args;

  if (type === 'core.form' && props.formSlug) {
    return createElement(PublicForm, {
      formSlug: props.formSlug as string,
      site,
      submitLabel: props.submitLabel as string | undefined,
      title: props.title as string | undefined,
    });
  }

  return renderCommerceBuilderBlock(args);
}

/**
 * Create a deep clone of builder blocks that preserves definition references.
 */
function cloneBlocks(blocks: readonly ValidatedBuilderBlock[]): ValidatedBuilderBlock[] {
  return blocks.map((block) => {
    const props = block.kind === 'invalid' ? { ...block.rawProps } : { ...block.props };
    const clonedBlock: ValidatedBuilderBlock = {
      ...block,
      ...(block.kind === 'invalid' ? { rawProps: props } : { props }),
    } as ValidatedBuilderBlock;

    if (block.children) {
      (clonedBlock as unknown as { children?: ValidatedBuilderBlock[] }).children = cloneBlocks(block.children);
    }

    return clonedBlock;
  });
}

export async function renderPublishedPageContent(page: PublishedPageContent, site: ResolvedSite) {
  if (page.builder == null) {
    return renderLegacyPageBody(page.body);
  }

  const validation = validatePublishedBuilderDocument(page.builder);

  if (!validation.success || validation.document.blocks.length === 0) {
    return renderLegacyPageBody(page.body);
  }

  // Clone blocks to avoid mutating the original document if cached
  const clonedBlocks = cloneBlocks(validation.document.blocks);

  // Resolve relations server-side
  await resolveBuilderDocumentRelations(clonedBlocks, site);

  const doc: ValidatedBuilderDocument = {
    ...validation.document,
    blocks: clonedBlocks,
  };

  return createElement(
    Fragment,
    null,
    renderValidatedBuilderDocument(doc, {
      context: {
        renderExternalBlock: (args) => renderExternalBlock(args, site),
        surface: 'public',
      },
      fallback: renderLegacyPageBody(page.body),
    }),
  );
}
