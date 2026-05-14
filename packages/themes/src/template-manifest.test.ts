import {
  BUILDER_DOCUMENT_SCHEMA,
  CURRENT_BUILDER_DOCUMENT_VERSION,
  coreBlockRegistry,
} from '@nexpress/builder-core';
import { describe, expect, it } from 'vitest';
import {
  CURRENT_TEMPLATE_MANIFEST_VERSION,
  DEFAULT_PUBLIC_THEME_ID,
  TEMPLATE_MANIFEST_SCHEMA,
  defaultThemeRegistry,
  starterTemplateManifest,
  stringifyTemplateManifest,
  validateTemplateManifest,
} from './index';

describe('template manifest validation', () => {
  it('accepts the starter template manifest', () => {
    const result = validateTemplateManifest(starterTemplateManifest, {
      blockRegistry: coreBlockRegistry,
      themeRegistry: defaultThemeRegistry,
    });

    expect(result.success).toBe(true);
  });

  it('rejects missing required builder blocks', () => {
    const result = validateTemplateManifest(
      {
        ...starterTemplateManifest,
        requiredBlocks: [],
      },
      {
        blockRegistry: coreBlockRegistry,
        themeRegistry: defaultThemeRegistry,
      },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toContain('requiredBlocks');
    }
  });

  it('rejects unsafe template content', () => {
    const result = validateTemplateManifest(
      {
        compatibility: {
          builderSchema: BUILDER_DOCUMENT_SCHEMA,
          builderVersion: CURRENT_BUILDER_DOCUMENT_VERSION,
        },
        content: {
          pages: [
            {
              body: '<script>alert(1)</script>',
              slug: 'unsafe-page',
              status: 'published',
              title: 'Unsafe page',
            },
          ],
          posts: [],
          redirects: [],
        },
        metadata: {
          id: 'unsafe-template',
          label: 'Unsafe Template',
          tags: [],
        },
        requiredBlocks: [],
        resources: {
          assetUrls: [],
        },
        schema: TEMPLATE_MANIFEST_SCHEMA,
        theme: {
          id: DEFAULT_PUBLIC_THEME_ID,
        },
        version: CURRENT_TEMPLATE_MANIFEST_VERSION,
      },
      {
        blockRegistry: coreBlockRegistry,
        themeRegistry: defaultThemeRegistry,
      },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toContain('unsafe');
    }
  });

  it('serializes validated manifests as JSON', () => {
    const json = stringifyTemplateManifest(starterTemplateManifest, {
      blockRegistry: coreBlockRegistry,
      themeRegistry: defaultThemeRegistry,
    });

    expect(JSON.parse(json)).toMatchObject({
      metadata: {
        id: starterTemplateManifest.metadata.id,
      },
      schema: TEMPLATE_MANIFEST_SCHEMA,
    });
  });
});
