import { describe, expect, it } from 'vitest';
import {
  PUBLIC_FOUNDATION_CARDS,
  PUBLIC_HIGHLIGHTS,
  PUBLIC_OPERATING_PRINCIPLES,
  PUBLIC_STATUS_STRIP,
} from '@/lib/public-shell/content';
import { PUBLIC_ACTION_LINKS, PUBLIC_NAV_ITEMS } from '@/lib/public-shell/navigation';

describe('public shell content', () => {
  it('keeps primary navigation limited to public section anchors', () => {
    expect(PUBLIC_NAV_ITEMS.every((item) => item.href.startsWith('#'))).toBe(true);
    expect(PUBLIC_NAV_ITEMS.map((item) => item.label)).toEqual([
      'Platform',
      'Foundations',
      'Security',
    ]);
  });

  it('keeps operator shortcuts explicit and internal', () => {
    expect(PUBLIC_ACTION_LINKS).toEqual([
      { href: '/dashboard', label: 'Dashboard', style: 'primary' },
      { href: '/login', label: 'Member Login', style: 'secondary' },
      { href: '/admin', label: 'Payload Admin', style: 'secondary' },
    ]);
  });

  it('exports the public shell sections needed by the homepage', () => {
    expect(PUBLIC_STATUS_STRIP).toHaveLength(3);
    expect(PUBLIC_HIGHLIGHTS).toHaveLength(3);
    expect(PUBLIC_FOUNDATION_CARDS).toHaveLength(3);
    expect(PUBLIC_OPERATING_PRINCIPLES).toHaveLength(3);
  });
});
