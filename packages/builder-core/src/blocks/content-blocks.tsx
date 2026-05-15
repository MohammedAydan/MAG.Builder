import { z } from 'zod';
import { isSafeAssetSrc, isSafeHref } from '../url';
import { createDefinition } from './utils';

const alignClasses: Record<'center' | 'left' | 'right', string> = {
  center: 'text-center',
  left: 'text-left',
  right: 'text-right',
};

const headingPropsSchema = z.object({
  align: z.enum(['center', 'left', 'right']),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
  text: z.string().min(1, 'Heading text is required.').max(160, 'Heading text is too long.'),
});

const textPropsSchema = z.object({
  align: z.enum(['center', 'left', 'right']),
  size: z.enum(['lg', 'md', 'sm']),
  text: z.string().min(1, 'Text content is required.').max(4000, 'Text content is too long.'),
  tone: z.enum(['default', 'muted']),
});

const imagePropsSchema = z.object({
  alt: z.string().min(1, 'Image alt text is required.').max(240, 'Image alt text is too long.'),
  aspectRatio: z.enum(['auto', 'landscape', 'portrait', 'square']),
  caption: z.string().max(280, 'Image caption is too long.').optional(),
  /**
   * Safe URL source. Can be a resolved Payload media URL or external URL.
   */
  src: z
    .string()
    .min(1, 'Image source is required.')
    .refine((value) => isSafeAssetSrc(value), 'Image source must be a safe absolute or site-relative URL.'),
  /**
   * Reference to a Payload Media document.
   * If provided, the renderer in apps/web can resolve this to a real URL.
   */
  mediaId: z.string().optional(),
});

const buttonPropsSchema = z.object({
  href: z
    .string()
    .min(1, 'Button link is required.')
    .refine((value) => isSafeHref(value), 'Button link must be a safe relative or absolute URL.'),
  label: z.string().min(1, 'Button label is required.').max(80, 'Button label is too long.'),
  variant: z.enum(['ghost', 'primary', 'secondary']),
});

type HeadingProps = z.infer<typeof headingPropsSchema>;
type TextProps = z.infer<typeof textPropsSchema>;
type ImageProps = z.infer<typeof imagePropsSchema>;
type ButtonProps = z.infer<typeof buttonPropsSchema>;

const textSizeClasses: Record<TextProps['size'], string> = {
  lg: 'text-lg leading-8',
  md: 'text-base leading-8',
  sm: 'text-sm leading-7',
};

const buttonVariantClasses: Record<ButtonProps['variant'], string> = {
  ghost:
    'border border-[var(--color-border-strong)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)]',
  primary: 'bg-[var(--color-accent)] text-[var(--color-accent-ink)] hover:opacity-95',
  secondary:
    'bg-[var(--color-surface-strong)] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-surface-strong)_88%,black)]',
};

const aspectRatioStyles: Record<ImageProps['aspectRatio'], string | undefined> = {
  auto: undefined,
  landscape: '16 / 9',
  portrait: '4 / 5',
  square: '1 / 1',
};

function renderParagraphs(text: string, className: string) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => (
      <p
        key={paragraph}
        className={className}
      >
        {paragraph}
      </p>
    ));
}

export const contentDefinitions = [
  createDefinition({
    availability: {
      admin: true,
      public: true,
    },
    displayName: 'Heading',
    propsSchema: headingPropsSchema,
    render: ({ props }) => {
      const headingProps = props as HeadingProps;
      const Tag = `h${headingProps.level}` as const;

      return (
        <Tag
          className={[
            alignClasses[headingProps.align],
            headingProps.level === 1 ? 'text-4xl font-semibold tracking-tight sm:text-5xl' : '',
            headingProps.level === 2 ? 'text-3xl font-semibold tracking-tight sm:text-4xl' : '',
            headingProps.level === 3 ? 'text-2xl font-semibold tracking-tight' : '',
            headingProps.level >= 4 ? 'text-xl font-semibold tracking-tight' : '',
            'text-[var(--color-ink)]',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {headingProps.text}
        </Tag>
      );
    },
    type: 'core.heading',
  }),
  createDefinition({
    availability: {
      admin: true,
      public: true,
    },
    displayName: 'Text',
    propsSchema: textPropsSchema,
    render: ({ props }) => {
      const textProps = props as TextProps;

      return (
        <div
          className={[
            alignClasses[textProps.align],
            textProps.tone === 'muted' ? 'text-[var(--color-ink-muted)]' : 'text-[var(--color-ink)]',
            textSizeClasses[textProps.size],
            'space-y-4',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {renderParagraphs(textProps.text, '')}
        </div>
      );
    },
    type: 'core.text',
  }),
  createDefinition({
    availability: {
      admin: true,
      public: true,
    },
    displayName: 'Image',
    propsSchema: imagePropsSchema,
    render: ({ props }) => {
      const imageProps = props as ImageProps;

      return (
        <figure className="space-y-3">
          <img
            alt={imageProps.alt}
            className="w-full rounded-[var(--radius-surface)] object-cover"
            loading="lazy"
            src={imageProps.src}
            style={
              aspectRatioStyles[imageProps.aspectRatio]
                ? { aspectRatio: aspectRatioStyles[imageProps.aspectRatio] }
                : undefined
            }
          />
          {imageProps.caption ? (
            <figcaption className="text-sm text-[var(--color-ink-muted)]">{imageProps.caption}</figcaption>
          ) : null}
        </figure>
      );
    },
    type: 'core.image',
  }),
  createDefinition({
    availability: {
      admin: true,
      public: true,
    },
    displayName: 'Button',
    propsSchema: buttonPropsSchema,
    render: ({ props }) => {
      const buttonProps = props as ButtonProps;

      return (
        <div className="flex">
          <a
            className={[
              buttonVariantClasses[buttonProps.variant],
              'inline-flex items-center justify-center rounded-[var(--radius-chip)] px-5 py-3 text-sm font-semibold transition-colors',
            ].join(' ')}
            href={buttonProps.href}
          >
            {buttonProps.label}
          </a>
        </div>
      );
    },
    type: 'core.button',
  }),
] as const;
