import type { ReactNode } from 'react';
import { z } from 'zod';
import { createBlockRegistry } from '../registry';
import type { BuilderBlockDefinition, BuilderKnownBlock, BuilderRenderContext, JsonObject } from '../types';
import { isSafeAssetSrc, isSafeHref } from '../url';

/** Safe form slug pattern — must match the slug format enforced by @nexpress/forms. */
const SAFE_FORM_SLUG_REGEX = /^[a-z0-9-]{1,80}$/;

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

const sectionPropsSchema = z.object({
  background: z.enum(['none', 'strong', 'surface']),
  gap: z.enum(['lg', 'md', 'sm']),
  paddingY: z.enum(['lg', 'md', 'none', 'sm']),
  width: z.enum(['content', 'full', 'wide']),
});

const imagePropsSchema = z.object({
  alt: z.string().min(1, 'Image alt text is required.').max(240, 'Image alt text is too long.'),
  aspectRatio: z.enum(['auto', 'landscape', 'portrait', 'square']),
  caption: z.string().max(280, 'Image caption is too long.').optional(),
  src: z
    .string()
    .min(1, 'Image source is required.')
    .refine((value) => isSafeAssetSrc(value), 'Image source must be a safe absolute or site-relative URL.'),
});

const buttonPropsSchema = z.object({
  href: z
    .string()
    .min(1, 'Button link is required.')
    .refine((value) => isSafeHref(value), 'Button link must be a safe relative or absolute URL.'),
  label: z.string().min(1, 'Button label is required.').max(80, 'Button label is too long.'),
  variant: z.enum(['ghost', 'primary', 'secondary']),
});

const formPropsSchema = z.object({
  /**
   * Reference to a form definition by its slug.
   * Empty string means no form is selected (renders a placeholder).
   * When set, must match [a-z0-9-]+ pattern.
   */
  formSlug: z
    .string()
    .max(80, 'Form slug is too long.')
    .refine(
      (value) => value === '' || SAFE_FORM_SLUG_REGEX.test(value),
      'Form slug must be lowercase alphanumeric or hyphens only.',
    )
    .optional()
    .default(''),
  /** Optional submit button label override. */
  submitLabel: z.string().max(80).optional(),
  /** Optional heading displayed above the form. */
  title: z.string().max(120).optional(),
});


type HeadingProps = z.infer<typeof headingPropsSchema>;
type TextProps = z.infer<typeof textPropsSchema>;
type SectionProps = z.infer<typeof sectionPropsSchema>;
type ImageProps = z.infer<typeof imagePropsSchema>;
type ButtonProps = z.infer<typeof buttonPropsSchema>;
type FormProps = z.infer<typeof formPropsSchema>;


const alignClasses: Record<'center' | 'left' | 'right', string> = {
  center: 'text-center',
  left: 'text-left',
  right: 'text-right',
};

const sectionWidthClasses: Record<SectionProps['width'], string> = {
  content: 'mx-auto max-w-[var(--layout-content)]',
  full: 'w-full',
  wide: 'mx-auto max-w-[var(--layout-wide)]',
};

const sectionPaddingClasses: Record<SectionProps['paddingY'], string> = {
  lg: 'py-[calc(var(--space-section)*1.1)]',
  md: 'py-[var(--space-section)]',
  none: 'py-0',
  sm: 'py-[var(--space-8)]',
};

const sectionGapClasses: Record<SectionProps['gap'], string> = {
  lg: 'gap-10',
  md: 'gap-6',
  sm: 'gap-4',
};

const sectionBackgroundClasses: Record<SectionProps['background'], string> = {
  none: '',
  strong: 'rounded-[var(--radius-surface)] bg-[var(--color-surface-strong)]',
  surface: 'rounded-[var(--radius-surface)] bg-[var(--color-surface-subtle)]',
};

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

function createDefinition<TType extends string, TProps extends Record<string, unknown>>(
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
    ...(definition.supportsChildren !== undefined ? { supportsChildren: definition.supportsChildren } : {}),
  };
}

const coreDefinitions = [
  createDefinition({
    availability: {
      admin: true,
      public: true,
    },
    defaultProps: {
      background: 'none',
      gap: 'md',
      paddingY: 'md',
      width: 'content',
    },
    displayName: 'Section',
    propsSchema: sectionPropsSchema,
    render: ({ children, props }) => {
      const sectionProps = props as SectionProps;

      return (
        <section
          className={[
            sectionWidthClasses[sectionProps.width],
            sectionPaddingClasses[sectionProps.paddingY],
            sectionGapClasses[sectionProps.gap],
            sectionBackgroundClasses[sectionProps.background],
            'flex w-full flex-col px-[var(--space-gutter)]',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </section>
      );
    },
    supportsChildren: true,
    type: 'core.section',
  }),
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
  createDefinition({
    availability: {
      admin: true,
      public: true,
    },
    defaultProps: {
      formSlug: '',
      submitLabel: 'Submit',
      title: '',
    },
    displayName: 'Form',
    propsSchema: formPropsSchema,
    render: ({ props }) => {
      const formProps = props as FormProps;

      /**
       * Public renderer: renders a safe form container element.
       * The data-form-slug attribute references the form definition by slug only.
       * No form field definitions, API keys, or private configuration are
       * rendered here. The client-side hydration component in apps/web
       * fetches the public form definition by slug to render the actual form.
       *
       * If formSlug is empty (e.g., a new block in the editor with no slug set),
       * render a placeholder and nothing interactive.
       */
      if (!formProps.formSlug) {
        return (
          <div className="rounded-[var(--radius-surface)] border border-dashed border-[var(--color-border-strong)] px-[var(--space-gutter)] py-[var(--space-8)] text-center text-sm text-[var(--color-ink-muted)]">
            No form selected. Set a form slug in the editor.
          </div>
        );
      }

      return (
        <div
          className="w-full"
          data-block="core.form"
          data-form-slug={formProps.formSlug}
          data-submit-label={formProps.submitLabel ?? 'Submit'}
          data-title={formProps.title ?? ''}
        >
          {formProps.title ? (
            <h3 className="mb-4 text-xl font-semibold text-[var(--color-ink)]">{formProps.title}</h3>
          ) : null}
          <noscript>
            <p className="text-sm text-[var(--color-ink-muted)]">
              This form requires JavaScript to be enabled.
            </p>
          </noscript>
        </div>
      );
    },
    type: 'core.form',
  }),
] as const;

export const coreBlockRegistry = createBlockRegistry(coreDefinitions);

