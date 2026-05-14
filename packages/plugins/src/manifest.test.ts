import { describe, expect, it } from 'vitest';
import { assertValidPluginManifest, validatePluginManifest } from './manifest';

describe('plugin manifest validation', () => {
  it('accepts a safe versioned manifest', () => {
    const manifest = assertValidPluginManifest({
      capabilities: ['content:posts'],
      compatibility: {
        platform: 'nexpress',
        pluginApiVersion: 1,
      },
      description: 'Safe local plugin manifest.',
      id: 'safe-plugin',
      manifestVersion: 1,
      metadata: {
        'vendor:flag': true,
      },
      modules: [
        {
          capabilities: ['builder:blocks'],
          description: 'Optional block metadata.',
          id: 'safe-module',
          name: 'Safe Module',
        },
      ],
      name: 'Safe Plugin',
      schema: 'nexpress-plugin-manifest',
      version: '1.2.3',
    });

    expect(manifest.id).toBe('safe-plugin');
    expect(manifest.modules?.[0]?.id).toBe('safe-module');
  });

  it('rejects protected keys and shell-like content', () => {
    const result = validatePluginManifest({
      capabilities: ['content:posts'],
      compatibility: {
        platform: 'nexpress',
        pluginApiVersion: 1,
      },
      description: 'Safe local plugin manifest.',
      id: 'unsafe-plugin',
      manifestVersion: 1,
      name: 'Unsafe Plugin',
      schema: 'nexpress-plugin-manifest',
      scripts: {
        install: 'pnpm run anything',
      },
      version: '1.0.0',
    });

    expect(result.success).toBe(false);
    expect(result.success ? [] : result.errors.join(' ')).toContain('protected keys');
  });

  it('rejects unknown capabilities', () => {
    const result = validatePluginManifest({
      capabilities: ['not:allowed'],
      compatibility: {
        platform: 'nexpress',
        pluginApiVersion: 1,
      },
      description: 'Safe local plugin manifest.',
      id: 'bad-capability-plugin',
      manifestVersion: 1,
      name: 'Bad Capability Plugin',
      schema: 'nexpress-plugin-manifest',
      version: '1.0.0',
    });

    expect(result.success).toBe(false);
    expect(result.success ? [] : result.errors.join(' ')).toContain('Invalid option');
  });

  it('rejects non-namespaced metadata keys', () => {
    const result = validatePluginManifest({
      capabilities: ['content:posts'],
      compatibility: {
        platform: 'nexpress',
        pluginApiVersion: 1,
      },
      description: 'Safe local plugin manifest.',
      id: 'bad-metadata-plugin',
      manifestVersion: 1,
      metadata: {
        unsafe: 'value',
      },
      name: 'Bad Metadata Plugin',
      schema: 'nexpress-plugin-manifest',
      version: '1.0.0',
    });

    expect(result.success).toBe(false);
    expect(result.success ? [] : result.errors.join(' ')).toContain('Invalid key in record');
  });
});
