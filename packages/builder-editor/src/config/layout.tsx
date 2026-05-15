import type { ComponentConfig, Slot } from '@measured/puck';
import { coreBlockRegistry, type BuilderBlockRegistry } from '@nexpress/builder-core';
import { getDefinition, renderDefinition } from './utils';

type SectionProps = {
  background: 'none' | 'strong' | 'surface';
  content?: Slot;
  gap: 'lg' | 'md' | 'sm';
  paddingY: 'lg' | 'md' | 'none' | 'sm';
  width: 'content' | 'full' | 'wide';
  columns: 1 | 2 | 3 | 4;
  align: 'center' | 'left' | 'right';
};

export type LayoutComponents = {
  'core.section': SectionProps;
};

export function createLayoutConfig(registry: BuilderBlockRegistry = coreBlockRegistry): any {
  return {
    'core.section': {
      defaultProps: {
        align: 'left',
        background: 'none',
        columns: 1,
        content: [],
        gap: 'md',
        paddingY: 'md',
        width: 'content',
      },
      fields: {
        align: {
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
          type: 'radio',
        },
        background: {
          options: [
            { label: 'None', value: 'none' },
            { label: 'Surface', value: 'surface' },
            { label: 'Strong', value: 'strong' },
          ],
          type: 'select',
        },
        columns: {
          options: [
            { label: '1 column', value: 1 },
            { label: '2 columns', value: 2 },
            { label: '3 columns', value: 3 },
            { label: '4 columns', value: 4 },
          ],
          type: 'select',
        },
        content: {
          allow: [
            'core.heading',
            'core.text',
            'core.image',
            'core.button',
            'core.section',
            'core.form',
            'commerce.product-grid',
            'commerce.product-detail',
            'commerce.cart',
            'commerce.collection-list',
          ],
          type: 'slot',
        },
        gap: {
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' },
          ],
          type: 'select',
        },
        paddingY: {
          options: [
            { label: 'None', value: 'none' },
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' },
          ],
          type: 'select',
        },
        width: {
          options: [
            { label: 'Content', value: 'content' },
            { label: 'Wide', value: 'wide' },
            { label: 'Full', value: 'full' },
          ],
          type: 'select',
        },
      },
      label: 'Section',
      render: ({ content: Content, id, ...props }: { content: any; id: string } & SectionProps) => (
        <>{renderDefinition(
          'core.section',
          id,
          {
            align: props.align,
            background: props.background,
            columns: props.columns,
            gap: props.gap,
            paddingY: props.paddingY,
            width: props.width,
          },
          Content ? <Content /> : null,
          registry,
        )}</>
      ),
    },
  };
}
