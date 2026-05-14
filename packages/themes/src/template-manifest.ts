import {
  BUILDER_DOCUMENT_SCHEMA,
  CURRENT_BUILDER_DOCUMENT_VERSION,
  type BuilderBlockRegistry,
  type ValidatedBuilderBlock,
  isSafeAssetSrc,
  validateBuilderDocument,
  validateBuilderDocumentStructure,
} from '@nexpress/builder-core';
import { z } from 'zod';
import {
  CURRENT_TEMPLATE_MANIFEST_VERSION,
  TEMPLATE_MANIFEST_SCHEMA,
  type TemplateManifest,
  type TemplatePageEntry,
  type TemplatePostEntry,
  type TemplateManifestValidationOptions,
  type TemplateManifestValidationResult,
} from './types';

const normalizedSensitiveKeys = new Set([
  'accesstoken',
  'admintoken',
  'apikey',
  'authorization',
  'cookie',
  'databaseurl',
  'password',
  'payloadsecret',
  'privatekey',
  'refreshtoken',
  'secret',
  'token',
  'user',
  'users',
]);

const forbiddenStringPattern =
  /(<\/?[a-z][^>]*>)|(<script\b)|(<iframe\b)|(<object\b)|(<embed\b)|(javascript:)|(data:text\/html)|(payloa[d]?_?secret)|(database_?url)|(api[_-]?key)|(access[_-]?token)|(refresh[_-]?token)/i;

const safeTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(20000)
  .refine((value) => !forbiddenStringPattern.test(value), 'Unsafe HTML, executable content, or secrets are not allowed.');

const optionalSafeTextSchema = z
  .string()
  .trim()
  .max(20000)
  .refine((value) => !forbiddenStringPattern.test(value), 'Unsafe HTML, executable content, or secrets are not allowed.')
  .optional();

const optionalSafeExcerptSchema = z
  .string()
  .trim()
  .max(280)
  .refine((value) => !forbiddenStringPattern.test(value), 'Unsafe HTML, executable content, or secrets are not allowed.')
  .optional();

const optionalSafeDescriptionSchema = z
  .string()
  .trim()
  .max(280)
  .refine((value) => !forbiddenStringPattern.test(value), 'Unsafe HTML, executable content, or secrets are not allowed.')
  .optional();

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain lowercase letters, numbers, and hyphens only.');

const pathSchema = z
  .string()
  .trim()
  .refine((value) => value.startsWith('/'), 'Path must start with /.')
  .refine((value) => !forbiddenStringPattern.test(value), 'Unsafe path content is not allowed.');

