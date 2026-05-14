import {
  BUILDER_DOCUMENT_SCHEMA,
  CURRENT_BUILDER_DOCUMENT_VERSION,
  coreBlockRegistry,
  type BuilderDocumentInput,
  type BuilderStructureValidationResult,
  type ValidatedBuilderBlock,
  validateBuilderDocument,
} from '@nexpress/builder-core';
import {
  builderDocumentToEditorData,
  editorDataToBuilderDocument,
  type EditorData,
} from '@nexpress/builder-editor';
import { z } from 'zod';
import {
  canManageContent,
  getUserRole,
  type AuthenticatedUserLike,
} from '@/lib/auth/access';
import { createAuditContext } from '@/lib/audit/service';
import { getPayloadClient } from '@/lib/payload';
import type { Page } from '@/payload-types';

export type BuilderEditorPageSummary = Readonly<{
  id: number;
  slug: string;
  status: 'draft' | 'published';
  title: string;
  updatedAt: string;
}>;

export type BuilderEditorPageRecord = Pick<
  Page,
  'body' | 'builder' | 'id' | 'slug' | 'title' | 'updatedAt' | '_status'
>;

export type BuilderEditorLoadResult = Readonly<{
  editorData: EditorData;
  page: BuilderEditorPageRecord;
  warnings: readonly string[];
}>;

const builderSaveRequestSchema = z.object({
  data: z.object({
    content: z.array(
      z.object({
        props: z.object({
          id: z.string().min(1),
        }).and(z.record(z.string(), z.unknown())),
        type: z.string().min(1),
      }),
    ),
    root: z.record(z.string(), z.unknown()),
  }),
});

function createEditorAuditActor(user: AuthenticatedUserLike) {
  return {
    ...(user.email ? { email: user.email } : {}),
    role: getUserRole(user),
    source: 'user' as const,
    userId: user.id,
  };
}

function assertContentEditor(user: AuthenticatedUserLike | null | undefined) {
  if (!canManageContent(user)) {
    throw new Error('Forbidden');
  }
}

function createEmptyBuilderDocument(): BuilderDocumentInput {
  return {
    blocks: [],
    schema: BUILDER_DOCUMENT_SCHEMA,
    version: CURRENT_BUILDER_DOCUMENT_VERSION,
  };
}

function createDraftBodyFallback(title: string) {
  return `${title}\n\nThis page is now managed by the visual builder draft flow.`;
}

function normalizeBuilderSaveResult(result: BuilderStructureValidationResult) {
  if (!result.success) {
    return {
      errors: result.errors,
      success: false as const,
    };
  }

  return {
    document: result.document,
    success: true as const,
  };
}

function collectBuilderSaveErrors(blocks: readonly ValidatedBuilderBlock[], errors: string[] = []) {
  for (const block of blocks) {
    if (block.kind === 'invalid') {
      errors.push(...block.errors);
    }

    if (block.kind === 'unknown') {
      errors.push(`Unsupported block type "${block.type}" cannot be saved from the visual editor.`);
    }

    if (block.children.length > 0) {
      collectBuilderSaveErrors(block.children, errors);
    }
  }

  return errors;
}

export function parseBuilderSaveRequest(input: unknown) {
  return builderSaveRequestSchema.safeParse(input);
}

export function convertEditorDataToDraftDocument(data: EditorData) {
  const structuralResult = normalizeBuilderSaveResult(
    editorDataToBuilderDocument(data, coreBlockRegistry),
  );

  if (!structuralResult.success) {
    return structuralResult;
  }

  const semanticResult = validateBuilderDocument(structuralResult.document, coreBlockRegistry);

  if (!semanticResult.success) {
    return {
      errors: semanticResult.errors,
      success: false as const,
    };
  }

  const semanticErrors = collectBuilderSaveErrors(semanticResult.document.blocks);

  if (semanticErrors.length > 0) {
    return {
      errors: semanticErrors,
      success: false as const,
    };
  }

  return structuralResult;
}

export async function listBuilderPages(user: AuthenticatedUserLike) {
  assertContentEditor(user);
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'pages',
    depth: 0,
    draft: true,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    sort: '-updatedAt',
    user,
  });

  return result.docs.map(
    (page): BuilderEditorPageSummary => ({
      id: Number(page.id),
      slug: page.slug,
      status: page._status === 'published' ? 'published' : 'draft',
      title: page.title,
      updatedAt: page.updatedAt,
    }),
  );
}

export async function createBuilderPageDraft(user: AuthenticatedUserLike) {
  assertContentEditor(user);
  const payload = await getPayloadClient();
  const timestamp = Date.now();
  const title = `Untitled Page ${timestamp}`;
  const slug = `untitled-page-${timestamp}`;

  const page = await payload.create({
    collection: 'pages',
    context: createAuditContext({
      actor: createEditorAuditActor(user),
      source: 'dashboard.pages.create',
    }),
    data: {
      body: createDraftBodyFallback(title),
      builder: createEmptyBuilderDocument(),
      slug,
      title,
    },
    draft: true,
    overrideAccess: false,
    user,
  });

  return page;
}

export async function loadBuilderEditorPage(id: number | string, user: AuthenticatedUserLike): Promise<BuilderEditorLoadResult | null> {
  assertContentEditor(user);
  const payload = await getPayloadClient();
  const page = await payload.findByID({
    collection: 'pages',
    depth: 0,
    draft: true,
    id,
    overrideAccess: false,
    user,
  });

  if (!page) {
    return null;
  }

  const conversion = builderDocumentToEditorData(page.builder, coreBlockRegistry);

  const pageRecord: BuilderEditorPageRecord = {
    body: page.body,
    id: page.id,
    slug: page.slug,
    title: page.title,
    updatedAt: page.updatedAt,
    ...(page._status !== undefined ? { _status: page._status } : {}),
    ...(page.builder !== undefined ? { builder: page.builder } : {}),
  };

  return {
    editorData: conversion.data,
    page: pageRecord,
    warnings: conversion.warnings,
  };
}

export async function saveBuilderPageDraft(args: {
  data: EditorData;
  id: number | string;
  user: AuthenticatedUserLike;
}) {
  assertContentEditor(args.user);
  const nextDocument = convertEditorDataToDraftDocument(args.data);

  if (!nextDocument.success) {
    return nextDocument;
  }

  const payload = await getPayloadClient();

  await payload.update({
    collection: 'pages',
    context: createAuditContext({
      actor: createEditorAuditActor(args.user),
      metadata: {
        editor: 'puck',
      },
      source: 'dashboard.pages.builder.save',
    }),
    data: {
      builder: nextDocument.document,
    },
    draft: true,
    id: args.id,
    overrideAccess: false,
    user: args.user,
  });

  return {
    document: nextDocument.document,
    savedAt: new Date().toISOString(),
    success: true as const,
  };
}
