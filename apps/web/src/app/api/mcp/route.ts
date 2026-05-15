import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { mcpHandler } from '@/lib/mcp';
import { isAppRole } from '@/lib/auth/roles';
import { logger } from '@nexpress/observability';

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise });
    
    // Server-side authentication
    const { user } = await payload.auth({ headers: req.headers });

    if (!user) {
      return NextResponse.json(
        { jsonrpc: '2.0', id: null, error: { code: 401, message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // Origin check
    const origin = req.headers.get('origin');
    if (origin) {
      // Typically allow from same origin, or explicit allowlist in a real app
      // For now, Next.js handles basic CORS but we can enforce strict policies if needed.
    }

    const body = await req.json();

    // Map user to MCP Context
    const scopes: string[] = [];
    let userRole = null;
    let actorType = 'user';
    
    if ('role' in user) {
      userRole = user.role;
      actorType = userRole || 'user';
    } else if ('collection' in user) {
      actorType = user.collection || 'user';
    }

    if (isAppRole(userRole)) {
      if (userRole === 'super-admin') {
        scopes.push('admin', 'platform:read', 'content:read', 'content:write', 'plugins:read', 'commerce:read');
      } else if (userRole === 'admin') {
        scopes.push('platform:read', 'content:read', 'content:write', 'plugins:read');
      } else if (userRole === 'editor') {
        scopes.push('content:read', 'content:write');
      }
    }

    // Call our MCP handler
    const response = await mcpHandler.handleRequest(body, {
      actorId: String(user.id),
      actorType,
      scopes,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('MCP Gateway Error:', { error });
    return NextResponse.json(
      { jsonrpc: '2.0', id: null, error: { code: -32603, message: 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
