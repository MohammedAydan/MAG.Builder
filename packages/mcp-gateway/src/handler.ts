import { z } from 'zod';
import type { JsonRpcResponse, McpContext } from './types';
import { JsonRpcRequestSchema, McpErrorCodes } from './types';
import { McpRegistry, defaultRegistry } from './registry';
import { zodToJsonSchema } from 'zod-to-json-schema';

export interface McpHandlerOptions {
  registry?: McpRegistry;
  onAudit?: (event: McpAuditEvent) => Promise<void>;
}

export interface McpAuditEvent {
  timestamp: string;
  actorId?: string | undefined;
  actorType?: string | undefined;
  method: string;
  toolName?: string | undefined;
  status: 'success' | 'error';
  errorCode?: number | undefined;
  errorMessage?: string | undefined;
}

export class McpHandler {
  private registry: McpRegistry;
  private onAudit?: ((event: McpAuditEvent) => Promise<void>) | undefined;

  constructor(options: McpHandlerOptions = {}) {
    this.registry = options.registry || defaultRegistry;
    this.onAudit = options.onAudit;
  }

  async handleRequest(body: unknown, context: McpContext): Promise<JsonRpcResponse> {
    const parsed = JsonRpcRequestSchema.safeParse(body);
    
    if (!parsed.success) {
      return this.buildErrorResponse(null, McpErrorCodes.InvalidRequest, 'Invalid Request');
    }

    const request = parsed.data;

    try {
      if (request.method === 'tools/list') {
        return await this.handleListTools(request, context);
      } else if (request.method === 'tools/call') {
        return await this.handleCallTool(request, context);
      } else {
        return this.buildErrorResponse(request.id ?? null, McpErrorCodes.MethodNotFound, 'Method not found');
      }
    } catch (error) {
      const isKnownError = error instanceof Error;
      const message = isKnownError ? error.message : 'Internal error';
      return this.buildErrorResponse(request.id ?? null, McpErrorCodes.InternalError, message);
    }
  }

  private async handleListTools(request: z.infer<typeof JsonRpcRequestSchema>, context: McpContext): Promise<JsonRpcResponse> {
    const tools = this.registry.getTools();
    
    // Filter tools based on user's scopes
    const availableTools = tools.filter(tool => this.registry.hasScope(context, tool.requiredScopes));

    const result = {
      tools: availableTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: zodToJsonSchema(tool.inputSchema as any),
      }))
    };

    await this.audit({
      timestamp: new Date().toISOString(),
      actorId: context.actorId,
      actorType: context.actorType,
      method: request.method,
      status: 'success',
    });

    return {
      jsonrpc: '2.0',
      id: request.id ?? null,
      result
    };
  }

  private async handleCallTool(request: z.infer<typeof JsonRpcRequestSchema>, context: McpContext): Promise<JsonRpcResponse> {
    const params = request.params as { name?: string; arguments?: Record<string, unknown> } | undefined;
    const toolName = params?.name;

    if (!toolName || typeof toolName !== 'string') {
      await this.audit({
        timestamp: new Date().toISOString(),
        actorId: context.actorId,
        actorType: context.actorType,
        method: request.method,
        status: 'error',
        errorCode: McpErrorCodes.InvalidParams,
        errorMessage: 'Missing tool name'
      });
      return this.buildErrorResponse(request.id ?? null, McpErrorCodes.InvalidParams, 'Missing tool name');
    }

    const tool = this.registry.getTool(toolName);

    if (!tool) {
      await this.audit({
        timestamp: new Date().toISOString(),
        actorId: context.actorId,
        actorType: context.actorType,
        method: request.method,
        toolName,
        status: 'error',
        errorCode: McpErrorCodes.MethodNotFound,
        errorMessage: 'Tool not found'
      });
      return this.buildErrorResponse(request.id ?? null, McpErrorCodes.MethodNotFound, 'Tool not found');
    }

    if (!this.registry.hasScope(context, tool.requiredScopes)) {
      await this.audit({
        timestamp: new Date().toISOString(),
        actorId: context.actorId,
        actorType: context.actorType,
        method: request.method,
        toolName,
        status: 'error',
        errorCode: McpErrorCodes.Forbidden,
        errorMessage: 'Forbidden: Missing required scopes'
      });
      return this.buildErrorResponse(request.id ?? null, McpErrorCodes.Forbidden, 'Forbidden: Missing required scopes');
    }

    const argsParsed = tool.inputSchema.safeParse(params?.arguments || {});
    
    if (!argsParsed.success) {
      await this.audit({
        timestamp: new Date().toISOString(),
        actorId: context.actorId,
        actorType: context.actorType,
        method: request.method,
        toolName,
        status: 'error',
        errorCode: McpErrorCodes.InvalidParams,
        errorMessage: 'Invalid tool arguments'
      });
      return this.buildErrorResponse(request.id ?? null, McpErrorCodes.InvalidParams, 'Invalid tool arguments');
    }

    try {
      const executionResult = await tool.execute(argsParsed.data, context);
      
      await this.audit({
        timestamp: new Date().toISOString(),
        actorId: context.actorId,
        actorType: context.actorType,
        method: request.method,
        toolName,
        status: 'success'
      });

      // Output should be a standard MCP result structure which usually has `content: [{type: 'text', text: '...'}]`
      // Or we just return executionResult if it's already formatted
      // Let's assume the tool returns the correct content array structure for `tools/call`.
      // Standard MCP tool call result:
      // { content: [ { type: "text", text: string } ], isError: boolean }
      
      return {
        jsonrpc: '2.0',
        id: request.id ?? null,
        result: executionResult
      };
    } catch (error) {
      const isKnownError = error instanceof Error;
      const message = isKnownError ? error.message : 'Tool execution error';
      
      await this.audit({
        timestamp: new Date().toISOString(),
        actorId: context.actorId,
        actorType: context.actorType,
        method: request.method,
        toolName,
        status: 'error',
        errorCode: McpErrorCodes.InternalError,
        errorMessage: message
      });
      
      // In MCP, tool errors can also be returned as a successful response with `isError: true`
      // to let the model know the tool failed, instead of throwing an RPC error.
      // But we will support both. Let's return isError format to follow MCP convention.
      return {
        jsonrpc: '2.0',
        id: request.id ?? null,
        result: {
          content: [
            {
              type: 'text',
              text: `Error executing tool: ${message}`
            }
          ],
          isError: true
        }
      };
    }
  }

  private buildErrorResponse(id: string | number | null, code: number, message: string): JsonRpcResponse {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message
      }
    };
  }

  private async audit(event: McpAuditEvent) {
    if (this.onAudit) {
      await this.onAudit(event).catch(() => {
        // Suppress audit logging errors to prevent breaking the flow
      });
    }
  }
}
