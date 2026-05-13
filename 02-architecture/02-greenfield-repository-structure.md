# Greenfield Repository Structure

The first implementation phase creates a pnpm workspace and apps/packages layout.

## Minimum root files

- `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.base.json`
- `.editorconfig`
- `.gitignore`
- `.env.example`
- `README.md`
- `IMPLEMENTATION_STATUS.md`
- all agent instruction files

## Workspace packages

Create package placeholders early, but implement internals phase-by-phase.

## Forbidden in Phase 00

Do not implement CMS, builder, commerce, MCP, or dashboard logic in Phase 00.
