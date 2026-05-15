import { z } from 'zod';
import { createDefinition } from './utils';

const sectionPropsSchema = z.object({
  background: z.enum(['none', 'strong', 'surface']).optional().default('none'),
  gap: z.enum(['lg', 'md', 'sm']).optional().default('md'),
  paddingY: z.enum(['lg', 'md', 'none', 'sm']).optional().default('md'),
  width: z.enum(['content', 'full', 'wide']).optional().default('content'),
  /** Responsive layout: columns (1-4) */
  columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional().default(1),
  /** Alignment of children */
  align: z.enum(['center', 'left', 'right']).optional().default('left'),
});

type SectionProps = z.infer<typeof sectionPropsSchema>;

const sectionWidthClasses: Record<NonNullable<SectionProps['width']>, string> = {
  content: 'mx-auto max-w-[var(--layout-content)]',
  full: 'w-full',
  wide: 'mx-auto max-w-[var(--layout-wide)]',
};

const sectionPaddingClasses: Record<NonNullable<SectionProps['paddingY']>, string> = {
  lg: 'py-[calc(var(--space-section)*1.1)]',
  md: 'py-[var(--space-section)]',
  none: 'py-0',
  sm: 'py-[var(--space-8)]',
};

const sectionGapClasses: Record<NonNullable<SectionProps['gap']>, string> = {
  lg: 'gap-10',
  md: 'gap-6',
  sm: 'gap-4',
};

const sectionBackgroundClasses: Record<NonNullable<SectionProps['background']>, string> = {
  none: '',
  strong: 'rounded-[var(--radius-surface)] bg-[var(--color-surface-strong)]',
  surface: 'rounded-[var(--radius-surface)] bg-[var(--color-surface-subtle)]',
};

const columnClasses: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

const alignClasses: Record<string, string> = {
  center: 'items-center text-center',
  left: 'items-start text-left',
  right: 'items-end text-right',
};

export const layoutDefinitions = [
  createDefinition({
    availability: {
      admin: true,
      public: true,
    },
    defaultProps: {
      align: 'left',
      background: 'none',
      columns: 1,
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
            sectionWidthClasses[sectionProps.width ?? 'content'],
            sectionPaddingClasses[sectionProps.paddingY ?? 'md'],
            sectionBackgroundClasses[sectionProps.background ?? 'none'],
            'flex w-full flex-col px-[var(--space-gutter)]',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div
            className={[
              'grid w-full',
              columnClasses[sectionProps.columns ?? 1],
              sectionGapClasses[sectionProps.gap ?? 'md'],
              alignClasses[sectionProps.align ?? 'left'],
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {children}
          </div>
        </section>
      );
    },
    supportsChildren: true,
    type: 'core.section',
  }),
] as const;
