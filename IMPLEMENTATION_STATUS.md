# Implementation Status

Project: NexPress
Mode: Greenfield
Current phase: 31-builder-forms-media-v2
Overall status: completed

The platform foundation, Payload CMS foundation, database/migration/seed layer, install/runtime configuration foundation, identity/RBAC/audit foundation, admin dashboard shell, public design-system shell, CMS content/media/SEO foundation, builder kernel, visual editor adapter, themes/templates foundation, plugin/module system, forms/workflows foundation, public membership/protected-route foundation, the commerce service spike, the commerce MVP slice, storefront commerce builder blocks, the API platform with OpenAPI, webhooks/integrations foundation, MCP native gateway, the search/analytics/automation foundation, the multi-site/SaaS-readiness foundation, the marketplace/packaging/update-planning foundation, the security/observability hardening slice, the production deployment/docs slice, the final release-candidate validation slice, the Phase 28 RC fix pack/live DB validation slice, the Phase 29 production runtime services slice, the Phase 30 admin control center slice, and the Phase 31 builder v1.5/forms/media runtime v2 slice are implemented.

## Phase tracker

- [x] Phase 00 - Greenfield Bootstrap: done
- [x] Phase 01 - Product Lock and ADR: done
- [x] Phase 02 - Next.js Platform Foundation: done
- [x] Phase 03 - Payload CMS Foundation: done
- [x] Phase 04 - Database, Migrations, and Seed: done
- [x] Phase 05 - Install Wizard and Runtime Config: done
- [x] Phase 06 - Identity, RBAC, and Audit: done
- [x] Phase 07 - Admin Dashboard Shell: done
- [x] Phase 08 - Design System and Public Shell: done
- [x] Phase 09 - Content, Media, and SEO: done
- [x] Phase 10 - Builder Kernel: done
- [x] Phase 11 - Visual Editor Adapter: done
- [x] Phase 12 - Themes and Templates: done
- [x] Phase 13 - Plugin and Module System: done
- [x] Phase 14 - Forms and Workflows: done
- [x] Phase 15 - Public Membership and Protected Routes: done
- [x] Phase 16 - Commerce Service Spike: done
- [x] Phase 17 - Commerce MVP: done
- [x] Phase 18 - Storefront Commerce Blocks: done
- [x] Phase 19 - API Platform and OpenAPI: done
- [x] Phase 20 - Webhooks and Integrations: done
- [x] Phase 21 - MCP Native Gateway: done
- [x] Phase 22 - Search, Analytics, and Automation: done
- [x] Phase 23 - Multi-site and SaaS Readiness: done
- [x] Phase 24 - Marketplace, Packaging, and Updates: done
- [x] Phase 25 - Observability and Security Hardening: done
- [x] Phase 26 - Production Deployment and Docs: done
- [x] Phase 27 - Final Release Candidate: done
- [x] Phase 28 - RC Fix Pack and Live DB Validation: done
- [x] Phase 29 - Production Runtime Services: done
- [x] Phase 30 - Admin Control Center: done
- [x] Phase 31 - Builder v1.5, Forms, and Media Runtime v2: done

## Current session log

### Date

2026-05-15

### Agent/tool

Gemini CLI

### Requested phase

Phase 31 - Builder v1.5, Forms, and Media Runtime v2

### Files changed

**New files:**
- `packages/builder-core/src/blocks/utils.tsx`
- `packages/builder-core/src/blocks/content-blocks.tsx`
- `packages/builder-core/src/blocks/form-blocks.tsx`
- `packages/builder-core/src/blocks/commerce-blocks.tsx`
- `packages/builder-core/src/blocks/layout-blocks.tsx`
- `packages/builder-editor/src/config/utils.tsx`
- `packages/builder-editor/src/config/content.tsx`
- `packages/builder-editor/src/config/forms.tsx`
- `packages/builder-editor/src/config/commerce.tsx`
- `packages/builder-editor/src/config/layout.tsx`
- `apps/web/src/lib/forms/rendering.ts`
- `apps/web/src/components/forms/public-form.tsx`
- `apps/web/src/components/forms/public-form-client.tsx`

**Modified files:**
- `packages/builder-core/src/blocks/core-blocks.tsx`
- `packages/builder-editor/src/config.tsx`
- `packages/builder-editor/src/adapter.test.ts`
- `packages/builder-editor/src/config.test.tsx`
- `apps/web/src/lib/content/rendering.ts`
- `apps/web/src/lib/content/rendering.test.tsx`
- `apps/web/src/app/(app)/(public)/[slug]/page.tsx`
- `apps/web/src/app/(app)/dashboard/pages/[id]/preview/page.tsx`
- `apps/web/src/lib/audit/service.test.ts`
- `apps/web/tsconfig.json`
- `IMPLEMENTATION_STATUS.md`

### Commands run

- `pnpm lint` - passed
- `pnpm typecheck` - passed
- `pnpm test` - passed
- `pnpm build` - passed
- `pnpm --dir packages/builder-core test` - passed
- `pnpm --dir packages/builder-editor test` - passed
- `pnpm --dir apps/web test` - passed

### Runtime notes

- Large builder kernel and editor configuration files have been modularized by concern (content, layout, forms, commerce).
- A real form renderer has been implemented in `apps/web`, supporting secure server-side definition fetching and interactive client-side submission.
- Media relations are now resolved server-side for Image blocks, ensuring production-ready asset delivery without exposing private IDs to the client unnecessarily.
- Responsive layout controls (columns, alignment, gap, width, background) have been added to the Section block with strict tokenized validation.
- `apps/web` TS configuration updated to `react-jsx` to support Vitest parsing of JSX components in tests.

### Blockers

- None.

### Next recommended prompt

Phase 31 is complete. The next scoped prompt is Phase 32 Commerce Production Checkout.

