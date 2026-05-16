# Unified Payload Admin Dashboard + Puck Builder Rebuild Plan

## 1. Executive Summary
- Objective: consolidate management UX into Payload Admin (`/admin`) and retire custom dashboard (`/dashboard`) after parity.
- Constraint: no blind rewrites; migrate by feature classification (Existing/Partial/Missing/Broken/Duplicated/Risk).
- Current repo already has substantial Payload collections, a working custom dashboard route tree, and existing builder-core/editor packages.
- This plan is discovery-locked and implementation-sequenced for low-risk migration.

## 2. Current Project Analysis
- Monorepo uses Turbo + pnpm workspaces: `package.json`, `pnpm-workspace.yaml`, `turbo.json`.
- Web app: `apps/web` with Payload 3 + Next 16 integration: `apps/web/src/payload.config.ts`.
- Payload admin route exists: `apps/web/src/app/(payload)/admin/[[...segments]]/*`.
- Custom dashboard route tree exists: `apps/web/src/app/(app)/dashboard/**`.
- Collections exist and are registered in config.
- Builder packages exist:
  - `packages/builder-core/src/*`
  - `packages/builder-editor/src/*`
- Public rendering path exists separately under content libs and route layer.

## 3. Existing vs Partial vs Missing Feature Audit
- Existing - Keep: Payload core collections, payload admin catch-all route, builder-core schema/validation/renderer baseline.
- Existing - Refactor: admin grouping labels, hidden-collection visibility strategy, builder entry points currently tied to dashboard routes.
- Existing - Move: `/dashboard` feature surfaces into Payload collections/globals/custom views.
- Partial - Complete: Payload custom views registry, admin home metrics, globals catalog, builder integration in Pages admin UI.
- Missing - Implement: explicit Payload globals, admin view components folder structure, redirect layer for old dashboard routes.
- Broken - Repair: N/A in this phase (requires runtime verification pass).
- Risk - Requires Manual Review: role mapping beyond existing permissions, tenant isolation edge paths, plugin/theme install boundaries.

## 4. Current Dashboard/Admin Duplication
- Duplicate management surfaces:
  - Payload admin: `apps/web/src/app/(payload)/admin/**`
  - Custom dashboard: `apps/web/src/app/(app)/dashboard/**`
- Duplicated concerns include analytics, automation, forms, integrations, marketplace, plugins, sites, templates/themes, search, settings, and page-builder entry.
- Migration target: keep Payload CRUD where possible; only keep custom views for workflows not represented by collection/global screens.

## 5. Target Architecture
- Single management center: `/admin` (Payload).
- `/dashboard` transitions to redirects only, then route removal.
- Payload-first architecture:
  - Collections for CRUD.
  - Globals for configuration.
  - Custom views/components for operational dashboards.
  - Access controls enforced in collection/global access + APIs.

## 6. Unified Payload Admin Information Architecture
- System & Marketplace: Users, Webhooks, Integrations, Search, Analytics, Audit Logs, Plugins.
- Platform: Sites, Memberships, Invitations, Themes/Templates managers.
- Commerce: Orders, Customers (+ future product stack if introduced).
- Forms & Automation: Forms, submissions, rules, executions.
- Content: Media, Pages, Posts, Redirects.
- System: installation state, runtime/system settings, health.
- Custom Views: Admin Home, Analytics Overview, Marketplace, Plugin Manager, Theme Manager, Template Manager, Builder, API/OpenAPI, MCP, Search Reindex, Health.

