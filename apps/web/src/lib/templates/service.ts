import { coreBlockRegistry, type BuilderDocumentInput } from '@nexpress/builder-core';
import {
  DEFAULT_PUBLIC_THEME_ID,
  defaultThemeRegistry,
  starterTemplateManifest,
  validateTemplateManifest,
  type TemplateManifest,
  type TemplatePageEntry,
  type TemplatePostEntry,
  type TemplateRedirectEntry,
} from '@nexpress/themes';
import { z } from 'zod';
import { AUDIT_ACTIONS, writeAuditEntry } from '@/lib/audit/service';
import {
  canAccessAdminPanel,
  canManageContent,
  getUserRole,
  type AuthenticatedUserLike,
} from '@/lib/auth/access';
import { normalizeSlugSegment } from '@/lib/content/slug';
import { getPayloadClient } from '@/lib/payload';

type TemplateWritableCollection = 'pages' | 'posts' | 'redirects';
type TemplateQueryCollection = TemplateWritableCollection;

type PayloadFindResult<T> = {
  docs: T[];
};

type PayloadTemplateDoc = {
  id: number | string;
};

type PayloadClientLike = {
  create: (args: Record<string, unknown>) => Promise<unknown>;
  find: (args: Record<string, unknown>) => Promise<PayloadFindResult<Record<string, unknown>>>;
  update: (args: Record<string, unknown>) => Promise<unknown>;
};

export class TemplateFlowError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const importRequestSchema = z
  .object({
    manifest: z.unknown(),
  })
  .strict();

const exportRequestSchema = z
  .object({
    description: z.string().trim().max(280).optional(),
    includeDrafts: z.boolean().optional(),
    label: z.string().trim().min(1).max(120),
    pageSlugs: z.array(z.string().trim()).max(100).optional(),
    postSlugs: z.array(z.string().trim()).max(100).optional(),
    redirectPaths: z.array(z.string().trim()).max(100).optional(),
    templateId: z.string().trim().optional(),
    themeId: z.string().trim().optional(),
  })
  .strict();

const templateSeoSchema = z
  .object({
    canonicalUrl: z.string().trim().optional(),
    metaDescription: z.string().trim().optional(),
    metaTitle: z.string().trim().optional(),
    noFollow: z.boolean().optional(),
    noIndex: z.boolean().optional(),
  })
  .strict();

type ExportRequestInput = z.infer<typeof exportRequestSchema>;

type TemplateImportSummary = Readonly<{
  counts: Readonly<{
    pages: Readonly<{ created: number; updated: number }>;
    posts: Readonly<{ created: number; updated: number }>;
    redirects: Readonly<{ created: number; updated: number }>;
  }>;
  demo: boolean;
  manifestId: string;
  themeId: string;
}>;

type TemplatePageRecord = {
  _status?: 'draft' | 'published' | null;
  body: string;
  builder?: BuilderDocumentInput | null;
  excerpt?: string | null;
  id: number | string;
  seo?: Record<string, unknown> | null;
  slug: string;
  title: string;
};

type TemplatePostRecord = {
  _status?: 'draft' | 'published' | null;
  body: string;
  excerpt?: string | null;
  id: number | string;
  seo?: Record<string, unknown> | null;
  slug: string;
  title: string;
};

type TemplateRedirectRecord = {
  destinationPath: string;
  id: number | string;
  isActive?: boolean | null;
  sourcePath: string;
  type?: '301' | '302' | null;
};

function assertTemplateAdminUser(
  user: AuthenticatedUserLike | null | undefined,
): asserts user is AuthenticatedUserLike {
  if (!user || !canAccessAdminPanel(user) || !canManageContent(user)) {
    throw new TemplateFlowError('Forbidden', 403);
  }
}

function assertDraftExportAccess(user: AuthenticatedUserLike, includeDrafts: boolean | undefined) {
  if (includeDrafts && getUserRole(user) !== 'super-admin') {
    throw new TemplateFlowError('Only super-admin can export template drafts.', 403);
  }
}

