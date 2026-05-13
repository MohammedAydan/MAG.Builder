# Engineering Patterns

## Pattern: Bootstrap Quality Gates [feature: phase-00-greenfield-bootstrap]

- **Problem:** Early phases need CI-style verification before the real application toolchain exists.
- **Solution:** Provide root-level Node validators that assert structure and phase guardrails rather than pretending later-phase build systems already exist.
- **Example:** `tools/scripts/lint.mjs`, `tools/scripts/typecheck.mjs`, `tools/scripts/test.mjs`, `tools/scripts/build.mjs`
- **Gotchas:** Replace or extend these scripts once actual Next.js, TypeScript compilation, linting, and test tooling are introduced.
---