## 7. Payload Collections Plan
- Keep all currently registered collections in `apps/web/src/payload.config.ts`.
- Normalize `admin.group` and labels across:
  - `apps/web/src/collections/Users.ts`
  - `apps/web/src/collections/Members.ts`
  - `apps/web/src/collections/Sites.ts`
  - `apps/web/src/collections/SiteMemberships.ts`
  - `apps/web/src/collections/SiteInvitations.ts`
  - `apps/web/src/collections/Pages.ts`
  - `apps/web/src/collections/Posts.ts`
  - `apps/web/src/collections/Media.ts`
  - `apps/web/src/collections/Redirects.ts`
  - `apps/web/src/collections/Forms.ts`
  - `apps/web/src/collections/FormSubmissions.ts`
  - `apps/web/src/collections/AutomationRules.ts`
  - `apps/web/src/collections/AutomationExecutions.ts`
  - `apps/web/src/collections/CommerceOrders.ts`
  - `apps/web/src/collections/CommerceCustomers.ts`
  - `apps/web/src/collections/Integrations.ts`
  - `apps/web/src/collections/PluginStates.ts`
  - `apps/web/src/collections/WebhookSubscriptions.ts`
  - `apps/web/src/collections/WebhookDeliveries.ts`
  - `apps/web/src/collections/SearchIndex.ts`
  - `apps/web/src/collections/AnalyticsEvents.ts`
  - `apps/web/src/collections/AuditLogs.ts`
  - `apps/web/src/collections/InstallationState.ts`

## 8. Payload Globals Plan
- Add globals directory and initial globals only where needed:
  - `apps/web/src/globals/SystemSettings.ts`
  - `apps/web/src/globals/SiteSettings.ts`
  - `apps/web/src/globals/ThemeSettings.ts`
  - `apps/web/src/globals/SEOSettings.ts`
  - `apps/web/src/globals/BuilderSettings.ts`
- Wire globals in `apps/web/src/payload.config.ts` after access policies are finalized.

## 9. Payload Custom Views Plan
- Create admin view module tree:
  - `apps/web/src/admin/index.ts`
  - `apps/web/src/admin/views/HomeView.tsx`
  - `apps/web/src/admin/views/AnalyticsOverviewView.tsx`
  - `apps/web/src/admin/views/MarketplaceView.tsx`
  - `apps/web/src/admin/views/PluginManagerView.tsx`
  - `apps/web/src/admin/views/ThemeManagerView.tsx`
  - `apps/web/src/admin/views/TemplateManagerView.tsx`
  - `apps/web/src/admin/views/SearchReindexView.tsx`
  - `apps/web/src/admin/views/SystemHealthView.tsx`
  - `apps/web/src/admin/views/ApiCenterView.tsx`
  - `apps/web/src/admin/views/McpGatewayView.tsx`
  - `apps/web/src/admin/views/builder/PageBuilderView.tsx`
- Register custom views via Payload admin config.

## 10. Payload Custom Components Plan
- Introduce shared admin UI components:
  - `apps/web/src/admin/components/AdminCard.tsx`
  - `apps/web/src/admin/components/AdminMetricCard.tsx`
  - `apps/web/src/admin/components/OpenBuilderButton.tsx`
  - `apps/web/src/admin/components/ReindexButton.tsx`
  - `apps/web/src/admin/components/PluginStateButton.tsx`
  - `apps/web/src/admin/components/ThemeApplyButton.tsx`
  - `apps/web/src/admin/components/TemplateImportButton.tsx`

## 11. Roles, Permissions, and Access Control Plan
- Canonical auth modules:
  - `apps/web/src/lib/auth/access.ts`
  - `apps/web/src/lib/auth/permissions.ts`
  - `apps/web/src/lib/auth/roles.ts`
- Dashboard-specific guards to be deprecated after migration:
  - `apps/web/src/lib/dashboard/access.ts`
  - `apps/web/src/lib/dashboard/guards.ts`
  - `apps/web/src/lib/dashboard/navigation.ts`
  - `apps/web/src/lib/dashboard/session.ts`
- Map suggested roles to existing role model; do not invent runtime roles until mapping is proven.

