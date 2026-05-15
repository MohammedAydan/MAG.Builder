import type { ReactElement } from 'react';
import { coreBlockRegistry, type BuilderBlockRegistry } from '@nexpress/builder-core';
import type { Config } from '@measured/puck';
import { createContentConfig, type ContentComponents } from './config/content';
import { createFormConfig, type FormComponents } from './config/forms';
import { createCommerceConfig, type CommerceComponents } from './config/commerce';
import { createLayoutConfig, type LayoutComponents } from './config/layout';

export type NexpressEditorComponents = ContentComponents &
  FormComponents &
  CommerceComponents &
  LayoutComponents;

export function createPuckConfig(
  registry: BuilderBlockRegistry = coreBlockRegistry,
): Config<NexpressEditorComponents> {
  const contentConfig = createContentConfig(registry);
  const formConfig = createFormConfig(registry);
  const commerceConfig = createCommerceConfig(registry);
  const layoutConfig = createLayoutConfig(registry);

  return {
    categories: {
      actions: {
        components: ['core.button'],
        title: 'Actions',
      },
      commerce: {
        components: [
          'commerce.product-grid',
          'commerce.product-detail',
          'commerce.cart',
          'commerce.collection-list',
        ],
        title: 'Commerce',
      },
      forms: {
        components: ['core.form'],
        title: 'Forms',
      },
      layout: {
        components: ['core.section'],
        title: 'Layout',
      },
      media: {
        components: ['core.image'],
        title: 'Media',
      },
      typography: {
        components: ['core.heading', 'core.text'],
        title: 'Typography',
      },
    },
    components: {
      ...contentConfig,
      ...formConfig,
      ...commerceConfig,
      ...layoutConfig,
    },
    root: {
      render: ({ children }): ReactElement => (
        <div className="min-h-full bg-[var(--color-canvas)] py-6">{children}</div>
      ),
    },
  };
}
