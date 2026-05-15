import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { McpTool, McpContext, JsonRpcRequest, JsonRpcResponse } from './types';
import { McpErrorCodes } from './types';

export class McpRegistry {
  private tools: Map<string, McpTool> = new Map();

  registerTool<TParams extends z.ZodType>(tool: McpTool<TParams>) {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool ${tool.name} is already registered.`);
    }
    this.tools.set(tool.name, tool as McpTool);
  }

  getTool(name: string): McpTool | undefined {
    return this.tools.get(name);
  }

  getTools(): McpTool[] {
    return Array.from(this.tools.values());
  }

  hasScope(context: McpContext, requiredScopes: string[]): boolean {
    if (requiredScopes.length === 0) return true;
    return requiredScopes.every((scope) => context.scopes.includes(scope));
  }
}

export const defaultRegistry = new McpRegistry();
