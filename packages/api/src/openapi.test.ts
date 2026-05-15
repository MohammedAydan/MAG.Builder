import { describe, it, expect } from 'vitest';
import { generateOpenApiDocument } from './openapi';

describe('OpenAPI', () => {
  it('should generate a valid OpenAPI 3.1 document structure', () => {
    const doc = generateOpenApiDocument();
    
    expect(doc.openapi).toBe('3.1.1');
    expect(doc.info.title).toBe('NexPress API');
    expect(doc.paths).toBeDefined();
    expect(doc.paths['/health']).toBeDefined();
    expect(doc.components.securitySchemes).toBeDefined();
  });
});
