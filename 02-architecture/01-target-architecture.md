# Target Architecture

NexPress is a modular platform with one public/admin Next.js app and multiple internal packages.

## Layers

1. **apps/web**: Next.js application, route handlers, admin/public shells.
2. **packages/cms**: Payload config, collections, CMS adapters.
3. **packages/builder-core**: safe page schema, renderer, block registry.
4. **packages/builder-editor**: Puck adapter and editor-only UI.
5. **packages/plugins**: plugin manifest loader, lifecycle, registry.
6. **packages/themes**: theme registry, tokens, layout contracts.
7. **packages/commerce**: commerce adapter and service boundary.
8. **packages/api-contracts**: OpenAPI documents and schema exports.
9. **packages/mcp-gateway**: AI automation tools and permission boundary.
10. **packages/security**: rate limits, headers, CSP, CSRF, scope checks.

## Runtime rule

Public rendering must be able to render without loading editor-only libraries.
