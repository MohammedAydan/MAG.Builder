import type { ReactNode } from 'react';

type SectionHeadingProps = Readonly<{
  align?: 'left' | 'split';
  children?: ReactNode;
  eyebrow: string;
  title: string;
}>;

export function SectionHeading({
  align = 'left',
  children,
  eyebrow,
  title,
}: SectionHeadingProps) {
  return (
    <div
      className={
        align === 'split'
          ? 'flex flex-col gap-4 md:flex-row md:items-end md:justify-between'
          : 'space-y-3'
      }
    >
      <div className="space-y-3">
        <p className="public-kicker">{eyebrow}</p>
        <h2 className="public-heading text-[var(--type-title)] text-[var(--color-ink)]">{title}</h2>
      </div>
      {children ? (
        <div className="max-w-[var(--type-measure)] text-sm leading-7 text-[var(--color-ink-muted)] sm:text-base">
          {children}
        </div>
      ) : null}
    </div>
  );
}
