import type {
  PublicThemeDefinition,
  PublicThemeMode,
  ThemeRegistry,
  ThemeScale,
  ThemeVariableMap,
} from './types';
import { DEFAULT_PUBLIC_THEME_ID } from './types';

const REQUIRED_THEME_GROUPS = ['layout', 'radius', 'shadow', 'spacing', 'typography'] as const;

function ensureMatchingKeys(left: ThemeScale, right: ThemeScale, label: string) {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();

  if (leftKeys.join('|') !== rightKeys.join('|')) {
    throw new Error(`Theme ${label} must use the same semantic keys across modes.`);
  }
}

function assertThemeDefinition(theme: PublicThemeDefinition) {
  if (!theme.id.trim()) {
    throw new Error('Theme id must be non-empty.');
  }

  if (!theme.label.trim()) {
    throw new Error(`Theme "${theme.id}" must have a non-empty label.`);
  }

  ensureMatchingKeys(theme.tokens.colorModes.light, theme.tokens.colorModes.dark, theme.id);

  for (const group of REQUIRED_THEME_GROUPS) {
    if (Object.keys(theme.tokens[group]).length === 0) {
      throw new Error(`Theme "${theme.id}" must define at least one token in "${group}".`);
    }
  }
}

function prefixScale(scale: ThemeScale, prefix: string): Record<`--${string}`, string> {
  return Object.fromEntries(
    Object.entries(scale).map(([key, value]) => [`--${prefix}-${key}`, value]),
  ) as Record<`--${string}`, string>;
}

function getRequiredToken(scale: ThemeScale, key: string, label: string) {
  const value = scale[key];

  if (!value) {
    throw new Error(`Theme "${label}" is missing required token "${key}".`);
  }

  return value;
}

export function createThemeRegistry(entries: readonly PublicThemeDefinition[]): ThemeRegistry {
  const definitions = new Map<string, PublicThemeDefinition>();

  for (const entry of entries) {
    assertThemeDefinition(entry);

    if (definitions.has(entry.id)) {
      throw new Error(`Duplicate theme id "${entry.id}" is not allowed.`);
    }

    definitions.set(entry.id, entry);
  }

  return {
    get(id: string) {
      return definitions.get(id);
    },
    has(id: string) {
      return definitions.has(id);
    },
    list() {
      return [...definitions.values()];
    },
  };
}

export const defaultPublicTheme: PublicThemeDefinition = {
  description: 'Production-safe default public theme built from semantic design tokens only.',
  id: DEFAULT_PUBLIC_THEME_ID,
  label: 'NexPress Default',
  tokens: {
    colorModes: {
      dark: {
        accent: 'oklch(0.72 0.12 221)',
        'accent-ink': 'oklch(0.17 0.018 248)',
        'accent-soft': 'oklch(0.29 0.028 228)',
        'border-strong': 'oklch(0.35 0.016 240)',
        canvas: 'oklch(0.18 0.018 248)',
        ink: 'oklch(0.94 0.015 95)',
        'ink-muted': 'oklch(0.77 0.018 95)',
        line: 'oklch(0.35 0.016 240)',
        success: 'oklch(0.72 0.11 158)',
        surface: 'oklch(0.22 0.018 244)',
        'surface-strong': 'oklch(0.24 0.024 232)',
        'surface-subtle': 'oklch(0.2 0.018 244)',
        warning: 'oklch(0.8 0.13 78)',
      },
      light: {
        accent: 'oklch(0.56 0.15 226)',
        'accent-ink': 'oklch(0.985 0.006 95)',
        'accent-soft': 'oklch(0.91 0.04 220)',
        'border-strong': 'oklch(0.83 0.012 240)',
        canvas: 'oklch(0.975 0.008 95)',
        ink: 'oklch(0.26 0.02 250)',
        'ink-muted': 'oklch(0.49 0.018 250)',
        line: 'oklch(0.83 0.012 240)',
        success: 'oklch(0.59 0.11 158)',
        surface: 'oklch(0.99 0.004 95)',
        'surface-strong': 'oklch(0.94 0.017 225)',
        'surface-subtle': 'oklch(0.978 0.006 95)',
        warning: 'oklch(0.71 0.14 72)',
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
      compact: '2rem',
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
  },
};

export const defaultThemeRegistry = createThemeRegistry([defaultPublicTheme]);

export function resolveThemeVariables(
  registry: ThemeRegistry,
  themeId: string,
  mode: PublicThemeMode = 'light',
): ThemeVariableMap {
  const theme = registry.get(themeId);

  if (!theme) {
    throw new Error(`Theme "${themeId}" is not registered.`);
  }

  const typography = theme.tokens.typography;
  const radius = theme.tokens.radius;
  const spacing = theme.tokens.spacing;

  return {
    ...prefixScale(theme.tokens.colorModes[mode], 'color'),
    ...prefixScale(theme.tokens.layout, 'layout'),
    ...prefixScale(radius, 'radius'),
    ...prefixScale(theme.tokens.shadow, 'shadow'),
    ...prefixScale(spacing, 'space'),
    '--font-body': getRequiredToken(typography, 'body', theme.id),
    '--font-display': getRequiredToken(typography, 'display', theme.id),
    '--radius-surface': getRequiredToken(radius, 'panel', theme.id),
    '--space-8': getRequiredToken(spacing, 'compact', theme.id),
    '--type-hero': getRequiredToken(typography, 'hero', theme.id),
    '--type-measure': getRequiredToken(typography, 'measure', theme.id),
    '--type-title': getRequiredToken(typography, 'title', theme.id),
  };
}
