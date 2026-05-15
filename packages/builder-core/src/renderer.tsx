import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { validateBuilderDocument } from './validation';
import type { BuilderRenderContext, BuilderBlockRegistry, BuilderValidationResult, ValidatedBuilderBlock, ValidatedBuilderDocument } from './types';

type RenderOptions = Readonly<{
  context?: Partial<BuilderRenderContext>;
  fallback?: ReactNode;
}>;

type SafeRenderOptions = RenderOptions &
  Readonly<{
    registry: BuilderBlockRegistry;
  }>;

function resolveContext(input?: Partial<BuilderRenderContext>): BuilderRenderContext {
  return {
    ...input,
    surface: input?.surface ?? 'public',
  };
}

function renderStatusBlock(
  status: 'invalid' | 'unknown' | 'unavailable',
  message: string,
  blockId: string,
  children: ReactNode,
) {
  return (
    <div
      className="rounded-[var(--radius-surface)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] p-4 text-sm text-[var(--color-ink-muted)]"
      data-builder-block-id={blockId}
      data-builder-block-status={status}
    >
      <p>{message}</p>
      {children ? <div className="mt-4 space-y-4">{children}</div> : null}
    </div>
  );
}

function renderBlock(block: ValidatedBuilderBlock, context: BuilderRenderContext): ReactNode {
  const children = (
    <>
      {block.children.map((child: ValidatedBuilderBlock) => (
        <Fragment key={child.id}>{renderBlock(child, context)}</Fragment>
      ))}
    </>
  );

  if (block.kind === 'unknown') {
    return renderStatusBlock('unknown', `Unsupported block type "${block.type}" was skipped safely.`, block.id, children);
  }

  if (block.kind === 'invalid') {
    return renderStatusBlock('invalid', `Invalid block "${block.type}" was skipped safely.`, block.id, children);
  }

  if (!block.definition.availability[context.surface]) {
    return renderStatusBlock('unavailable', `Block "${block.type}" is not available on this surface.`, block.id, children);
  }

  return block.definition.render({
    block,
    children,
    context,
    props: block.props,
  });
}

export function renderValidatedBuilderDocument(document: ValidatedBuilderDocument, options?: RenderOptions) {
  const context = resolveContext(options?.context);

  if (document.blocks.length === 0) {
    return options?.fallback ?? null;
  }

  return (
    <>
      {document.blocks.map((block) => (
        <Fragment key={block.id}>{renderBlock(block, context)}</Fragment>
      ))}
    </>
  );
}

export function renderBuilderDocument(input: unknown, options: SafeRenderOptions) {
  const result = validateBuilderDocument(input, options.registry);

  if (!result.success) {
    return options.fallback ?? null;
  }

  return renderValidatedBuilderDocument(result.document, options);
}

export function isBuilderDocumentValid(result: BuilderValidationResult): result is Extract<BuilderValidationResult, { success: true }> {
  return result.success;
}
