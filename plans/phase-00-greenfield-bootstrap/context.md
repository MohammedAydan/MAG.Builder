# Phase 00 Context

## Files To Create / Modify

- Root workspace files: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.editorconfig`, `.gitignore`, `.env.example`
- Status files: `IMPLEMENTATION_STATUS.md`, `plans/*`
- Placeholder directories under `apps/`, `packages/`, `templates/`, `plugins/`, `tools/`, `docs/`
- Bootstrap validation scripts under `tools/scripts/`

## New Dependencies

- None in Phase 00 bootstrap

## Env Vars Needed

- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `REDIS_URL`
- optional S3 adapter variables

## Open Questions

- Final dependency versions will be locked during later implementation phases
- `apps/docs` remains deferred until a dedicated documentation-site phase
