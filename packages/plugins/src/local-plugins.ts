import { createPluginRegistry } from './registry';
import type { PluginDefinition } from './types';

export const localPluginDefinitions = [
  {
    manifest: {
      capabilities: ['content:posts'],
      compatibility: {
        platform: 'nexpress',
        pluginApiVersion: 1,
      },
      description: 'Local allowlisted blog foundation metadata for future post and journal features.',
      id: 'blog-pack',
      manifestVersion: 1,
      metadata: {
        'nexpress:category': 'content',
      },
      migrations: [
        {
          description: 'Prepare the local blog-pack metadata baseline.',
          id: 'blog-pack-baseline',
          name: 'Blog Pack Baseline',
          version: '0.1.0',
        },
      ],
      modules: [
        {
          capabilities: ['builder:blocks'],
          description: 'Optional builder block declarations for future blog surfaces.',
          id: 'blog-builder-blocks',
          name: 'Blog Builder Blocks',
        },
        {
          capabilities: ['seo:metadata'],
          description: 'Optional SEO helpers for blog article metadata.',
          id: 'blog-seo-tools',
          name: 'Blog SEO Tools',
        },
      ],
      name: 'Blog Pack',
      schema: 'nexpress-plugin-manifest',
      version: '0.1.0',
    },
    source: 'local',
  },
  {
    manifest: {
      capabilities: ['commerce:catalog'],
      compatibility: {
        platform: 'nexpress',
        pluginApiVersion: 1,
      },
      description: 'Local allowlisted commerce module metadata without storefront or checkout execution.',
      id: 'commerce-pack',
      manifestVersion: 1,
      metadata: {
        'nexpress:category': 'commerce',
      },
      modules: [
        {
          capabilities: ['builder:blocks'],
          description: 'Optional catalog block metadata for future storefront builder integration.',
          id: 'commerce-builder-blocks',
          name: 'Commerce Builder Blocks',
        },
      ],
      name: 'Commerce Pack',
      schema: 'nexpress-plugin-manifest',
      version: '0.1.0',
    },
    source: 'local',
  },
  {
    manifest: {
      capabilities: ['forms:submissions'],
      compatibility: {
        platform: 'nexpress',
        pluginApiVersion: 1,
      },
      description: 'Local allowlisted forms metadata for controlled future workflow features.',
      id: 'forms-pack',
      manifestVersion: 1,
      metadata: {
        'nexpress:category': 'forms',
      },
      migrations: [
        {
          description: 'Prepare the local forms-pack metadata baseline.',
          id: 'forms-pack-baseline',
          name: 'Forms Pack Baseline',
          version: '0.1.0',
        },
      ],
      modules: [
        {
          capabilities: ['builder:blocks'],
          description: 'Optional form builder block metadata.',
          id: 'form-builder-blocks',
          name: 'Form Builder Blocks',
        },
      ],
      name: 'Forms Pack',
      schema: 'nexpress-plugin-manifest',
      version: '0.1.0',
    },
    source: 'local',
  },
  {
    manifest: {
      capabilities: ['members:protected-routes'],
      compatibility: {
        platform: 'nexpress',
        pluginApiVersion: 1,
      },
      dependencies: [
        {
          pluginId: 'forms-pack',
          versionRange: '>=0.1.0',
        },
      ],
      description: 'Local allowlisted membership metadata for future protected public-route features.',
      id: 'membership-pack',
      manifestVersion: 1,
      metadata: {
        'nexpress:category': 'identity',
      },
      modules: [
        {
          capabilities: ['seo:metadata'],
          description: 'Optional metadata helpers for membership landing pages.',
          id: 'membership-seo-tools',
          name: 'Membership SEO Tools',
        },
      ],
      name: 'Membership Pack',
      schema: 'nexpress-plugin-manifest',
      version: '0.1.0',
    },
    source: 'local',
  },
  {
    manifest: {
      capabilities: ['seo:metadata'],
      compatibility: {
        platform: 'nexpress',
        pluginApiVersion: 1,
      },
      description: 'Local allowlisted SEO metadata module for future opt-in enhancements.',
      id: 'seo-pack',
      manifestVersion: 1,
      metadata: {
        'nexpress:category': 'seo',
      },
      migrations: [
        {
          description: 'Prepare the local seo-pack metadata baseline.',
          id: 'seo-pack-baseline',
          name: 'SEO Pack Baseline',
          version: '0.1.0',
        },
      ],
      modules: [
        {
          capabilities: ['builder:blocks'],
          description: 'Optional SEO-oriented builder block metadata.',
          id: 'seo-builder-blocks',
          name: 'SEO Builder Blocks',
        },
      ],
      name: 'SEO Pack',
      schema: 'nexpress-plugin-manifest',
      version: '0.1.0',
    },
    source: 'local',
  },
] as const satisfies readonly PluginDefinition[];

export const defaultPluginRegistry = createPluginRegistry(localPluginDefinitions);
