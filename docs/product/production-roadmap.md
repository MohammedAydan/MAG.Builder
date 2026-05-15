# Production Roadmap & Known Gaps

This document tracks the highest-signal gaps after the Phase 27 release candidate. It is not a promise that all items are in scope for the first stable release; it is a planning aid for what remains before broader GA hardening.

## 1. Release-Candidate Blockers Before Broader GA

- **No committed live database migration files for several late-phase schema additions:** migration generation still requires a live database and must be completed in a real deployment environment before a broad production rollout.
- **CSP remains staged instead of strict nonce-based:** the current posture is intentional for compatibility, but stricter enforcement is still pending.
- **Rate limiting is not distributed:** current protections are in-memory and need a shared adapter such as Redis for multi-instance production.
- **Audit writes are fail-open and non-transactional:** primary writes can succeed even if audit persistence fails.
- **Marketplace verification is planning-only:** dry-run planning exists, but external signature verification and key distribution do not.

## 2. Deployment and Operations Follow-up

- **Continuous deployment is not implemented:** CI validates the repo, but deployment orchestration remains manual.
- **Autoscaling policy is undocumented:** CPU, memory, and concurrency thresholds still need environment-specific definition.
- **Formal backup-and-restore rehearsal is still required per environment:** the runbooks exist, but each target environment must execute and record a restore drill.

## 3. Intentional v1 Constraints

- **Payments remain test-mode only:** real payment capture is deferred.
- **Shipping, taxes, coupons, inventory sync, and refunds remain deferred:** the commerce boundary exists without those integrations.
- **Marketplace execution remains disabled:** no remote fetch, package-manager execution, or runtime code loading is allowed.
- **MCP remains read-oriented and tightly bounded:** no raw shell, filesystem, SQL, or arbitrary HTTP tools are allowed.
- **Multi-site remains single-installation oriented:** site-aware filtering exists, but there is no SaaS control plane or tenant billing layer.

## 4. Quality and Assurance Follow-up

- **Automated browser E2E coverage is still minimal:** Phase 27 documents smoke coverage, but a fuller Playwright suite is still future work.
- **Performance budgets need environment-backed measurements:** this repo now records review criteria and smoke expectations, but final LCP/Web Vitals evidence belongs to the deployment environment.
- **Accessibility still needs full staged-environment scans:** current release-candidate guidance documents the checks, but automated and manual audits must be run against the deployed UI.
- **External security review remains outstanding:** a dedicated penetration test or independent security assessment has not been completed.
