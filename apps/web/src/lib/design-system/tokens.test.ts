import { describe, expect, it } from 'vitest';
import { getPublicThemeVariables, publicThemeTokens } from '@/lib/design-system/tokens';

describe('public theme tokens', () => {
  it('keeps semantic color groups for both light and dark modes', () => {
    expect(Object.keys(publicThemeTokens.colorModes.light)).toEqual(
      Object.keys(publicThemeTokens.colorModes.dark),
    );
    expect(publicThemeTokens.colorModes.light).toHaveProperty('canvas');
    expect(publicThemeTokens.colorModes.light).toHaveProperty('accent');
    expect(publicThemeTokens.colorModes.dark).toHaveProperty('surface');
  });

  it('maps token scales into css variable entries', () => {
    const variables = getPublicThemeVariables();

    expect(variables['--color-canvas']).toBe(publicThemeTokens.colorModes.light.canvas);
    expect(variables['--layout-content']).toBe(publicThemeTokens.layout.content);
    expect(variables['--radius-panel']).toBe(publicThemeTokens.radius.panel);
    expect(variables['--type-hero']).toBe(publicThemeTokens.typography.hero);
  });
});