function normalizeSeoInput(input: Record<string, unknown> | null | undefined) {
  const parsed = templateSeoSchema.safeParse(input ?? undefined);
  return parsed.success ? parsed.data : undefined;
}

function buildOptionalSeo(
  input: Record<string, unknown> | null | undefined,
) {
  const seo = normalizeSeoInput(input);

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

function collectBuilderTypes(blocks: readonly BuilderDocumentInput['blocks'][number][], set = new Set<string>()) {
  for (const block of blocks) {
    set.add(block.type);

    if (block.children && block.children.length > 0) {
      collectBuilderTypes(block.children, set);
    }
  }

  return set;
}

function buildPageImportData(page: TemplatePageEntry) {
  return {
    _status: page.status,
    body: page.body,
    ...(page.builder ? { builder: page.builder } : {}),
    ...(page.excerpt ? { excerpt: page.excerpt } : {}),
    ...(page.seo ? { seo: page.seo } : {}),
    slug: page.slug,
    title: page.title,
  };
}

function buildPostImportData(post: TemplatePostEntry) {
  return {
    _status: post.status,
    body: post.body,
    ...(post.excerpt ? { excerpt: post.excerpt } : {}),
    ...(post.seo ? { seo: post.seo } : {}),
    slug: post.slug,
    title: post.title,
  };
}

function buildRedirectImportData(redirect: TemplateRedirectEntry) {
  return {
    destinationPath: redirect.destinationPath,
    isActive: redirect.isActive,
    sourcePath: redirect.sourcePath,
    type: redirect.type,
  };
}

async function findExistingRecord(
  payload: PayloadClientLike,
  args: {
    collection: TemplateQueryCollection;
    draft?: boolean;
    field: 'slug' | 'sourcePath';
    user: AuthenticatedUserLike;
    value: string;
  },
) {
  const result = (await payload.find({
    collection: args.collection,
    ...(args.draft !== undefined ? { draft: args.draft } : {}),
    limit: 1,
    overrideAccess: false,
    pagination: false,
    user: args.user,
    where: {
      [args.field]: {
        equals: args.value,
      },
    },
  })) as PayloadFindResult<PayloadTemplateDoc>;

  return result.docs[0] ?? null;
}

async function upsertVersionedContent(
  payload: PayloadClientLike,
  args: {
    collection: 'pages' | 'posts';
    data: Record<string, unknown>;
    slug: string;
    status: 'draft' | 'published';
    user: AuthenticatedUserLike;
  },
) {
  const existing = await findExistingRecord(payload, {
    collection: args.collection,
    draft: true,
    field: 'slug',
    user: args.user,
    value: args.slug,
  });

  const mutationArgs = {
    collection: args.collection,
    data: args.data,
    draft: args.status !== 'published',
    overrideAccess: false,
    user: args.user,
  };

  if (existing) {
    await payload.update({
      ...mutationArgs,
      id: existing.id,
    });

    return 'updated' as const;
  }

  await payload.create(mutationArgs);

  return 'created' as const;
}

async function upsertRedirect(
  payload: PayloadClientLike,
  args: {
    data: Record<string, unknown>;
    sourcePath: string;
    user: AuthenticatedUserLike;
  },
) {
  const existing = await findExistingRecord(payload, {
    collection: 'redirects',
    field: 'sourcePath',
    user: args.user,
    value: args.sourcePath,
  });

  if (existing) {
    await payload.update({
      collection: 'redirects',
      data: args.data,
      id: existing.id,
      overrideAccess: false,
      user: args.user,
    });

    return 'updated' as const;
  }

  await payload.create({
    collection: 'redirects',
    data: args.data,
    overrideAccess: false,
    user: args.user,
  });

  return 'created' as const;
}

function createEmptyImportCounts() {
  return {
    pages: { created: 0, updated: 0 },
    posts: { created: 0, updated: 0 },
    redirects: { created: 0, updated: 0 },
  };
}

function toTemplateFlowError(error: unknown, fallbackStatus = 400) {
  if (error instanceof TemplateFlowError) {
    return error;
  }

  if (error instanceof Error) {
    return new TemplateFlowError(error.message, fallbackStatus);
  }

  return new TemplateFlowError('Template request failed.', fallbackStatus);
}

function createExportWhere(field: 'slug' | 'sourcePath', values: readonly string[] | undefined) {
  if (!values || values.length === 0) {
    return undefined;
  }

  return {
    [field]: {
      in: values,
    },
  };
}

async function exportPages(
  payload: PayloadClientLike,
  args: {
    includeDrafts: boolean;
    slugs?: readonly string[];
    user: AuthenticatedUserLike;
  },
) {
  const result = (await payload.find({
    collection: 'pages',
    depth: 0,
    ...(args.includeDrafts ? { draft: true } : {}),
    limit: 100,
    overrideAccess: false,
    pagination: false,
    sort: 'slug',
    user: args.user,
    where: {
      and: [
        ...(args.includeDrafts ? [] : [{ _status: { equals: 'published' } }]),
        ...(args.slugs && args.slugs.length > 0 ? [createExportWhere('slug', args.slugs)] : []),
      ].filter(Boolean),
    },
  })) as PayloadFindResult<TemplatePageRecord>;

  return result.docs.map(
    (page): TemplatePageEntry => {
      const seo = buildOptionalSeo(page.seo);

      return {
        body: page.body,
        ...(page.builder ? { builder: page.builder } : {}),
        ...(page.excerpt ? { excerpt: page.excerpt } : {}),
        ...(seo ? { seo } : {}),
        slug: page.slug,
        status: page._status === 'draft' ? 'draft' : 'published',
        title: page.title,
      };
    },
  );
}

async function exportPosts(
  payload: PayloadClientLike,
  args: {
    includeDrafts: boolean;
    slugs?: readonly string[];
    user: AuthenticatedUserLike;
  },
) {
  const result = (await payload.find({
    collection: 'posts',
    depth: 0,
    ...(args.includeDrafts ? { draft: true } : {}),
    limit: 100,
    overrideAccess: false,
    pagination: false,
    sort: 'slug',
    user: args.user,
    where: {
      and: [
        ...(args.includeDrafts ? [] : [{ _status: { equals: 'published' } }]),
        ...(args.slugs && args.slugs.length > 0 ? [createExportWhere('slug', args.slugs)] : []),
      ].filter(Boolean),
    },
  })) as PayloadFindResult<TemplatePostRecord>;

  return result.docs.map(
    (post): TemplatePostEntry => {
      const seo = buildOptionalSeo(post.seo);

      return {
        body: post.body,
        ...(post.excerpt ? { excerpt: post.excerpt } : {}),
        ...(seo ? { seo } : {}),
        slug: post.slug,
        status: post._status === 'draft' ? 'draft' : 'published',
        title: post.title,
      };
    },
  );
}

async function exportRedirects(
  payload: PayloadClientLike,
  args: {
    paths?: readonly string[];
    user: AuthenticatedUserLike;
  },
) {
  const result = (await payload.find({
    collection: 'redirects',
    depth: 0,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    sort: 'sourcePath',
    user: args.user,
    where: createExportWhere('sourcePath', args.paths),
  })) as PayloadFindResult<TemplateRedirectRecord>;

  return result.docs.map(
    (redirect): TemplateRedirectEntry => ({
      destinationPath: redirect.destinationPath,
      isActive: redirect.isActive !== false,
      sourcePath: redirect.sourcePath,
      type: redirect.type === '302' ? '302' : '301',
    }),
  );
}

function buildRequiredBlocks(pages: readonly TemplatePageEntry[]) {
  const requiredBlocks = new Set<string>();

  for (const page of pages) {
    if (page.builder) {
      collectBuilderTypes(page.builder.blocks, requiredBlocks);
    }
  }

  return [...requiredBlocks].sort();
}

function validateThemeId(themeId: string) {
  if (!defaultThemeRegistry.has(themeId)) {
    throw new TemplateFlowError(`Theme "${themeId}" is not registered.`, 400);
  }

  return themeId;
}

async function writeTemplateAudit(
  payload: PayloadClientLike,
  args: {
    action: (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
    metadata: Record<string, unknown>;
    targetId: string;
    user: AuthenticatedUserLike;
  },
) {
  await writeAuditEntry(payload, {
    action: args.action,
    actor: {
      ...(args.user.email ? { email: args.user.email } : {}),
      role: getUserRole(args.user),
      source: 'user',
      userId: args.user.id,
    },
    metadata: args.metadata,
    result: 'success',
    targetId: args.targetId,
  });
}

export function parseTemplateImportRequest(input: unknown) {
  return importRequestSchema.safeParse(input);
}

export function parseTemplateExportRequest(input: unknown) {
  return exportRequestSchema.safeParse(input);
}

export async function importTemplateManifestWithPayload(
  payload: PayloadClientLike,
  args: {
    manifest: unknown;
    user: AuthenticatedUserLike | null | undefined;
  },
): Promise<TemplateImportSummary> {
  assertTemplateAdminUser(args.user);
  const user = args.user;
  const validation = validateTemplateManifest(args.manifest, {
    blockRegistry: coreBlockRegistry,
    themeRegistry: defaultThemeRegistry,
  });

  if (!validation.success) {
    throw new TemplateFlowError(validation.errors.join('; '), 400);
  }

  const manifest = validation.manifest;
  const counts = createEmptyImportCounts();

  for (const page of manifest.content.pages) {
    const action = await upsertVersionedContent(payload, {
      collection: 'pages',
      data: buildPageImportData(page),
      slug: page.slug,
      status: page.status,
      user,
    });
    counts.pages[action] += 1;
  }

  for (const post of manifest.content.posts) {
    const action = await upsertVersionedContent(payload, {
      collection: 'posts',
      data: buildPostImportData(post),
      slug: post.slug,
      status: post.status,
      user,
    });
    counts.posts[action] += 1;
  }

  for (const redirect of manifest.content.redirects) {
    const action = await upsertRedirect(payload, {
      data: buildRedirectImportData(redirect),
      sourcePath: redirect.sourcePath,
      user,
    });
    counts.redirects[action] += 1;
  }

  await writeTemplateAudit(payload, {
    action: manifest.metadata.demo ? AUDIT_ACTIONS.templateDemoImported : AUDIT_ACTIONS.templateImported,
    metadata: {
      counts,
      demo: manifest.metadata.demo === true,
      manifestId: manifest.metadata.id,
      themeId: manifest.theme.id,
    },
    targetId: manifest.metadata.id,
    user,
  });

  return {
    counts,
    demo: manifest.metadata.demo === true,
    manifestId: manifest.metadata.id,
    themeId: manifest.theme.id,
  };
}

export async function importTemplateManifest(args: {
  manifest: unknown;
  user: AuthenticatedUserLike | null | undefined;
}) {
  const payload = await getPayloadClient();

  return importTemplateManifestWithPayload(payload as unknown as PayloadClientLike, args);
}

export async function importStarterDemoTemplateWithPayload(
  payload: PayloadClientLike,
  user: AuthenticatedUserLike | null | undefined,
) {
  return importTemplateManifestWithPayload(payload, {
    manifest: starterTemplateManifest,
    user,
  });
}

export async function importStarterDemoTemplate(user: AuthenticatedUserLike | null | undefined) {
  const payload = await getPayloadClient();

  return importStarterDemoTemplateWithPayload(
    payload as unknown as PayloadClientLike,
    user,
  );
}

export async function exportTemplateManifestWithPayload(
  payload: PayloadClientLike,
  args: ExportRequestInput & { user: AuthenticatedUserLike | null | undefined },
): Promise<TemplateManifest> {
  assertTemplateAdminUser(args.user);
  const user = args.user;
  assertDraftExportAccess(user, args.includeDrafts);

  const themeId = validateThemeId(args.themeId ?? DEFAULT_PUBLIC_THEME_ID);
  const [pages, posts, redirects] = await Promise.all([
    exportPages(payload, {
      includeDrafts: args.includeDrafts === true,
      ...(args.pageSlugs ? { slugs: args.pageSlugs } : {}),
      user,
    }),
    exportPosts(payload, {
      includeDrafts: args.includeDrafts === true,
      ...(args.postSlugs ? { slugs: args.postSlugs } : {}),
      user,
    }),
    exportRedirects(payload, {
      ...(args.redirectPaths ? { paths: args.redirectPaths } : {}),
      user,
    }),
  ]);

  const manifestResult = validateTemplateManifest(
    {
      compatibility: {
        builderSchema: 'nexpress-builder',
        builderVersion: 1,
      },
      content: {
        pages,
        posts,
        redirects,
      },
      metadata: {
        ...(args.description ? { description: args.description } : {}),
        id: normalizeSlugSegment(args.templateId ?? args.label),
        label: args.label,
        tags: [],
      },
      requiredBlocks: buildRequiredBlocks(pages),
      resources: {
        assetUrls: [],
      },
      schema: 'nexpress-template-manifest',
      theme: {
        id: themeId,
      },
      version: 1,
    },
    {
      blockRegistry: coreBlockRegistry,
      themeRegistry: defaultThemeRegistry,
    },
  );

  if (!manifestResult.success) {
    throw new TemplateFlowError(manifestResult.errors.join('; '), 400);
  }

  await writeTemplateAudit(payload, {
    action: AUDIT_ACTIONS.templateExported,
    metadata: {
      includeDrafts: args.includeDrafts === true,
      manifestId: manifestResult.manifest.metadata.id,
      pageCount: manifestResult.manifest.content.pages.length,
      postCount: manifestResult.manifest.content.posts.length,
      redirectCount: manifestResult.manifest.content.redirects.length,
      themeId,
    },
    targetId: manifestResult.manifest.metadata.id,
    user,
  });

  return manifestResult.manifest;
}

export async function exportTemplateManifest(args: ExportRequestInput & { user: AuthenticatedUserLike | null | undefined }) {
  const payload = await getPayloadClient();

  return exportTemplateManifestWithPayload(payload as unknown as PayloadClientLike, args);
}

/**
 * List all registered themes.
 */
export function listThemes() {
  return defaultThemeRegistry.list();
}

/**
 * List all available templates (local registry).
 */
export function listTemplates() {
  return [starterTemplateManifest];
}

export function parseTemplateRequestOrThrow<T>(result: z.ZodSafeParseResult<T>) {
  if (result.success) {
    return result.data;
  }

  const message = result.error.issues.map((issue) => issue.message).join('; ');
  throw new TemplateFlowError(message || 'Invalid template request.', 400);
}

export async function applyThemeToSite(args: {
  siteId: string;
  themeId: string;
  user: AuthenticatedUserLike | null | undefined;
}) {
  assertTemplateAdminUser(args.user);
  const themeId = validateThemeId(args.themeId);
  const payload = await getPayloadClient();

  const site = await payload.find({
    collection: 'sites',
    where: {
      siteId: { equals: args.siteId },
    },
    limit: 1,
    user: args.user,
  });

  if (!site.docs[0]) {
    throw new TemplateFlowError(`Site "${args.siteId}" not found.`, 404);
  }

  await payload.update({
    collection: 'sites',
    id: site.docs[0].id,
    data: {
      settings: {
        ...site.docs[0].settings,
        themeId,
      },
    },
    user: args.user,
  });

  await writeTemplateAudit(payload as unknown as PayloadClientLike, {
    action: AUDIT_ACTIONS.templateImported, // Reusing for now or could add THEME_APPLIED
    metadata: {
      siteId: args.siteId,
      themeId,
    },
    targetId: args.siteId,
    user: args.user as AuthenticatedUserLike,
  });

  return { success: true, themeId };
}

export function normalizeTemplateError(error: unknown) {
  return toTemplateFlowError(error);
}
