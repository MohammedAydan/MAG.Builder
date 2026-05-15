# NexPress Release Candidate

## Status

- Release: `1.0.0-rc.1`
- Classification: first stable release candidate, not GA
- Scope: platform foundation release covering CMS, builder, themes/templates, plugins, forms, membership, commerce test-mode boundaries, APIs, webhooks, MCP gateway boundaries, multi-site readiness, marketplace dry-run planning, security hardening, and deployment/runbook foundations

## What Phase 27 Validates

- Full repository quality gates pass from the repo root.
- Release and deployment docs match the current code and scripts.
- Public, admin, dashboard, API, auth, and multi-site sanity coverage is documented in a final smoke matrix.
- Known blockers and deferred integrations are called out explicitly instead of being implied away.

## Included Release Artifacts

- `docs/release/CHANGELOG.md`
- `docs/release/SMOKE_TEST_MATRIX.md`
- `docs/release/KNOWN_LIMITATIONS.md`
- `docs/release/GO_NO_GO_CHECKLIST.md`

## Performance and Accessibility Position

- Performance review for this release candidate is checklist-based and environment-dependent. Final Web Vitals evidence must be collected against the deployed target environment.
- Accessibility review for this release candidate is documented and must be executed against the staged UI before general availability. No claim of completed third-party accessibility certification is made.

## Recommendation

Proceed as a controlled release candidate only after the go/no-go checklist is signed off and the documented blockers are accepted for the target environment.
