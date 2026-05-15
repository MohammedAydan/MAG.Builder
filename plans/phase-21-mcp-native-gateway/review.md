# Phase 21 Review: MCP Native Gateway

## Implementation Summary

- **Packages Added**: Created `@nexpress/mcp-gateway` package to encapsulate MCP JSON-RPC routing, tool registry, and types, independent of the `apps/web` environment.
- **MCP Endpoint/Transport Added**: Added `apps/web/src/app/api/mcp/route.ts` as an HTTP POST endpoint for the MCP Gateway, validating JSON-RPC requests safely.
- **Tool Registry Added**: Instantiated `McpRegistry` and `McpHandler`.
- **Resource Registry / Prompt Registry**: Not added as they are not explicitly required by the Phase 21 MVP tasks (they are left for future phases or if requirements expand).
- **Auth/Scopes/Capability Model**: Implemented strict server-side authentication using Payload's `auth()` helper. Parsed `user` roles to construct secure scopes (e.g., `admin`, `platform:read`, `content:read`). Only authenticated users with matching scopes can execute tools.
- **Tool List Implemented**:
  - `platform.health.read`: Returns basic system health/version.
  - `content.published.list`: Returns a paginated list of published pages safely fetched via Payload's local API.
- **Dangerous Tools Explicitly Not Implemented**: Did not implement `shell.exec`, `filesystem.read/write`, database queries, eval, or arbitrary MCP fetch capabilities.
- **Audit**: Modified `AUDIT_ACTIONS` to include `system.mcp.tool_called` and added an `onAudit` listener to `McpHandler` to record executed tool actions, context, and error states directly into the `audit-logs` Payload collection.
- **Tests Added**: Unit tests added in `@nexpress/mcp-gateway` for registry tools insertion, scope filtering, handler execution, and audit hook calling.
- **Commands Run**: `pnpm install`, `pnpm --dir packages/mcp-gateway test`, `pnpm --dir apps/web typecheck`.

## Security Notes

- The MCP HTTP endpoint relies on server-side Session/Token headers using `payload.auth()`.
- Scope boundaries are rigidly enforced before any tool execution code runs.
- `onAudit` captures success/failure metrics but strips sensitive input.
- `overrideAccess: true` is used minimally and explicitly only where MCP Gateway already performed equivalent capability checks.
- Zero local process spawning, shell access, or raw filesystem dependencies included.

## Known Gaps

- The gateway currently relies purely on standard HTTP requests (not Server-Sent Events / streaming). This is sufficient for simple request-response JSON-RPC MCP implementation, but could be extended.
- Only a limited number of tools are implemented to prove the foundation.
- Full `resources` and `prompts` capabilities of the MCP specification are deferred until required by automation scenarios in Phase 22.
