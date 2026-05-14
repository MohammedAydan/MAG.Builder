import { describe, expect, it } from 'vitest';
import {
  createThemeRegistry,
  defaultPublicTheme,
  defaultThemeRegistry,
  resolveThemeVariables,
} from './index';

describe('theme registry', () => {
  it('registers and resolves the default theme deterministically', () => {
    const variables = resolveThemeVariables(defaultThemeRegistry, defaultPublicTheme.id);

    expect(defaultThemeRegistry.has(defaultPublicTheme.id)).toBe(true);
    expect(variables['--color-canvas']).toBe(defaultPublicTheme.tokens.colorModes.light.canvas);
    expect(variables['--radius-surface']).toBe(defaultPublicTheme.tokens.radius.panel);
    expect(variables['--space-8']).toBe(defaultPublicTheme.tokens.spacing.compact);
    expect(variables['--type-title']).toBe(defaultPublicTheme.tokens.typography.title);
  });

  it('rejects duplicate theme ids', () => {
    expect(() =>
      createThemeRegistry([defaultPublicTheme, defaultPublicTheme]),
    ).toThrow('Duplicate theme id');
  });

  it('requires matching color keys across modes', () => {
    expect(() =>
      createThemeRegistry([
        {
          ...defaultPublicTheme,
          id: 'broken-theme',
          tokens: {
            ...defaultPublicTheme.tokens,
            colorModes: {
              dark: defaultPublicTheme.tokens.colorModes.dark,
              light: {
                ...defaultPublicTheme.tokens.colorModes.light,
                extra: 'oklch(0 0 0)',
              },
            },
          },
        },
      ]),
    ).toThrow('same semantic keys');
  });
});
