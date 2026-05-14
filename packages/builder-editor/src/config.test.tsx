import { describe, expect, it } from 'vitest';
import { createPuckConfig } from './config';

describe('puck config', () => {
  it('maps core builder blocks into editor components', () => {
    const config = createPuckConfig();

    expect(Object.keys(config.components)).toEqual([
      'core.button',
      'core.heading',
      'core.image',
      'core.section',
      'core.text',
    ]);

    expect(config.components['core.section'].fields?.content).toEqual({
      allow: ['core.heading', 'core.text', 'core.image', 'core.button', 'core.section'],
      type: 'slot',
    });
  });
});
