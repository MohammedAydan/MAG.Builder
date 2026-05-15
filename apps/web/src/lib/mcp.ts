import { McpRegistry, McpHandler } from '@nexpress/mcp-gateway';
import type { AppRole } from '@/lib/auth/roles';
import { z } from 'zod';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { writeAuditEntry } from '@/lib/audit/service';

export const mcpRegistry = new McpRegistry();

// Tool: platform.health.read
mcpRegistry.registerTool({
  name: 'platform.health.read',
  description: 'Read the platform health status',
  inputSchema: z.object({}),
  requiredScopes: ['platform:read'],
  execute: async () => {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ status: 'ok', version: '0.1.0' })
        }
      ]
    };
  }
});

// Tool: content.published.list
mcpRegistry.registerTool({
  name: 'content.published.list',
  description: 'List published pages',
  inputSchema: z.object({
    limit: z.number().optional().default(10),
  }),
  requiredScopes: ['content:read'],
  execute: async ({ limit }) => {
    const payload = await getPayload({ config: configPromise });
    
    // overrideAccess: false to ensure we only get what we're allowed to see
    // wait, actually in MCP we are server-side, but let's be safe.
    const pages = await payload.find({
      collection: 'pages',
      where: {
        _status: { equals: 'published' }
      },
      limit,
      overrideAccess: true, // we already verify MCP scope before execution
      depth: 0,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            total: pages.totalDocs,
            pages: pages.docs.map(doc => ({ id: doc.id, title: doc.title, slug: doc.slug }))
          }, null, 2)
        }
      ]
    };
  }
});

export const mcpHandler = new McpHandler({
  registry: mcpRegistry,
  onAudit: async (event) => {
    const payload = await getPayload({ config: configPromise });
    await writeAuditEntry(payload, {
      action: 'system.mcp.tool_called',
      actor: event.actorId ? { userId: event.actorId, source: 'user', role: event.actorType as AppRole | null } : { source: 'system' },
      result: event.status === 'success' ? 'success' : 'failure',
      metadata: {
        method: event.method,
        toolName: event.toolName,
        errorCode: event.errorCode,
        errorMessage: event.errorMessage,
      }
    });
  }
});