## 12. Route Migration Plan
- Source route set: `apps/web/src/app/(app)/dashboard/**`.
- Target route set: Payload admin and custom views under `/admin`.
- Maintain temporary compatibility redirects using Next route handlers/middleware once each destination is live.
- Keep public routes under `apps/web/src/app/(app)/(public)/**` unchanged.

## 13. Builder Editor Rebuild Plan
- Existing builder dashboard entry:
  - `apps/web/src/app/(app)/dashboard/pages/[id]/builder/page.tsx`
  - `apps/web/src/app/(app)/dashboard/pages/[id]/builder/save/route.ts`
- Rebuild target is Payload-native view + action model:
  - `apps/web/src/admin/views/builder/*`
  - `apps/web/src/admin/components/OpenBuilderButton.tsx`
- Preserve editor features (draft/publish/preview/dirty state/permissions) while moving container.

## 14. Builder Core / Renderer / Layout Separation Plan
- Builder core ownership: `packages/builder-core/**`.
- Editor ownership: `packages/builder-editor/**`.
- Public rendering ownership: `apps/web/src/lib/content/rendering.ts`, `apps/web/src/lib/content/public.ts`, `packages/themes/**`.
- Rule: public routes must not import `packages/builder-editor` or Puck directly.

## 15. Puck Integration Plan
- Keep Puck isolated to `packages/builder-editor` and admin builder views.
- Add payload adapter layer for fetching/saving page builder docs with permission checks.
- Validate builder document before persistence; keep migration hooks for legacy format normalization.

## 16. Page Builder Feature Matrix
- Existing: builder-core schema/registry/renderer tests, dashboard builder route.
- Partial: payload integration UX, save/publish in admin context, validation surfacing.
- Missing: admin-native layers panel/SEO drawer/settings drawer parity verification, explicit audit hooks from admin builder actions.

## 17. Theme, Template, and Layout Plan
- Existing service modules retained:
  - `apps/web/src/lib/templates/service.ts`
  - `apps/web/src/lib/themes/*` (if present) and `packages/themes/**`
- Migrate dashboard theme/template screens to payload custom views while reusing service layer.

## 18. Content Management Plan
- Keep Payload CRUD-first for `Pages`, `Posts`, `Media`, `Redirects`.
- Add builder open action to `Pages` admin view.
- Preserve preview flow via tokenized public preview endpoints.

## 19. Commerce Admin Plan
- Use existing collections/services first:
  - `apps/web/src/collections/CommerceOrders.ts`
  - `apps/web/src/collections/CommerceCustomers.ts`
  - `apps/web/src/lib/commerce/**`
- Dashboard commerce routes map to payload collection views.

## 20. Forms and Automation Admin Plan
- Use existing forms/automation collections and services:
  - `apps/web/src/collections/Forms.ts`
  - `apps/web/src/collections/FormSubmissions.ts`
  - `apps/web/src/collections/AutomationRules.ts`
  - `apps/web/src/collections/AutomationExecutions.ts`
  - `apps/web/src/lib/forms/**`
  - `apps/web/src/lib/automation/**`
- Keep advanced controls as custom views only where needed.

## 21. System, Marketplace, Plugins, API, OpenAPI, MCP Plan
- Reuse service modules:
  - `apps/web/src/lib/plugins/service.ts`
  - `apps/web/src/lib/marketplace/service.ts`
  - `apps/web/src/lib/search/service.ts`
  - `apps/web/src/lib/analytics/service.ts`
  - `apps/web/src/lib/mcp.ts`
  - `packages/api/**`
- Move dashboard operational UIs into payload custom views.

## 22. Data Model and Migration Plan
- Builder model baseline should remain versioned JSON document with metadata.
- Confirm current Pages schema and existing persisted shape before structural changes:
  - `apps/web/src/collections/Pages.ts`
  - `packages/builder-core/src/types.ts`
  - `packages/builder-core/src/migrations.ts`
- Add migration tests before any shape rewrite.

