# Phase 19 Review

## Files changed
- `packages/api/package.json`
- `packages/api/tsconfig.json`
- `packages/api/vitest.config.ts`
- `packages/api/src/responses.ts`
- `packages/api/src/rate-limit.ts`
- `packages/api/src/scopes.ts`
- `packages/api/src/openapi.ts`
- `packages/api/src/index.ts`
- `packages/api/src/*.test.ts`
- `apps/web/package.json`
- `apps/web/src/app/api/openapi.json/route.ts`

## Packages added
- `@nexpress/api`

## API platform modules added
- Typed success and error response helpers
- Rate limiter foundation
- API scopes definitions

## API conventions added
- Centralized response formats
- Typed scopes (`public:read`, `member:read`, etc)

## OpenAPI files/routes added
- `packages/api/src/openapi.ts` static document generator
- `apps/web/src/app/api/openapi.json/route.ts`

## OpenAPI version used
- 3.1.1

## API response/error helpers
- `successResponse`
- `errorResponse`

## Endpoints documented
- `/health`
- `/install`
- `/forms/{formId}/public`
- `/forms/{formId}/submit`
- `/members/me`
- `/commerce/products`
- `/commerce/products/{handle}`
- `/commerce/cart`
- `/plugins`
- `/templates`

## Security schemes/auth metadata
- Added `memberAuth`, `adminAuth`, and `apiKey` security schemes to OpenAPI

## Rate-limit/abuse-control changes
- Created standard rate-limit interface and a memory-based implementation in `@nexpress/api`. Left forms using its existing rate limit.

## Payload/content integration changes
- None

## Payload types/migrations status
- Unchanged

## Tests added
- 8 tests across 4 files in `@nexpress/api`.

## Commands run
- `pnpm install`
- `pnpm --dir packages/api test`
- `pnpm check`

## Security notes
- OpenAPI static document does not execute unsafe client-side code.
- Strong typing on response helpers prevents data leakage.

## Known gaps
- API Keys are only represented as types, not fully managed.
