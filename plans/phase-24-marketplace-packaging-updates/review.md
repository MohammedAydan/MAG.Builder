# Phase 24 Review - Marketplace, Packaging, and Updates

## Status: COMPLETE

Implemented: 2026-05-15
Agent: Codex

## Summary

Phase 24 adds the first safe marketplace, packaging, and update-planning foundation for NexPress. The implementation introduces a new `@nexpress/marketplace` workspace package with typed local package manifests, a local allowlisted catalog, compatibility and integrity validation, and dry-run install/update/enable/disable planning. `apps/web` now exposes admin-only package listing and dry-run planning endpoints with audit coverage. The phase stays within scope: no remote package fetch, no package-manager execution, no runtime code loading, no auto-update execution, and no Phase 25 work.

## Files changed

### New files

- `packages/marketplace/*`
- `apps/web/src/lib/marketplace/{service,service.test}.ts`
- `apps/web/src/app/api/marketplace/packages/route.ts`
- `apps/web/src/app/api/marketplace/plans/route.ts`
- `docs/runbooks/marketplace-packaging-updates.md`
- `plans/phase-24-marketplace-packaging-updates/review.md`

### Modified files

- `apps/web/package.json`
- `apps/web/src/lib/audit/service.ts`
- `apps/web/src/lib/auth/permissions.ts`
- `packages/api/src/openapi.ts`
- `IMPLEMENTATION_STATUS.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`
- `pnpm-lock.yaml`

## Packages added

- `@nexpress/marketplace`

## Marketplace/package module added

- New workspace package: `packages/marketplace`
- Exposes typed package manifests, catalog helpers, compatibility checks, integrity assessment, and dry-run planning

## Package manifest schema

- Schema: `nexpress-package-manifest`
- Manifest version: `1`
- Allowlisted package types:
  - `plugin`
  - `theme`
  - `template`
  - `integration`
- Rejects:
  - scripts
  - shell commands
  - remote URLs
  - unsafe HTML/script markers
  - secrets and protected config keys

## Registry/catalog foundation

- Local-only allowlisted catalog in `packages/marketplace/src/local-catalog.ts`
- Catalog entries are type-prefixed and versioned
- Initial catalog includes plugin, theme, and template package metadata
- No remote registry fetch or runtime installation path exists

## Update channel/plan foundation

- Allowlisted channels:
  - `stable`
  - `beta`
  - `dev`
- Dry-run planner supports:
  - `install`
  - `update`
  - `enable`
  - `disable`
- `POST /api/marketplace/plans` returns plans only and does not execute them

## Compatibility checks

- platform version range
- package type allowlist
- capability allowlist
- dependency presence and version ranges
- forward and reverse conflicts

## Integrity/provenance metadata

- checksum algorithms validated: `sha256`, `sha384`, `sha512`
- signature metadata supported: `catalog-attestation`, `cosign`, `minisign`
- signature status must be verified for install-ready plans
- provenance placeholders supported: `builderId`, `buildType`, `sourceRepository`
- SBOM metadata supported: `spdx-json`, `cyclonedx-json`

## API/OpenAPI changes

- Added admin-only endpoints:
  - `GET /api/marketplace/packages`
  - `POST /api/marketplace/plans`
- Updated OpenAPI documentation in `packages/api/src/openapi.ts`

## MCP changes

None. MCP remains unchanged in Phase 24.

## Payload collections added/changed

None.

## Payload types/migrations status

- No Payload collections changed
- No Payload type regeneration was required
- No live database migration file was required

## Tests added

- `packages/marketplace/src/manifest.test.ts`
- `packages/marketplace/src/planner.test.ts`
- `apps/web/src/lib/marketplace/service.test.ts`

## Commands run

- `pnpm.cmd install`
- `pnpm.cmd --dir packages/marketplace lint`
- `pnpm.cmd --dir packages/marketplace typecheck`
- `pnpm.cmd --dir packages/marketplace test`
- `pnpm.cmd --dir packages/marketplace build`
- `pnpm.cmd lint`
- `pnpm.cmd typecheck`
- `pnpm.cmd test`
- `pnpm.cmd build`
- `pnpm.cmd --dir packages/commerce lint`
- `pnpm.cmd --dir packages/commerce typecheck`
- `pnpm.cmd --dir packages/commerce test`
- `pnpm.cmd --dir packages/commerce build`
- `pnpm.cmd --dir packages/forms lint`
- `pnpm.cmd --dir packages/forms typecheck`
- `pnpm.cmd --dir packages/forms test`
- `pnpm.cmd --dir packages/forms build`
- `pnpm.cmd --dir packages/plugins lint`
- `pnpm.cmd --dir packages/plugins typecheck`
- `pnpm.cmd --dir packages/plugins test`
- `pnpm.cmd --dir packages/plugins build`
- `pnpm.cmd --dir packages/builder-core lint`
- `pnpm.cmd --dir packages/builder-core typecheck`
- `pnpm.cmd --dir packages/builder-core test`
- `pnpm.cmd --dir packages/builder-core build`
- `pnpm.cmd --dir packages/builder-editor lint`
- `pnpm.cmd --dir packages/builder-editor typecheck`
- `pnpm.cmd --dir packages/builder-editor test`
- `pnpm.cmd --dir packages/builder-editor build`
- `pnpm.cmd --dir packages/themes lint`
- `pnpm.cmd --dir packages/themes typecheck`
- `pnpm.cmd --dir packages/themes test`
- `pnpm.cmd --dir packages/themes build`
- `pnpm.cmd --dir packages/api lint`
- `pnpm.cmd --dir packages/api typecheck`
- `pnpm.cmd --dir packages/api test`
- `pnpm.cmd --dir packages/api build`
- `pnpm.cmd --dir packages/webhooks lint`
- `pnpm.cmd --dir packages/webhooks typecheck`
- `pnpm.cmd --dir packages/webhooks test`
- `pnpm.cmd --dir packages/webhooks build`
- `pnpm.cmd --dir packages/mcp-gateway lint`
- `pnpm.cmd --dir packages/mcp-gateway typecheck`
- `pnpm.cmd --dir packages/mcp-gateway test`
- `pnpm.cmd --dir packages/mcp-gateway build`
- `pnpm.cmd --dir packages/search lint`
- `pnpm.cmd --dir packages/search typecheck`
- `pnpm.cmd --dir packages/search test`
- `pnpm.cmd --dir packages/search build`
- `pnpm.cmd --dir packages/analytics lint`
- `pnpm.cmd --dir packages/analytics typecheck`
- `pnpm.cmd --dir packages/analytics test`
- `pnpm.cmd --dir packages/analytics build`
- `pnpm.cmd --dir packages/automation lint`
- `pnpm.cmd --dir packages/automation typecheck`
- `pnpm.cmd --dir packages/automation test`
- `pnpm.cmd --dir packages/automation build`
- `pnpm.cmd --dir apps/web lint`
- `pnpm.cmd --dir apps/web typecheck`
- `pnpm.cmd --dir apps/web test`
- `pnpm.cmd --dir apps/web build`

## Security notes

- manifests are treated as untrusted input and validated before planning
- only the local allowlisted registry is accepted
- dry-run plans never execute code or run package-manager commands
- package install readiness fails closed on invalid integrity or compatibility metadata
- admin-only routes do not expose secrets, install scripts, or remote package sources

## Known gaps

- no cryptographic key distribution or external signature verification flow yet
- provenance and SBOM checks validate metadata presence, not artifact contents
- no package execution or activation is performed from marketplace flows
- no dedicated dashboard marketplace UI was added

## Recommendation

- [x] Approve
- [ ] Request changes
