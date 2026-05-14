import type { CSSProperties } from 'react';
import {
  DEFAULT_PUBLIC_THEME_ID,
  defaultPublicTheme,
  defaultThemeRegistry,
  resolveThemeVariables,
  type PublicThemeMode,
} from '@nexpress/themes';

type ThemeStyle = CSSProperties & Record<`--${string}`, string>;

export const publicThemeId = DEFAULT_PUBLIC_THEME_ID;
export const publicThemeRegistry = defaultThemeRegistry;
export const publicThemeTokens = defaultPublicTheme.tokens;

export function getPublicThemeVariables(mode: PublicThemeMode = 'light'): ThemeStyle {
  return resolveThemeVariables(publicThemeRegistry, publicThemeId, mode) as ThemeStyle;
}
