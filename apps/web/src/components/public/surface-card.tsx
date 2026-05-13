import type { ReactNode } from 'react';

type SurfaceCardProps = Readonly<{
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'strong' | 'tinted';
}>;

const toneClassName: Record<NonNullable<SurfaceCardProps['tone']>, string> = {
  default:
    'bg-[color-mix(in_oklab,var(--color-surface)_86%,transparent)] shadow-[var(--shadow-card)]',
  strong:
    'bg-[color-mix(in_oklab,var(--color-surface)_92%,transparent)] shadow-[var(--shadow-lift)]',
  tinted:
    'bg-[color-mix(in_oklab,var(--color-surface-strong)_88%,transparent)] shadow-[var(--shadow-subtle)]',
};

export function SurfaceCard({
  children,
  className = '',
  tone = 'default',
}: SurfaceCardProps) {
  return (
    <article
      className={[
        'public-grid-line rounded-[var(--radius-panel)] border p-6 backdrop-blur-sm',
        toneClassName[tone],
        className,
      ].join(' ')}
    >
      {children}
    </article>
  );
}
