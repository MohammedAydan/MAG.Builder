import { NextResponse } from 'next/server';
import { generateOpenApiDocument } from '@nexpress/api';

/**
 * GET /api/openapi.json
 *
 * Returns the static OpenAPI 3.1 document for the platform.
 */
export async function GET() {
  const doc = generateOpenApiDocument();
  return NextResponse.json(doc);
}
