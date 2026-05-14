import { describe, expect, it } from 'vitest';
import { createPluginRegistry, planPluginMigrations, resolvePluginCapabilities } from './registry';
import { localPluginDefinitions } from './local-plugins';

describe('plugin registry', () => {
  it('registers local plugins deterministically', () => {
    const registry = createPluginRegistry(localPluginDefinitions);

    expect(registry.listIds()).toEqual([
      'blog-pack',
      'commerce-pack',
      'forms-pack',
      'membership-pack',
      'seo-pack',
    ]);
  });

  it('rejects duplicate plugin ids', () => {
    expect(() =>
      createPluginRegistry([
        localPluginDefinitions[0],
        {
          ...localPluginDefinitions[0],
        },
      ]),
    ).toThrow('Duplicate plugin id');
  });

  it('enforces dependencies during activation', () => {
    const registry = createPluginRegistry(localPluginDefinitions);
    const result = registry.validateActivation({
      pluginId: 'membership-pack',
    });

    expect(result.success).toBe(false);
    expect(result.success ? [] : result.errors.join(' ')).toContain('requires "forms-pack"');
  });

  it('rejects unknown modules and resolves enabled capabilities safely', () => {
    const registry = createPluginRegistry(localPluginDefinitions);
    const invalid = registry.validateActivation({
      enabledModules: ['missing-module'],
      pluginId: 'seo-pack',
    });

    expect(invalid.success).toBe(false);

    const resolved = resolvePluginCapabilities(
      localPluginDefinitions[0].manifest,
      ['blog-builder-blocks'],
    );

    expect(resolved.success).toBe(true);
    expect(resolved.success ? resolved.capabilities : []).toContain('builder:blocks');
  });

  it('plans migrations and preserves applied metadata', () => {
    const manifest = localPluginDefinitions[0].manifest;
    const plan = planPluginMigrations(manifest, [
      {
        executedAt: '2026-05-15T10:00:00.000Z',
        id: 'blog-pack-baseline',
        status: 'applied',
        version: '0.1.0',
      },
    ]);

    expect(plan.steps).toHaveLength(1);
    expect(plan.pending).toHaveLength(0);
    expect(plan.steps[0]?.status).toBe('applied');
  });
});