## 23. File-by-File Task List
- [ ] `apps/web/src/payload.config.ts` — Existing - Refactor (admin views/globals/groups wiring).
- [ ] `apps/web/src/payload-types.ts` — Existing - Regenerate after schema changes.
- [ ] `apps/web/src/app/(app)/dashboard/**` — Existing - Delete after migration (with redirects).
- [ ] `apps/web/src/app/(payload)/admin/**` — Existing - Keep/extend for custom views.
- [ ] `apps/web/src/lib/dashboard/**` — Existing - Delete after migration unless shared utilities remain.
- [ ] `apps/web/src/lib/builder/editor.ts` — Existing - Refactor into payload integration path.
- [ ] `apps/web/src/lib/builder/kernel.ts` — Existing - Keep or refactor for neutral service layer.
- [ ] `apps/web/src/lib/content/rendering.ts` — Existing - Keep; enforce no editor imports.
- [ ] `apps/web/src/lib/content/public.ts` — Existing - Keep; enforce published-only reads.
- [ ] `packages/builder-core/**` — Existing - Keep/Refactor for stricter contracts.
- [ ] `packages/builder-editor/**` — Existing - Refactor editor-only boundaries.
- [ ] `apps/web/e2e/auth.spec.ts` — Partial - Update for `/admin` flows.
- [ ] `apps/web/e2e/builder.spec.ts` — Partial - Update builder-entry flow via payload.
- [ ] `apps/web/e2e/smoke.spec.ts` — Partial - Update dashboard redirect assertions.

## 24. Implementation Phases
1. Discovery lock + plan update.
2. Payload IA/grouping changes.
3. Globals creation.
4. Custom view scaffolding.
5. Simple route migration to native collection/global screens.
6. Complex route migration to custom views.
7. Builder integration migration.
8. Redirect rollout.
9. Dashboard deletion.
10. Test hardening and cleanup.

