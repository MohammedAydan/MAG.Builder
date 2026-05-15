import type { ReactNode } from 'react';
import type { z } from 'zod';
import type { BuilderBlockDefinition, BuilderKnownBlock, BuilderRenderContext, JsonObject } from '../types';

export function renderPlaceholder(message: string, title?: string) {
  return (
    <div className="rounded-[var(--radius-surface)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] px-[var(--space-gutter)] py-[var(--space-8)] text-sm text-[var(--color-ink-muted)]">
      {title ? (
        <p className="mb-2 text-sm font-semibold text-[var(--color-ink)]">{title}</p>
      ) : null}
      <p>{message}</p>
    </div>
  );
}

export function renderExternalBlock(
  block: BuilderKnownBlock,
  context: BuilderRenderContext,
  props: JsonObject,
  adminFallback: ReactNode,
  publicFallbackMessage: string,
) {
  const rendered = context.renderExternalBlock?.({
    block,
    context,
    props,
    type: block.type,
  });

  if (rendered != null) {
    return rendered;
  }

  return context.surface === 'admin'
    ? adminFallback
    : renderPlaceholder(publicFallbackMessage);
}

export function createDefinition<TType extends string, TProps extends Record<string, unknown>>(
  definition: {
    availability?: BuilderBlockDefinition['availability'];
    defaultProps?: TProps;
    displayName: string;
    propsSchema: z.ZodType<TProps>;
    render: (args: {
      block: BuilderKnownBlock;
      children: ReactNode;
      context: BuilderRenderContext;
      props: TProps;
    }) => ReactNode;
    supportsChildren?: boolean;
    type: TType;
  },
): BuilderBlockDefinition {
  return {
    availability: definition.availability,
    ...(definition.defaultProps ? { defaultProps: definition.defaultProps as JsonObject } : {}),
    displayName: definition.displayName,
    propsSchema: definition.propsSchema as z.ZodType<JsonObject>,
    render: definition.render as BuilderBlockDefinition['render'],
    type: definition.type,
    supportsChildren: definition.supportsChildren,
  };
}
