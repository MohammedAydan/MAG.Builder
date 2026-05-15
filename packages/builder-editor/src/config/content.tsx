import type { ComponentConfig } from '@measured/puck';
import { coreBlockRegistry, type BuilderBlockRegistry } from '@nexpress/builder-core';
import { getDefinition, renderDefinition } from './utils';

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
  mediaId?: string;
};

type ButtonProps = {
  href: string;
  label: string;
  variant: 'ghost' | 'primary' | 'secondary';
};

export type ContentComponents = {
  'core.button': ButtonProps;
  'core.heading': HeadingProps;
  'core.image': ImageProps;
  'core.text': TextProps;
};

export function createContentConfig(registry: BuilderBlockRegistry = coreBlockRegistry): any {
  return {
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
      render: ({ id, ...props }: { id: string } & ButtonProps) => (
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
      render: ({ id, ...props }: { id: string } & HeadingProps) => (
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
        mediaId: {
          label: 'Media ID (Payload)',
          type: 'text',
        },
      },
      label: 'Image',
      render: ({ id, ...props }: { id: string } & ImageProps) => (
        <>{renderDefinition(
          'core.image',
          id,
          {
            alt: props.alt,
            ...(props.caption ? { caption: props.caption } : {}),
            aspectRatio: props.aspectRatio,
            src: props.src,
            ...(props.mediaId ? { mediaId: props.mediaId } : {}),
          },
          null,
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
      render: ({ id, ...props }: { id: string } & TextProps) => (
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
  };
}
