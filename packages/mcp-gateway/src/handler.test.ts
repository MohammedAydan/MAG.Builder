import { describe, it, expect, vi } from 'vitest';
import { McpHandler } from './handler.js';
import { McpRegistry } from './registry.js';
import { z } from 'zod';

describe('McpHandler', () => {
  it('handles invalid jsonrpc request', async () => {
    const handler = new McpHandler();
    const response = await handler.handleRequest({ invalid: true }, { scopes: [] });
    expect(response.error?.code).toBe(-32600); // InvalidRequest
  });

  it('handles tools/list', async () => {
    const registry = new McpRegistry();
    registry.registerTool({
      name: 'test.tool',
      description: 'A test tool',
      inputSchema: z.object({}),
      requiredScopes: ['test:read'],
      execute: async () => ({ content: [{ type: 'text', text: 'ok' }] })
    });

    const handler = new McpHandler({ registry });
    
    const response = await handler.handleRequest(
      { jsonrpc: '2.0', id: 1, method: 'tools/list' },
      { scopes: ['test:read'] }
    );
    
    expect(response.result).toBeDefined();
    // @ts-expect-error - vitest typing
    expect(response.result.tools).toHaveLength(1);
  });

  it('filters tools by scope in tools/list', async () => {
    const registry = new McpRegistry();
    registry.registerTool({
      name: 'test.tool',
      description: 'A test tool',
      inputSchema: z.object({}),
      requiredScopes: ['admin'],
      execute: async () => ({ content: [{ type: 'text', text: 'ok' }] })
    });

    const handler = new McpHandler({ registry });
    
    const response = await handler.handleRequest(
      { jsonrpc: '2.0', id: 1, method: 'tools/list' },
      { scopes: ['editor'] }
    );
    
    // @ts-expect-error - vitest typing
    expect(response.result.tools).toHaveLength(0);
  });

  it('handles tools/call successfully', async () => {
    const registry = new McpRegistry();
    registry.registerTool({
      name: 'test.tool',
      description: 'A test tool',
      inputSchema: z.object({ name: z.string() }),
      requiredScopes: [],
      execute: async (params) => ({ content: [{ type: 'text', text: `Hello ${params.name}` }] })
    });

    const handler = new McpHandler({ registry });
    
    const response = await handler.handleRequest(
      { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'test.tool', arguments: { name: 'World' } } },
      { scopes: [] }
    );
    
    expect(response.result).toBeDefined();
    // @ts-expect-error - vitest typing
    expect(response.result.content[0].text).toBe('Hello World');
  });

  it('rejects tools/call for unknown tool', async () => {
    const handler = new McpHandler();
    const response = await handler.handleRequest(
      { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'unknown' } },
      { scopes: [] }
    );
    
    expect(response.error?.code).toBe(-32601); // MethodNotFound
  });

  it('rejects tools/call if scopes missing', async () => {
    const registry = new McpRegistry();
    registry.registerTool({
      name: 'secure.tool',
      description: 'Secure',
      inputSchema: z.object({}),
      requiredScopes: ['admin'],
      execute: async () => ({ content: [{ type: 'text', text: 'ok' }] })
    });

    const handler = new McpHandler({ registry });
    const response = await handler.handleRequest(
      { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'secure.tool', arguments: {} } },
      { scopes: ['editor'] }
    );
    
    expect(response.error?.code).toBe(403); // Forbidden
  });

  it('audits tool calls', async () => {
    const onAudit = vi.fn().mockResolvedValue(undefined);
    const registry = new McpRegistry();
    registry.registerTool({
      name: 'test.tool',
      description: 'A test tool',
      inputSchema: z.object({}),
      requiredScopes: [],
      execute: async () => ({ content: [{ type: 'text', text: 'ok' }] })
    });

    const handler = new McpHandler({ registry, onAudit });
    await handler.handleRequest(
      { jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'test.tool', arguments: {} } },
      { actorId: 'user1', actorType: 'admin', scopes: [] }
    );

    expect(onAudit).toHaveBeenCalledWith(expect.objectContaining({
      actorId: 'user1',
      method: 'tools/call',
      toolName: 'test.tool',
      status: 'success'
    }));
  });
});
