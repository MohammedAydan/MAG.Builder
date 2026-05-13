export type PublicHighlight = {
  description: string;
  title: string;
};

export type PublicModuleCard = {
  description: string;
  label: string;
  title: string;
};

export const PUBLIC_STATUS_STRIP = [
  'Server-first install and route protections remain in place.',
  'Dashboard and Payload admin stay isolated from the public shell.',
  'Tokens and CSS variables now form the theme contract for future templates.',
] as const;

export const PUBLIC_HIGHLIGHTS: readonly PublicHighlight[] = [
  {
    description:
      'The public shell is intentionally separate from private admin and editor surfaces, keeping the future renderer boundary clean.',
    title: 'Public-first structure',
  },
  {
    description:
      'Semantic tokens drive color, type, spacing, radius, and surface behavior so later theme presets can build on one contract.',
    title: 'Tokenized visual system',
  },
  {
    description:
      'The shell is static, responsive, and safe: no private user state, no runtime secrets, and no content-system assumptions yet.',
    title: 'Production-safe baseline',
  },
] as const;

export const PUBLIC_FOUNDATION_CARDS: readonly PublicModuleCard[] = [
  {
    description:
      'The homepage shell renders without importing dashboard or Payload admin modules, preserving a future-safe public bundle boundary.',
    label: 'Boundary',
    title: 'Public rendering stays separate',
  },
  {
    description:
      'Theme variables now cover color modes, spacing, typography, layout widths, radii, and surfaces for later templates and content systems.',
    label: 'Tokens',
    title: 'Design system foundation is centralized',
  },
  {
    description:
      'Install, RBAC, and audited admin actions remain unchanged, while the public shell stays static and authentication-free.',
    label: 'Safety',
    title: 'Existing protections remain intact',
  },
] as const;

export const PUBLIC_OPERATING_PRINCIPLES = [
  'Server components stay the default for public rendering.',
  'Theme customization is expressed through safe CSS variables, not arbitrary runtime scripts.',
  'Future content and commerce modules can plug into this shell without dragging admin code into the public surface.',
] as const;