const destinationSchema = z
  .string()
  .trim()
  .refine((value) => value.startsWith('/') || /^https?:\/\//i.test(value), 'Destination must be internal or http/https.')
  .refine((value) => !forbiddenStringPattern.test(value), 'Unsafe destination content is not allowed.');

const seoSchema = z
  .object({
    canonicalUrl: z
      .string()
      .trim()
      .url('Canonical URL must be a valid URL.')
      .refine((value) => /^https?:\/\//i.test(value), 'Canonical URL must use http or https.')
      .optional(),
    metaDescription: optionalSafeTextSchema,
    metaTitle: optionalSafeTextSchema,
    noFollow: z.boolean().optional(),
    noIndex: z.boolean().optional(),
  })
  .strict();

const pageSchema = z
  .object({
    body: safeTextSchema.max(20000),
    builder: z.unknown().optional(),
    excerpt: optionalSafeExcerptSchema,
    seo: seoSchema.optional(),
    slug: slugSchema,
    status: z.enum(['draft', 'published']).default('published'),
    title: safeTextSchema.max(160),
  })
  .strict();

const postSchema = z
  .object({
    body: safeTextSchema.max(20000),
    excerpt: optionalSafeExcerptSchema,
    seo: seoSchema.optional(),
    slug: slugSchema,
    status: z.enum(['draft', 'published']).default('published'),
    title: safeTextSchema.max(160),
  })
  .strict();

const redirectSchema = z
  .object({
    destinationPath: destinationSchema,
    isActive: z.boolean().default(true),
    sourcePath: pathSchema,
    type: z.enum(['301', '302']).default('301'),
  })
  .strict();

const rawTemplateManifestSchema = z
  .object({
    compatibility: z
      .object({
        builderSchema: z.literal(BUILDER_DOCUMENT_SCHEMA),
        builderVersion: z.literal(CURRENT_BUILDER_DOCUMENT_VERSION),
      })
      .strict(),
    content: z
      .object({
        pages: z.array(pageSchema).default([]),
        posts: z.array(postSchema).default([]),
        redirects: z.array(redirectSchema).default([]),
      })
      .strict(),
    metadata: z
      .object({
        demo: z.boolean().optional(),
        description: optionalSafeDescriptionSchema,
        id: slugSchema,
        label: safeTextSchema.max(120),
        tags: z.array(slugSchema).max(20).default([]),
      })
      .strict(),
    requiredBlocks: z.array(z.string().trim().min(1)).max(100),
    resources: z
      .object({
        assetUrls: z.array(z.string().trim().refine((value) => isSafeAssetSrc(value), 'Asset URLs must be safe absolute or site-relative URLs.')).max(200).default([]),
      })
      .strict(),
    schema: z.literal(TEMPLATE_MANIFEST_SCHEMA),
    theme: z
      .object({
        id: z.string().trim().min(1),
      })
      .strict(),
    version: z.literal(CURRENT_TEMPLATE_MANIFEST_VERSION),
  })
  .strict();

type RawTemplateManifest = z.infer<typeof rawTemplateManifestSchema>;
type BlockTypeNode = {
  children?: readonly BlockTypeNode[] | undefined;
  type: string;
};

function scanUnsafeInput(input: unknown, path = 'manifest', errors: string[] = []) {
  if (Array.isArray(input)) {
    input.forEach((value, index) => scanUnsafeInput(value, `${path}[${index}]`, errors));
    return errors;
  }

  if (input && typeof input === 'object') {
    for (const [key, value] of Object.entries(input)) {
      const normalizedKey = key.replace(/[_-]/g, '').toLowerCase();

      if (normalizedSensitiveKeys.has(normalizedKey)) {
        errors.push(`${path}.${key}: sensitive or protected fields are not allowed in template manifests.`);
      }

      scanUnsafeInput(value, `${path}.${key}`, errors);
    }

    return errors;
  }

  if (typeof input === 'string' && forbiddenStringPattern.test(input)) {
    errors.push(`${path}: unsafe HTML, executable content, or secrets are not allowed.`);
  }

  return errors;
}

function collectInvalidBuilderBlocks(blocks: readonly ValidatedBuilderBlock[], errors: string[] = []) {
  for (const block of blocks) {
    if (block.kind === 'invalid') {
      errors.push(...block.errors);
    }

    if (block.kind === 'unknown') {
      errors.push(`Unsupported builder block type "${block.type}" is not allowed in template manifests.`);
    }

    if (block.children.length > 0) {
      collectInvalidBuilderBlocks(block.children, errors);
    }
  }

  return errors;
}

function collectBuilderBlockTypes(blocks: readonly BlockTypeNode[], types = new Set<string>()) {
  for (const block of blocks) {
    types.add(block.type);

    if (Array.isArray(block.children) && block.children.length > 0) {
      collectBuilderBlockTypes(block.children, types);
    }
  }

  return types;
}

function sanitizeSeoValue(
  seo: RawTemplateManifest['content']['pages'][number]['seo']
    | RawTemplateManifest['content']['posts'][number]['seo'],
) {
  if (!seo) {
    return undefined;
  }

  const nextSeo = {
    ...(seo.canonicalUrl ? { canonicalUrl: seo.canonicalUrl } : {}),
    ...(seo.metaDescription ? { metaDescription: seo.metaDescription } : {}),
    ...(seo.metaTitle ? { metaTitle: seo.metaTitle } : {}),
    ...(seo.noFollow !== undefined ? { noFollow: seo.noFollow } : {}),
    ...(seo.noIndex !== undefined ? { noIndex: seo.noIndex } : {}),
  };

  return Object.keys(nextSeo).length > 0 ? nextSeo : undefined;
}

function validateManifestBuilders(
  manifest: RawTemplateManifest,
  blockRegistry: BuilderBlockRegistry,
): TemplateManifestValidationResult {
  const builderTypes = new Set<string>();
  const pages: TemplatePageEntry[] = [];
  const errors: string[] = [];

  for (const [index, page] of manifest.content.pages.entries()) {
    if (!page.builder) {
      const seo = sanitizeSeoValue(page.seo);

      pages.push({
        body: page.body,
        ...(page.excerpt ? { excerpt: page.excerpt } : {}),
        ...(seo ? { seo } : {}),
        slug: page.slug,
        status: page.status,
        title: page.title,
      });
      continue;
    }

    const structure = validateBuilderDocumentStructure(page.builder);

    if (!structure.success) {
      errors.push(
        ...structure.errors.map(
          (error: string) => `content.pages[${index}].builder: ${error}`,
        ),
      );
      continue;
    }

    const validation = validateBuilderDocument(structure.document, blockRegistry);

    if (!validation.success) {
      errors.push(
        ...validation.errors.map(
          (error: string) => `content.pages[${index}].builder: ${error}`,
        ),
      );
      continue;
    }

    const blockErrors = collectInvalidBuilderBlocks(validation.document.blocks);
    if (blockErrors.length > 0) {
      errors.push(
        ...blockErrors.map((error) => `content.pages[${index}].builder: ${error}`),
      );
      continue;
    }

    collectBuilderBlockTypes(structure.document.blocks, builderTypes);
    const seo = sanitizeSeoValue(page.seo);

    pages.push({
      body: page.body,
      builder: structure.document,
      ...(page.excerpt ? { excerpt: page.excerpt } : {}),
      ...(seo ? { seo } : {}),
      slug: page.slug,
      status: page.status,
      title: page.title,
    });
  }

  if (errors.length > 0) {
    return {
      errors,
      success: false,
    };
  }

  const declaredBlocks = [...new Set(manifest.requiredBlocks)];

  for (const type of declaredBlocks) {
    if (!blockRegistry.has(type)) {
      errors.push(`requiredBlocks contains unsupported block type "${type}".`);
    }
  }

  for (const usedType of [...builderTypes].sort()) {
    if (!declaredBlocks.includes(usedType)) {
      errors.push(`requiredBlocks must declare builder block "${usedType}".`);
    }
  }

  if (builderTypes.size > 0 && declaredBlocks.length === 0) {
    errors.push('requiredBlocks must not be empty when page builder documents are included.');
  }

  if (errors.length > 0) {
    return {
      errors,
      success: false,
    };
  }

  return {
    manifest: {
      compatibility: manifest.compatibility,
      content: {
        pages,
        posts: manifest.content.posts.map((post): TemplatePostEntry => {
          const seo = sanitizeSeoValue(post.seo);

          return {
            body: post.body,
            ...(post.excerpt ? { excerpt: post.excerpt } : {}),
            ...(seo ? { seo } : {}),
            slug: post.slug,
            status: post.status,
            title: post.title,
          };
        }),
        redirects: manifest.content.redirects.map((redirect) => ({
          destinationPath: redirect.destinationPath,
          isActive: redirect.isActive,
          sourcePath: redirect.sourcePath,
          type: redirect.type,
        })),
      },
      metadata: {
        ...(manifest.metadata.demo !== undefined ? { demo: manifest.metadata.demo } : {}),
        ...(manifest.metadata.description ? { description: manifest.metadata.description } : {}),
        id: manifest.metadata.id,
        label: manifest.metadata.label,
        tags: [...manifest.metadata.tags],
      },
      requiredBlocks: declaredBlocks,
      resources: {
        assetUrls: [...manifest.resources.assetUrls],
      },
      schema: manifest.schema,
      theme: manifest.theme,
      version: manifest.version,
    },
    success: true,
  };
}

export function validateTemplateManifest(
  input: unknown,
  options: TemplateManifestValidationOptions,
): TemplateManifestValidationResult {
  const unsafeInputErrors = scanUnsafeInput(input);

  if (unsafeInputErrors.length > 0) {
    return {
      errors: unsafeInputErrors,
      success: false,
    };
  }

  const parsed = rawTemplateManifestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      errors: parsed.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'manifest';
        return `${path}: ${issue.message}`;
      }),
      success: false,
    };
  }

  if (options.themeRegistry && !options.themeRegistry.has(parsed.data.theme.id)) {
    return {
      errors: [`theme.id "${parsed.data.theme.id}" is not registered.`],
      success: false,
    };
  }

  return validateManifestBuilders(parsed.data, options.blockRegistry);
}

export function assertValidTemplateManifest(
  input: unknown,
  options: TemplateManifestValidationOptions,
): TemplateManifest {
  const result = validateTemplateManifest(input, options);

  if (!result.success) {
    throw new Error(result.errors.join('; '));
  }

  return result.manifest;
}

export function stringifyTemplateManifest(
  input: unknown,
  options: TemplateManifestValidationOptions,
) {
  return JSON.stringify(assertValidTemplateManifest(input, options), null, 2);
}
