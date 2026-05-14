import type { ReactElement, ReactNode } from 'react';
import { coreBlockRegistry, type BuilderBlockRegistry, type BuilderKnownBlock, type BuilderRenderContext, type JsonObject } from '@nexpress/builder-core';
import type { Config, Slot } from '@measured/puck';

type SectionProps = {
  background: 'none' | 'strong' | 'surface';
  content?: Slot;
  gap: 'lg' | 'md' | 'sm';
  paddingY: 'lg' | 'md' | 'none' | 'sm';
  width: 'content' | 'full' | 'wide';
};

type HeadingProps = {
  align: 'center' | 'left' | 'right';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
};

type TextProps = {
  align: 'center' | 'left' | 'right';
  size: 'lg' | 'md' | 'sm';
  text: string;
  tone: 'default' | 'muted';
};

type ImageProps = {
  alt: string;
  aspectRatio: 'auto' | 'landscape' | 'portrait' | 'square';
  caption?: string;
  src: string;
};

type ButtonProps = {
  href: string;
  label: string;
  variant: 'ghost' | 'primary' | 'secondary';
};

export type NexpressEditorComponents = {
  'core.button': ButtonProps;
  'core.heading': HeadingProps;
  'core.image': ImageProps;
  'core.section': SectionProps;
  'core.text': TextProps;
};

function getDefinition(registry: BuilderBlockRegistry, type: keyof NexpressEditorComponents) {
  const definition = registry.get(type);

  if (!definition) {
    throw new Error(`Missing builder block definition for "${type}".`);
  }

  return definition;
}

function renderDefinition(
  type: keyof NexpressEditorComponents,
  id: string,
  props: JsonObject,
  children: ReactNode,
  registry: BuilderBlockRegistry,
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

export function createPuckConfig(registry: BuilderBlockRegistry = coreBlockRegistry): Config<NexpressEditorComponents> {
  return {
    categories: {
      actions: {
        components: ['core.button'],
        title: 'Actions',
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
      'core.button': {
        defaultProps: {
          ...(getDefinition(registry, 'core.button').defaultProps ?? {}),
          href: '/contact',
          label: 'Get started',
          variant: 'primary',
        },
        fields: {
          href: {
            type: 'text',
          },
          label: {
            type: 'text',
          },
          variant: {
            options: [
              { label: 'Primary', value: 'primary' },
              { label: 'Secondary', value: 'secondary' },
              { label: 'Ghost', value: 'ghost' },
            ],
            type: 'select',
          },
        },
        label: 'Button',
        render: ({ id, ...props }) => (
          <>{renderDefinition(
            'core.button',
            id,
            {
              href: props.href,
              label: props.label,
              variant: props.variant,
            },
            null,
            registry,
          )}</>
        ),
      },
      'core.heading': {
        defaultProps: {
          align: 'left',
          level: 2,
          text: 'Heading',
          ...(getDefinition(registry, 'core.heading').defaultProps ?? {}),
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
          level: {
            options: [1, 2, 3, 4, 5, 6].map((value) => ({
              label: `H${value}`,
              value,
            })),
            type: 'select',
          },
          text: {
            type: 'text',
          },
        },
        label: 'Heading',
        render: ({ id, ...props }) => (
          <>{renderDefinition(
            'core.heading',
            id,
            {
              align: props.align,
              level: props.level,
              text: props.text,
            },
            null,
            registry,
          )}</>
        ),
      },
      'core.image': {
        defaultProps: {
          alt: 'Image description',
          aspectRatio: 'landscape',
          src: '/media/placeholder.jpg',
          ...(getDefinition(registry, 'core.image').defaultProps ?? {}),
        },
        fields: {
          alt: {
            type: 'text',
          },
          aspectRatio: {
            options: [
              { label: 'Auto', value: 'auto' },
              { label: 'Landscape', value: 'landscape' },
              { label: 'Portrait', value: 'portrait' },
              { label: 'Square', value: 'square' },
            ],
            type: 'select',
          },
          caption: {
            type: 'textarea',
          },
          src: {
            type: 'text',
          },
        },
        label: 'Image',
        render: ({ id, ...props }) => (
          <>{renderDefinition(
            'core.image',
            id,
            {
              alt: props.alt,
              ...(props.caption ? { caption: props.caption } : {}),
              aspectRatio: props.aspectRatio,
              src: props.src,
            },
            null,
            registry,
          )}</>
        ),
      },
      'core.section': {
        defaultProps: {
          content: [],
          background: 'none',
          gap: 'md',
          paddingY: 'md',
          width: 'content',
        },
        fields: {
          background: {
            options: [
              { label: 'None', value: 'none' },
              { label: 'Surface', value: 'surface' },
              { label: 'Strong', value: 'strong' },
            ],
            type: 'select',
          },
          content: {
            allow: ['core.heading', 'core.text', 'core.image', 'core.button', 'core.section'],
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
        render: ({ content: Content, id, ...props }) => (
          <>{renderDefinition(
            'core.section',
            id,
            {
              background: props.background,
              gap: props.gap,
              paddingY: props.paddingY,
              width: props.width,
            },
            Content ? <Content /> : null,
            registry,
          )}</>
        ),
      },
      'core.text': {
        defaultProps: {
          align: 'left',
          size: 'md',
          text: 'Text block',
          tone: 'default',
          ...(getDefinition(registry, 'core.text').defaultProps ?? {}),
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
          size: {
            options: [
              { label: 'Small', value: 'sm' },
              { label: 'Medium', value: 'md' },
              { label: 'Large', value: 'lg' },
            ],
            type: 'select',
          },
          text: {
            type: 'textarea',
          },
          tone: {
            options: [
              { label: 'Default', value: 'default' },
              { label: 'Muted', value: 'muted' },
            ],
            type: 'select',
          },
        },
        label: 'Text',
        render: ({ id, ...props }) => (
          <>{renderDefinition(
            'core.text',
            id,
            {
              align: props.align,
              size: props.size,
              text: props.text,
              tone: props.tone,
            },
            null,
            registry,
          )}</>
        ),
      },
    },
    root: {
      render: ({ children }): ReactElement => (
        <div className="min-h-full bg-[var(--color-canvas)] py-6">
          {children}
        </div>
      ),
    },
  };
}
