import type { CSSProperties } from 'react';

type TokenScale = Record<string, string>;

type PublicThemeTokens = {
  colorModes: {
    dark: TokenScale;
    light: TokenScale;
  };
  layout: TokenScale;
  radius: TokenScale;
  shadow: TokenScale;
  spacing: TokenScale;
  typography: TokenScale;
};

type ThemeVariableName = `--${string}`;
type ThemeVariableEntries = Record<ThemeVariableName, string>;
type ThemeStyle = CSSProperties & ThemeVariableEntries;

export type PublicThemeMode = 'light' | 'dark';

export const publicThemeTokens = {
  colorModes: {
    light: {
      accent: 'oklch(0.56 0.15 226)',
      'accent-soft': 'oklch(0.91 0.04 220)',
      canvas: 'oklch(0.975 0.008 95)',
      ink: 'oklch(0.26 0.02 250)',
      'ink-muted': 'oklch(0.49 0.018 250)',
      line: 'oklch(0.83 0.012 240)',
      'surface-strong': 'oklch(0.94 0.017 225)',
      surface: 'oklch(0.99 0.004 95)',
      success: 'oklch(0.59 0.11 158)',
      warning: 'oklch(0.71 0.14 72)',
    },
    dark: {
      accent: 'oklch(0.72 0.12 221)',
      'accent-soft': 'oklch(0.29 0.028 228)',
      canvas: 'oklch(0.18 0.018 248)',
      ink: 'oklch(0.94 0.015 95)',
      'ink-muted': 'oklch(0.77 0.018 95)',
      line: 'oklch(0.35 0.016 240)',
      'surface-strong': 'oklch(0.24 0.024 232)',
      surface: 'oklch(0.22 0.018 244)',
      success: 'oklch(0.72 0.11 158)',
      warning: 'oklch(0.8 0.13 78)',
    },
  },
  layout: {
    content: '78rem',
    rail: '19rem',
    wide: '90rem',
  },
  radius: {
    chip: '999px',
    lg: '1.5rem',
    md: '1rem',
    panel: '2rem',
    sm: '0.75rem',
  },
  shadow: {
    card: '0 24px 70px color-mix(in oklab, var(--color-ink) 9%, transparent)',
    lift: '0 30px 90px color-mix(in oklab, var(--color-ink) 12%, transparent)',
    subtle: '0 14px 44px color-mix(in oklab, var(--color-ink) 6%, transparent)',
  },
  spacing: {
    gutter: 'clamp(1.25rem, 2vw + 0.85rem, 2.75rem)',
    section: 'clamp(4rem, 7vw, 7rem)',
    stack: 'clamp(1rem, 1.5vw, 1.5rem)',
  },
  typography: {
    body: '"Aptos", "Segoe UI Variable Text", "Segoe UI", "Helvetica Neue", sans-serif',
    display:
      '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Times New Roman", serif',
    hero: 'clamp(3.6rem, 7vw, 6.2rem)',
    measure: '68ch',
    title: 'clamp(2rem, 4vw, 3.3rem)',
  },
} satisfies PublicThemeTokens;

function prefixScale(scale: TokenScale, prefix: string): ThemeVariableEntries {
  return Object.fromEntries(
    Object.entries(scale).map(([key, value]) => [`--${prefix}-${key}`, value]),
  ) as ThemeVariableEntries;
}

export function getPublicThemeVariables(mode: PublicThemeMode = 'light'): ThemeStyle {
  return {
    ...prefixScale(publicThemeTokens.colorModes[mode], 'color'),
    ...prefixScale(publicThemeTokens.layout, 'layout'),
    ...prefixScale(publicThemeTokens.radius, 'radius'),
    ...prefixScale(publicThemeTokens.shadow, 'shadow'),
    ...prefixScale(publicThemeTokens.spacing, 'space'),
    '--font-body': publicThemeTokens.typography.body,
    '--font-display': publicThemeTokens.typography.display,
    '--type-hero': publicThemeTokens.typography.hero,
    '--type-measure': publicThemeTokens.typography.measure,
    '--type-title': publicThemeTokens.typography.title,
  };
}
