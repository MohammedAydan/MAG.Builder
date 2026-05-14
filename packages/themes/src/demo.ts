import {
  BUILDER_DOCUMENT_SCHEMA,
  CURRENT_BUILDER_DOCUMENT_VERSION,
  type BuilderDocumentInput,
} from '@nexpress/builder-core';
import {
  CURRENT_TEMPLATE_MANIFEST_VERSION,
  DEFAULT_PUBLIC_THEME_ID,
  TEMPLATE_MANIFEST_SCHEMA,
  type TemplateManifest,
} from './types';

const starterHomeBuilder: BuilderDocumentInput = {
  blocks: [
    {
      children: [
        {
          id: 'starter-home-heading',
          props: {
            align: 'left',
            level: 1,
            text: 'Starter demo home page',
          },
          type: 'core.heading',
        },
        {
          id: 'starter-home-text',
          props: {
            align: 'left',
            size: 'lg',
            text: 'This sample page is imported by the Phase 12 demo template flow and remains fully validated through builder-core.',
            tone: 'default',
          },
          type: 'core.text',
        },
        {
          id: 'starter-home-button',
          props: {
            href: '/journal/starter-demo-post',
            label: 'Read the sample post',
            variant: 'primary',
          },
          type: 'core.button',
        },
      ],
      id: 'starter-home-section',
      props: {
        background: 'surface',
        gap: 'md',
        paddingY: 'md',
        width: 'content',
      },
      type: 'core.section',
    },
  ],
  schema: BUILDER_DOCUMENT_SCHEMA,
  version: CURRENT_BUILDER_DOCUMENT_VERSION,
};

export const starterTemplateManifest: TemplateManifest = {
  compatibility: {
    builderSchema: BUILDER_DOCUMENT_SCHEMA,
    builderVersion: CURRENT_BUILDER_DOCUMENT_VERSION,
  },
  content: {
    pages: [
      {
        body: 'Starter demo home page. This sample content is imported explicitly and can be edited safely after import.',
        builder: starterHomeBuilder,
        excerpt: 'Sample home page imported by the starter template.',
        seo: {
          metaDescription: 'Starter sample home page for the NexPress Phase 12 demo template.',
          metaTitle: 'Starter Demo Home',
        },
        slug: 'starter-demo-home',
        status: 'published',
        title: 'Starter Demo Home',
      },
    ],
    posts: [
      {
        body: 'This sample journal post is safe demo content created through the template importer.',
        excerpt: 'Sample journal content imported from the starter template.',
        seo: {
          metaDescription: 'Starter sample journal post imported from the safe demo template.',
          metaTitle: 'Starter Demo Post',
        },
        slug: 'starter-demo-post',
        status: 'published',
        title: 'Starter Demo Post',
      },
    ],
    redirects: [
      {
        destinationPath: '/starter-demo-home',
        isActive: true,
        sourcePath: '/demo',
        type: '302',
      },
    ],
  },
  metadata: {
    demo: true,
    description: 'Safe starter-site demo content for local Phase 12 template import testing.',
    id: 'starter-site-demo',
    label: 'Starter Site Demo',
    tags: ['demo', 'starter', 'themes'],
  },
  requiredBlocks: ['core.button', 'core.heading', 'core.section', 'core.text'],
  resources: {
    assetUrls: [],
  },
  schema: TEMPLATE_MANIFEST_SCHEMA,
  theme: {
    id: DEFAULT_PUBLIC_THEME_ID,
  },
  version: CURRENT_TEMPLATE_MANIFEST_VERSION,
};
