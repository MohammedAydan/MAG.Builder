import { describe, expect, it } from 'vitest';
import { createPuckConfig } from './config';

describe('puck config', () => {
  it('maps core builder blocks into editor components', () => {
    const config = createPuckConfig();

    expect(Object.keys(config.components).sort()).toEqual([
      'commerce.cart',
      'commerce.collection-list',
      'commerce.product-detail',
      'commerce.product-grid',
      'core.button',
      'core.form',
      'core.heading',
      'core.image',
      'core.section',
      'core.text',
    ]);

    expect(config.components['core.section'].fields?.content).toEqual({
      allow: [
        'core.heading',
        'core.text',
        'core.image',
        'core.button',
        'core.section',
        'core.form',
        'commerce.product-grid',
        'commerce.product-detail',
        'commerce.cart',
        'commerce.collection-list',
      ],
      type: 'slot',
    });
  });
});
