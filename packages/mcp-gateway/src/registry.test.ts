import { describe, it, expect } from 'vitest';
import { McpRegistry } from './registry.js';
import { z } from 'zod';

describe('McpRegistry', () => {
  it('registers and retrieves a tool', () => {
    const registry = new McpRegistry();
    registry.registerTool({
      name: 'test.tool',
      description: 'A test tool',
      inputSchema: z.object({}),
      requiredScopes: ['test:scope'],
      execute: async () => ({ content: [{ type: 'text', text: 'ok' }] })
    });

    const tool = registry.getTool('test.tool');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('test.tool');
  });

  it('rejects duplicate tools', () => {
    const registry = new McpRegistry();
    const toolDef = {
      name: 'test.tool',
      description: 'A test tool',
      inputSchema: z.object({}),
      requiredScopes: ['test:scope'],
      execute: async () => ({ content: [{ type: 'text', text: 'ok' }] })
    };
    registry.registerTool(toolDef);

    expect(() => registry.registerTool(toolDef)).toThrow(/already registered/);
  });

  it('checks scopes correctly', () => {
    const registry = new McpRegistry();
    
    expect(registry.hasScope({ scopes: ['admin'] }, ['admin'])).toBe(true);
    expect(registry.hasScope({ scopes: ['admin'] }, ['editor'])).toBe(false);
    expect(registry.hasScope({ scopes: ['admin'] }, [])).toBe(true);
    expect(registry.hasScope({ scopes: ['admin', 'editor'] }, ['editor'])).toBe(true);
  });
});
