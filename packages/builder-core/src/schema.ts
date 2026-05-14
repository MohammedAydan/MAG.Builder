import { z } from 'zod';
import {
  BUILDER_DOCUMENT_SCHEMA,
  CURRENT_BUILDER_DOCUMENT_VERSION,
  type BuilderBlockInput,
  type BuilderDocumentInput,
  type JsonObject,
  type JsonValue,
} from './types';

export const builderBlockIdSchema = z
  .string()
  .min(1, 'Block id is required.')
  .max(64, 'Block id must be 64 characters or fewer.')
  .regex(/^[A-Za-z0-9_-]+$/, 'Block id must contain only letters, numbers, underscores, or hyphens.');

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([z.boolean(), z.null(), z.number(), z.string(), z.array(jsonValueSchema), z.record(z.string(), jsonValueSchema)]),
);

export const jsonObjectSchema: z.ZodType<JsonObject> = z.record(z.string(), jsonValueSchema);

export const builderBlockInputSchema: z.ZodType<BuilderBlockInput> = z.lazy(() =>
  z
    .object({
      children: z.array(builderBlockInputSchema).optional(),
      id: builderBlockIdSchema,
      props: jsonObjectSchema.optional(),
      type: z.string().min(1, 'Block type is required.').max(100, 'Block type is too long.'),
    })
    .strict(),
);

export const builderDocumentSchema: z.ZodType<BuilderDocumentInput> = z
  .object({
    blocks: z.array(builderBlockInputSchema),
    meta: z
      .object({
        migratedFromVersion: z.number().int().min(0).nullable().optional(),
      })
      .strict()
      .optional(),
    schema: z.literal(BUILDER_DOCUMENT_SCHEMA),
    version: z.literal(CURRENT_BUILDER_DOCUMENT_VERSION),
  })
  .strict();

type LegacyBuilderBlockInput = Readonly<{
  config?: JsonObject | undefined;
  id: string;
  items?: readonly LegacyBuilderBlockInput[] | undefined;
  kind: string;
}>;

export type LegacyBuilderDocumentInput = Readonly<{
  content: readonly LegacyBuilderBlockInput[];
  schema: typeof BUILDER_DOCUMENT_SCHEMA;
  version: 0;
}>;

const legacyBuilderBlockSchema: z.ZodType<LegacyBuilderBlockInput> = z.lazy(() =>
  z
    .object({
      config: jsonObjectSchema.optional(),
      id: builderBlockIdSchema,
      items: z.array(legacyBuilderBlockSchema).optional(),
      kind: z.string().min(1, 'Legacy block kind is required.').max(100, 'Legacy block kind is too long.'),
    })
    .strict(),
);

export const legacyBuilderDocumentSchema = z
  .object({
    content: z.array(legacyBuilderBlockSchema),
    schema: z.literal(BUILDER_DOCUMENT_SCHEMA),
    version: z.literal(0),
  })
  .strict();
