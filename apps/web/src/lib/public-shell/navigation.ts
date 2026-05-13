export type PublicNavItem = {
  href: string;
  label: string;
};

export type PublicActionLink = {
  href: string;
  label: string;
  style: 'primary' | 'secondary';
};

export const PUBLIC_NAV_ITEMS: readonly PublicNavItem[] = [
  {
    href: '#platform',
    label: 'Platform',
  },
  {
    href: '#foundations',
    label: 'Foundations',
  },
  {
    href: '#security',
    label: 'Security',
  },
] as const;

export const PUBLIC_ACTION_LINKS: readonly PublicActionLink[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    style: 'primary',
  },
  {
    href: '/admin',
    label: 'Payload Admin',
    style: 'secondary',
  },
] as const;