## 25. Testing and Validation Plan
- Repo checks:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`
- Web focused:
  - `pnpm --filter @nexpress/web test`
  - `pnpm --filter @nexpress/web exec playwright test`
- Add/adjust tests for admin access, sidebar grouping, builder open/save/publish, and `/dashboard` redirects.

## 26. Security and Multi-Tenant Isolation Plan
- Maintain strict server-side authorization in access functions and handlers.
- Validate tenant scoping for site-bound content and admin operations.
- Keep secrets server-only; no client bundle leaks.
- Enforce draft content protection and secure preview token mechanics.

## 27. Performance and Bundle Strategy
- Restrict editor/Puck code to admin builder routes.
- Use dynamic imports for heavy admin views.
- Keep public rendering minimal and cache-aware.
- Avoid unbounded collection queries in custom views.

## 28. Risks and Warnings
- Risk: hidden coupling between dashboard components and service modules.
- Risk: role mapping mismatch between desired and implemented permissions.
- Risk: legacy builder document variants in persisted data.
- Warning: deleting dashboard prematurely can break operational workflows.

## 29. Final Acceptance Criteria
- `/admin` is sole management UI.
- `/dashboard` no longer acts as independent dashboard.
- Collection/global/custom-view parity reached.
- Builder works in Payload admin with draft/publish/preview.
- Public renderer remains editor-free.
- Security checks and tenant isolation preserved.
- CI checks pass and no dead dashboard dependencies remain.

## 30. Next-Agent Handoff Checklist
- Verify plan assumptions against full file inspection backlog.
- Implement phase 2 (collection grouping + admin view registry) first.
- Keep changelog of route mapping status per old dashboard path.
- Run typecheck/tests after each migration slice.
- Defer destructive deletions until redirect + parity verification are complete.


## Appendix A: Legacy `/dashboard` Route-to-Target Map
- `apps/web/src/app/(app)/dashboard/page.tsx` -> `/admin` custom Home view.
- `apps/web/src/app/(app)/dashboard/analytics/page.tsx` -> `/admin` custom Analytics overview.
- `apps/web/src/app/(app)/dashboard/automation/page.tsx` -> `/admin/collections/automation-rules` (+ optional automation overview view).
- `apps/web/src/app/(app)/dashboard/commerce/orders/page.tsx` -> `/admin/collections/commerce-orders`.
- `apps/web/src/app/(app)/dashboard/commerce/customers/page.tsx` -> `/admin/collections/commerce-customers`.
- `apps/web/src/app/(app)/dashboard/forms/page.tsx` -> `/admin/collections/forms`.
- `apps/web/src/app/(app)/dashboard/forms/[id]/submissions/page.tsx` -> `/admin/collections/form-submissions` with filter.
- `apps/web/src/app/(app)/dashboard/integrations/page.tsx` -> `/admin/collections/integrations`.
- `apps/web/src/app/(app)/dashboard/marketplace/page.tsx` -> `/admin` custom Marketplace view.
- `apps/web/src/app/(app)/dashboard/marketplace/[packageId]/page.tsx` -> `/admin` custom Marketplace package detail.
- `apps/web/src/app/(app)/dashboard/pages/page.tsx` -> `/admin/collections/pages`.
- `apps/web/src/app/(app)/dashboard/pages/[id]/builder/page.tsx` -> `/admin` custom PageBuilder view.
- `apps/web/src/app/(app)/dashboard/pages/[id]/preview/page.tsx` -> keep public preview endpoint route.
- `apps/web/src/app/(app)/dashboard/plugins/page.tsx` -> `/admin/collections/plugin-states` + custom manager.
- `apps/web/src/app/(app)/dashboard/plugins/[pluginId]/page.tsx` -> `/admin` custom plugin detail view.
- `apps/web/src/app/(app)/dashboard/plugins/[pluginId]/migrations/page.tsx` -> `/admin` custom plugin migrations view.
- `apps/web/src/app/(app)/dashboard/search/page.tsx` -> `/admin` custom Search/Reindex view.
- `apps/web/src/app/(app)/dashboard/settings/page.tsx` -> Payload globals (`SystemSettings`, `SiteSettings`, `ThemeSettings`, `SEOSettings`).
- `apps/web/src/app/(app)/dashboard/sites/page.tsx` -> `/admin/collections/sites`.
- `apps/web/src/app/(app)/dashboard/sites/[id]/page.tsx` -> `/admin/collections/sites/:id`.
- `apps/web/src/app/(app)/dashboard/sites/[id]/domains/page.tsx` -> site settings/global or domains collection (if introduced).
- `apps/web/src/app/(app)/dashboard/sites/[id]/members/page.tsx` -> `/admin/collections/site-memberships` with filter.
- `apps/web/src/app/(app)/dashboard/sites/[id]/settings/page.tsx` -> `/admin/collections/sites/:id` and/or `SiteSettings` global.
- `apps/web/src/app/(app)/dashboard/templates/page.tsx` -> `/admin` custom Template manager view.
- `apps/web/src/app/(app)/dashboard/themes/page.tsx` -> `/admin` custom Theme manager view.
- `apps/web/src/app/(app)/dashboard/webhooks/page.tsx` -> `/admin/collections/webhook-subscriptions` + `/admin/collections/webhook-deliveries`.

## Appendix B: Phase-2 Immediate File Ownership
- `apps/web/src/payload.config.ts`
  - Status: Existing - Refactor
  - Action: wire admin groups/custom views/globals registrations.
- `apps/web/src/collections/*.ts`
  - Status: Existing - Refactor
  - Action: normalize `admin.group`, labels, and strategic hidden/exposed flags.
- `apps/web/src/admin/**`
  - Status: Missing - Implement
  - Action: create custom view/component shell modules.
- `apps/web/src/globals/**`
  - Status: Missing - Implement
  - Action: add minimal settings globals with strict access.
