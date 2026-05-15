import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const JsonRpcRequestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number()]).optional(),
  method: z.string(),
  params: z.record(z.string(), z.unknown()).optional(),
});

export type JsonRpcRequest = z.infer<typeof JsonRpcRequestSchema>;

export const JsonRpcResponseSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number()]).nullable(),
  result: z.unknown().optional(),
  error: z.object({
    code: z.number(),
    message: z.string(),
    data: z.unknown().optional(),
  }).optional(),
});

export type JsonRpcResponse = z.infer<typeof JsonRpcResponseSchema>;

export interface McpContext {
  actorId?: string;
  actorType?: string;
  scopes: string[];
}

export interface McpTool<TParams extends z.ZodType = z.ZodType> {
  name: string;
  description: string;
  inputSchema: TParams;
  requiredScopes: string[];
  execute: (params: z.infer<TParams>, context: McpContext) => Promise<unknown>;
}

// MCP Standard JSON-RPC Error Codes
export const McpErrorCodes = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
  Unauthorized: 401,
  Forbidden: 403,
};
