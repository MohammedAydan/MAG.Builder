import type { ReactNode } from 'react';
import {
  coreBlockRegistry,
  type BuilderBlockRegistry,
  type BuilderKnownBlock,
  type BuilderRenderContext,
  type JsonObject,
} from '@nexpress/builder-core';

export function getDefinition(registry: BuilderBlockRegistry, type: string) {
  const definition = registry.get(type);

  if (!definition) {
    throw new Error(`Missing builder block definition for "${type}".`);
  }

  return definition;
}

export function renderDefinition(
  type: string,
  id: string,
  props: JsonObject,
  children: ReactNode,
  registry: BuilderBlockRegistry = coreBlockRegistry,
) {
  const definition = getDefinition(registry, type);
  const context: BuilderRenderContext = {
    surface: 'admin',
  };
  const block: BuilderKnownBlock = {
    children: [],
    definition,
    id,
    kind: 'known',
    props,
    type,
  };

  return definition.render({
    block,
    children,
    context,
    props,
  });
}
