# Unified Payload Admin + Puck Builder Rebuild Plan

## 1. Executive Summary
- Current state has two management surfaces: custom Next.js dashboard at `/dashboard` and Payload admin at `/admin`.
- Target state is a single management surface: Payload Admin at `/admin`.
- Existing `/dashboard` features should be migrated into Payload Collections, Globals, Custom Views, and Custom Components.
- Builder stack already uses `@measured/puck` (`packages/builder-editor`) and `@nexpress/builder-core`; migration focus is integration into Payload Admin and strict boundary enforcement.
- This plan is repository-specific and maps exact file paths, phases, risks, and acceptance criteria.

## 2. Current Project Analysis
### Admin + Payload
- Payload admin route already exists and is active:
  - `apps/web/src/app/(payload)/admin/[[...segments]]/page.tsx`
  - `apps/web/src/app/(payload)/admin/[[...segments]]/not-found.tsx`
  - `apps/web/src/payload.config.ts` (admin configured with default `RootPage` + import map).
- `apps/web/src/payload.config.ts` currently has:
  - No `globals` configured.
  - No custom `admin.components`/`admin.views` customization.
  - Collections-only admin model.

### Collections currently present
- Core platform/content/system collections exist in `apps/web/src/collections/*`:
  - Users, Members, Sites, SiteMemberships, SiteInvitations
  - InstallationState, AuditLogs, PluginStates
  - CommerceCustomers, CommerceOrders
  - Forms, FormSubmissions
  - Media, Pages, Posts, Redirects
  - WebhookSubscriptions, WebhookDeliveries, Integrations
  - SearchIndex, AnalyticsEvents, AutomationRules, AutomationExecutions
- Missing or partial areas:
  - Missing / Needs Implementation: Menus/Navigation collection(s).
  - Missing / Needs Implementation: Products, Product Categories, Coupons, Payments, Shipping, Tax collections.
  - Missing / Needs Implementation: Payload Globals for System/Theme/SEO/Runtime settings.
  - Hidden collections that likely need admin exposure strategy: `AuditLogs`, `InstallationState`, `PluginStates`, `CommerceCustomers`, `AutomationExecutions`, `Members`.

### Access/RBAC
- Centralized permission checks in `apps/web/src/lib/auth/access.ts`.
- Existing permission coverage includes admin/content/forms/commerce/search/analytics/automation/plugins/sites/webhooks/integrations.
- Multi-site scope helpers are used (for published content/read paths and site-scoped queries).

### Dashboard app (`/dashboard`)
- Full custom dashboard shell exists under `apps/web/src/app/(app)/dashboard/**` with own layout/nav/guards.
- This is duplication relative to Payload admin.

### Builder
- Builder core:
  - `packages/builder-core/src/*` includes schema/validation/registry/migrations/renderer.
- Editor adapter:
  - `packages/builder-editor/src/*` uses `@measured/puck`, has autosave, custom config categories/components.
- App integration:
  - Dashboard builder routes in `apps/web/src/app/(app)/dashboard/pages/[id]/builder/**`.
  - Save endpoint is dashboard route `.../builder/save/route.ts`.
- Public rendering:
  - `apps/web/src/lib/content/rendering.ts` validates and renders builder documents via `builder-core`; does not import editor code.
- Coupling gap:
  - Editor entry and save flow are tied to `/dashboard` routes and dashboard auth guards instead of Payload custom view/action flow.

### Themes/Templates/Marketplace/Plugins/API/MCP
- Themes + template manifests: `packages/themes/src/*`.
- Template service + import/export/apply flows: `apps/web/src/lib/templates/service.ts`, API routes under `/api/templates/*` and `/api/themes/apply`.
- Plugins + plugin migrations: `apps/web/src/lib/plugins/service.ts`, API routes under `/api/plugins/*`.
- Marketplace planning: `apps/web/src/lib/marketplace/service.ts`, `/api/marketplace/*`.
- OpenAPI: `packages/api/src/openapi.ts`, served by `/api/openapi.json`.
- MCP gateway: `apps/web/src/lib/mcp.ts`, `/api/mcp`.

### Tests
- E2E currently dashboard-centric in `apps/web/e2e/*` (`/dashboard` expectations).
- Unit/integration coverage exists for builder-core/editor, forms, commerce, auth/access, templates, marketplace, plugins, health/install.

## 3. Current Dashboard/Admin Duplication
- `/dashboard` currently hosts custom pages for analytics/search/sites/forms/automation/integrations/webhooks/plugins/marketplace/themes/templates/builder.
- `/admin` hosts Payload-native collection CRUD only.
- This split causes:
  - Duplicate navigation and auth layers.
  - Duplicate management UX.
  - Builder editor and operational views outside Payload admin.

## 4. Target Architecture
- **Single admin route**: `/admin` (Payload Admin) as only management surface.
- `/dashboard` becomes redirect/deprecation layer only.
- Payload Admin becomes control center via:
  - Collection list/edit views
  - Globals
  - Custom Views
  - Custom Components
  - Admin grouping and visibility rules.
- Builder architecture target:
  - `packages/builder-core`: schema/registry/validation/migrations/renderer contracts.
  - `packages/builder-editor`: Puck editor adapter only.
  - `apps/web/src/admin/views/builder/*`: Payload admin integration shell/actions.
  - `apps/web/src/lib/content/*`: public rendering only.
  - `packages/themes/*`: layout/theme/template systems.

## 5. Unified Payload Admin Information Architecture
### System & Marketplace
- Users (`users`)
- Webhook Subscriptions (`webhook-subscriptions`)
- Webhook Deliveries (`webhook-deliveries`)
- Integrations (`integrations`)
- Search Index (`search-index`)
- Analytics Events (`analytics-events`)
- Plugin States (`plugin-states`) [currently hidden; expose through custom views]

### Platform
- Sites (`sites`)
- Site Memberships (`site-memberships`)
- Site Invitations (`site-invitations`)
- Themes (custom view backed by `packages/themes` + site settings)

### Commerce
- Commerce Orders (`commerce-orders`)
- Commerce Customers (`commerce-customers`) [hidden now]
- Products — Missing / Needs Implementation
- Product Categories — Missing / Needs Implementation
- Coupons — Missing / Needs Implementation
- Payments settings — Missing / Needs Implementation
- Shipping settings — Missing / Needs Implementation
- Tax settings — Missing / Needs Implementation

### Forms & Automation
- Forms (`forms`)
- Form Submissions (`form-submissions`)
- Automation Rules (`automation-rules`)
- Automation Executions (`automation-executions`) [hidden now]

### Content
- Media (`media`)
- Pages (`pages`)
- Posts (`posts`)
- Redirects (`redirects`)
- Menus/Navigation — Missing / Needs Implementation
- SEO uses fields on pages/posts; global SEO settings missing.

### System
- Settings Globals — Missing / Needs Implementation
- Audit Logs (`audit-logs`) [hidden now]
- Installation State (`installation-state`) [hidden now]
- Runtime Config global/view — Missing / Needs Implementation
- Health/Readiness custom view

### Custom Views
- Admin Home
- Analytics Overview
- Marketplace Center
- Builder Editor
- Theme Manager
- Template Manager
- Plugin Manager
- API/OpenAPI Center
- MCP Gateway Center
- System Health

## 6. Payload Collections Plan
- Keep and regroup existing collections by IA above.
- Add admin labels/grouping consistency across all existing collections.
- Unhide/selectively expose currently hidden collections via:
  - direct admin visibility where safe, or
  - custom views wrapping restricted operations.
- Add missing collections (phased):
  - `products`, `product-categories`, `coupons`, `payment-settings`, `shipping-settings`, `tax-settings`, `menus`/`navigation`.
- `pages` collection enhancement plan:
  - Keep `builder` JSON field.
  - Add explicit builder metadata fields (`builderVersion`, optional `publishedBuilderData`) if needed for publish pipeline/audit.
  - Add admin custom action/button to open Builder view in Payload Admin.

## 7. Payload Globals Plan
Create `apps/web/src/globals/*` and wire in `apps/web/src/payload.config.ts`:
- `SystemSettings` global (runtime toggles, operational flags without secrets)
- `ThemeSettings` global (default theme behavior)
- `SEOSettings` global (sitewide SEO defaults)
- `RuntimeSettings` global (safe runtime controls)
- Optional `NavigationSettings` global if collection-based menus are deferred.

## 8. Payload Custom Views Plan
Create `apps/web/src/admin/views/*` for non-CRUD dashboards:
- `AdminHomeView`
- `AnalyticsOverviewView`
- `MarketplaceView`
- `PluginsView`
- `ThemeManagerView`
- `TemplateManagerView`
- `SearchOperationsView`
- `SystemHealthView`
- `ApiOpenApiCenterView`
- `McpGatewayCenterView`
- `PageBuilderView` (entry via pages collection/action)

## 9. Payload Custom Components Plan
Create reusable components in `apps/web/src/admin/components/*`:
- Cards and summary widgets (analytics, health, queue status)
- Builder launch button for pages
- Reindex/search actions
- Theme apply controls
- Plugin activation/migration controls
- Template import/export controls
- Permission-aware wrappers (hide/disable by role/permission)

## 10. Roles, Permissions, and Access Control Plan
- Keep `apps/web/src/lib/auth/access.ts` as source of permission checks.
- Enforce access only server-side in:
  - Payload access controls
  - route handlers
  - server actions.
- Add Payload-admin view-level gating using existing permissions:
  - `admin:access`, `content:*`, `plugins:*`, `marketplace:*`, `analytics:*`, `automation:*`, `sites:*`, `system:*`.
- Ensure members never gain admin access.
- Ensure per-site scopes remain enforced for non-global actors.

## 11. Route Migration Plan
- Final admin route: `/admin`.
- `/dashboard` strategy:
  - Phase transition: temporary redirects from dashboard pages to equivalent `/admin` collection/custom views.
  - End state: global redirect `/dashboard/:path* -> /admin` and remove dashboard code.

Dashboard route classification:
- `apps/web/src/app/(app)/dashboard/layout.tsx` → Delete after migration; replace with Payload admin shell.
- `apps/web/src/app/(app)/dashboard/page.tsx` → Migrate to Payload Admin Home custom view.
- `.../dashboard/pages/page.tsx` → Migrate to Pages collection + Builder action.
- `.../dashboard/pages/[id]/builder/page.tsx` → Migrate to Payload Builder custom view.
- `.../dashboard/pages/[id]/builder/save/route.ts` → Migrate to admin API/server action under Payload-integrated path.
- `.../dashboard/pages/[id]/preview/page.tsx` → Migrate to builder custom view preview panel or draft-preview endpoint.
- `.../dashboard/forms/page.tsx` → Migrate to Forms collection list; submissions link via collection/custom view.
- `.../dashboard/forms/[id]/submissions/page.tsx` → Migrate to Form Submissions custom view/filter preset.
- `.../dashboard/commerce/orders/page.tsx` → Migrate to Commerce Orders collection/custom view.
- `.../dashboard/commerce/customers/page.tsx` → Migrate to Commerce Customers collection/custom view.
- `.../dashboard/sites/page.tsx` → Migrate to Sites collection.
- `.../dashboard/sites/[id]/page.tsx` → Migrate to Site detail custom view or collection edit.
- `.../dashboard/sites/[id]/domains/page.tsx` → Migrate to Sites edit/custom component.
- `.../dashboard/sites/[id]/members/page.tsx` → Migrate to SiteMemberships/SiteInvitations collection views.
- `.../dashboard/sites/[id]/settings/page.tsx` → Migrate to Sites edit + Globals/custom view.
- `.../dashboard/settings/page.tsx` → Migrate to System Settings globals/custom views.
- `.../dashboard/search/page.tsx` + actions/button → Migrate to Search custom view.
- `.../dashboard/analytics/page.tsx` → Migrate to Analytics custom view.
- `.../dashboard/automation/*` → Migrate to Automation rules/executions collection + custom controls.
- `.../dashboard/integrations/page.tsx` → Migrate to Integrations collection.
- `.../dashboard/webhooks/page.tsx` → Migrate to Webhook collections + custom delivery view.
- `.../dashboard/plugins/*` → Migrate to Payload Plugin Manager custom view(s).
- `.../dashboard/marketplace/*` → Migrate to Payload Marketplace custom view(s).
- `.../dashboard/templates/*` → Migrate to Payload Template Manager custom view.
- `.../dashboard/themes/*` → Migrate to Payload Theme Manager custom view.

## 12. Builder Editor Rebuild Plan
- Keep `@measured/puck` as editor layer only (already in `packages/builder-editor`).
- Move editor entrypoint from dashboard route into Payload custom view:
  - `apps/web/src/admin/views/builder/PageBuilderView.tsx`
  - `apps/web/src/admin/views/builder/PageBuilderShell.tsx`
  - `apps/web/src/admin/views/builder/PageBuilderSaveActions.ts`
  - `apps/web/src/admin/views/builder/PageBuilderPreviewFrame.tsx`
- Add Page-level action/button from Payload edit view to open builder.
- Provide save draft + publish controls with permission checks.
- Add UI parity requirements (viewport switch, validation panel, dirty-state warning, autosave guards).

## 13. Builder Core / Renderer / Layout Separation Plan
Current status:
- Separation mostly exists:
  - `builder-core` independent.
  - `builder-editor` independent.
  - Public renderer in `apps/web/src/lib/content/rendering.ts` uses `builder-core`, not editor.

Planned hardening:
- Preserve no-editor-import rule in public runtime.
- Keep layout/theme concerns in `packages/themes` + public shell.
- Keep builder data content-only, no layout shell ownership.
- Add boundary tests asserting no editor imports under public rendering modules.

## 14. Puck Integration Plan
Current Puck integration:
- `packages/builder-editor/src/editor.tsx`
- `packages/builder-editor/src/config.tsx`
- config modules under `packages/builder-editor/src/config/*`.

Planned updates:
- Add explicit Puck integration modules:
  - `packages/builder-editor/src/puck/config.ts`
  - `packages/builder-editor/src/puck/fields.ts`
  - `packages/builder-editor/src/puck/categories.ts`
  - `packages/builder-editor/src/puck/permissions.ts`
  - `packages/builder-editor/src/puck/preview.tsx`
- Keep block source of truth in `builder-core`.
- Expand block taxonomy beyond current minimal set (currently: section, heading, text, image, button, form, commerce blocks).

## 15. Page Builder Feature Matrix
Current implemented:
- Puck editor UI, autosave, draft preview, dirty state unload warning.
- Block categories and drag/edit controls.
- Draft save endpoint and structural/semantic validation.
- Legacy migration support v0→v1 in `builder-core`.

Missing / Needs Implementation:
- Publish flow in editor UI (currently save draft focus).
- Undo/redo policy confirmation.
- Block search and richer categories.
- Reusable/global sections and symbols.
- Block lock/hide controls.
- Rich text dedicated block.
- Advanced marketing blocks (hero/pricing/faq/testimonials/gallery/tabs/accordion/etc.).
- Accessibility checks panel.
- SEO preview panel in builder.
- Conflict handling when page changes during editing.

## 16. Theme, Template, and Layout Plan
- Keep themes in `packages/themes/src/*` and site assignment in `sites.settings.themeId`.
- Keep template import/export in `apps/web/src/lib/templates/service.ts` and `/api/templates/*`.
- Migrate dashboard theme/template UIs to Payload custom views:
  - Theme Manager view wrapping `/api/themes/apply` and theme registry.
  - Template Manager view wrapping import/export/demo APIs.
- Keep public shell/layout rendering independent of Puck/editor.

## 17. Content Management Plan
- Pages/Posts/Media/Redirects remain Payload-first.
- Add Builder launch from Pages collection document view.
- Keep draft/publish/versioning via Payload versions (`pages`, `posts`).
- Add missing Menus/Navigation model.
- Preserve SEO fields and extend with global SEO settings.
- Ensure per-site content ownership remains enforced.

## 18. Commerce Admin Plan
Current:
- Collections: `commerce-orders`, `commerce-customers`.
- Services/APIs: cart, checkout, orders, products listing via adapter routes.

Missing / Needs Implementation:
- Product and taxonomy admin collections in Payload.
- Coupon/discount, shipping, tax, payment settings collections/globals.
- Commerce analytics cards in Admin Home/custom views.
- Store-manager role segmentation for commerce-only controls.

## 19. Forms and Automation Admin Plan
Current:
- Forms + submissions collections.
- Automation rules/executions collections.
- Submission APIs and workflows already server-validated.

Migration:
- Replace dashboard forms/automation pages with Payload collection/custom views.
- Add custom submissions viewer/filter tooling in Payload admin.
- Add automation executions operational view and safe controls.

## 20. System, Marketplace, Plugins, API, OpenAPI, MCP Plan
- Move dashboard plugin/marketplace/search/analytics/system pages into Payload custom views.
- Keep operational APIs:
  - `/api/plugins/*`, `/api/marketplace/*`, `/api/search`, `/api/analytics/summary`, `/api/openapi.json`, `/api/mcp`, `/api/health`, `/api/readiness`.
- Add admin center views for:
  - OpenAPI overview
  - MCP gateway overview/scope docs
  - Health/readiness and install/runtime warnings.

## 21. Data Model and Migration Plan
- Builder document currently uses:
  - `schema: 'nexpress-builder'`
  - `version: 1`
  - `blocks[]` structure (`packages/builder-core/src/types.ts`, `schema.ts`).
- Existing migration support from legacy v0 exists in `packages/builder-core/src/migrations.ts`.

Planned additions:
- Preserve old builder data pre-migration snapshot where needed.
- Add migration tracking metadata at page-level if required (`builderVersion`, `lastMigratedAt`).
- If introducing published snapshot field (`publishedBuilderData`), create migration/backfill tasks.
- Validate all migrated pages with renderer regression tests.

## 22. File-by-File Task List
- [ ] `apps/web/src/payload.config.ts`
  - Action: Add globals and admin custom views/components wiring.
  - Reason: unify admin under Payload.
  - Replacement: Payload admin IA + custom routes.
  - Dependencies: new files under `apps/web/src/globals`, `apps/web/src/admin/views`.
  - Validation: payload boot + `/admin` navigation load.

- [ ] `apps/web/src/app/(app)/dashboard/layout.tsx`
  - Action: Delete after migration.
  - Reason: duplicate admin shell.
  - Replacement: Payload admin shell.
  - Dependencies: complete migration of child routes.
  - Validation: `/dashboard` redirects to `/admin`.

- [ ] `apps/web/src/app/(app)/dashboard/page.tsx`
  - Action: Migrate to Payload custom Admin Home view.
  - Reason: duplicate dashboard homepage.
  - Replacement: `apps/web/src/admin/views/AdminHomeView.tsx`.
  - Dependencies: analytics/health/plugin summary providers.
  - Validation: admin home loads with permission-aware cards.

- [ ] `apps/web/src/app/(app)/dashboard/pages/page.tsx`
  - Action: Migrate to Pages collection workflows.
  - Reason: pages management should be in Payload.
  - Replacement: Pages collection list + builder action.
  - Dependencies: builder action integration.
  - Validation: create/open page from `/admin`.

- [ ] `apps/web/src/app/(app)/dashboard/pages/[id]/builder/page.tsx`
  - Action: Migrate to Payload Builder custom view.
  - Reason: editor must live in unified admin.
  - Replacement: `apps/web/src/admin/views/builder/PageBuilderView.tsx`.
  - Dependencies: payload custom view route + permissions.
  - Validation: open editor from page edit in `/admin`.

- [ ] `apps/web/src/app/(app)/dashboard/pages/[id]/builder/save/route.ts`
  - Action: Replace with Payload-integrated save action/route.
  - Reason: remove dashboard route coupling.
  - Replacement: admin server action/API in admin view module.
  - Dependencies: builder view and auth checks.
  - Validation: save draft returns typed response + audit + revalidate.

- [ ] `apps/web/src/app/(app)/dashboard/pages/[id]/preview/page.tsx`
  - Action: Migrate to builder preview panel/endpoint.
  - Reason: preview tied to old dashboard route.
  - Replacement: builder custom view preview frame.
  - Dependencies: public renderer parity checks.
  - Validation: draft preview matches public renderer semantics.

- [ ] `apps/web/src/lib/builder/editor.ts`
  - Action: Refactor to neutral admin adapter service (not dashboard-specific sources).
  - Reason: remove dashboard source naming and route assumptions.
  - Replacement: payload-admin builder adapter methods.
  - Dependencies: new admin builder view actions.
  - Validation: unit tests for load/save/validation remain green.

- [ ] `packages/builder-editor/src/editor.tsx`
  - Action: Keep and harden as editor-only UI.
  - Reason: Puck layer stays editor-only.
  - Replacement: none.
  - Dependencies: payload integration wrapper.
  - Validation: editor tests + payload view integration tests.

- [ ] `packages/builder-editor/src/config.tsx` + `src/config/*`
  - Action: Reorganize into explicit puck config/fields/categories/permissions modules.
  - Reason: scalability and feature matrix expansion.
  - Replacement: `src/puck/*` structure.
  - Dependencies: expanded builder-core block registry.
  - Validation: config tests and editor runtime.

- [ ] `packages/builder-core/src/blocks/*`
  - Action: Expand block catalog and metadata (a11y/security notes, responsive defaults).
  - Reason: meet required feature matrix.
  - Replacement: richer registry definitions.
  - Dependencies: editor mapping + public renderer components.
  - Validation: schema/registry/renderer tests.

- [ ] `apps/web/src/lib/content/rendering.ts`
  - Action: Preserve no-editor-import boundary; add tests for new blocks.
  - Reason: strict separation of editor vs public runtime.
  - Replacement: none.
  - Dependencies: builder-core block additions.
  - Validation: rendering tests + boundary import checks.

- [ ] `apps/web/src/collections/Pages.ts`
  - Action: Add builder workflow fields/action integration metadata as needed.
  - Reason: payload-native builder flow.
  - Replacement: pages-centric builder lifecycle.
  - Dependencies: builder custom view.
  - Validation: page CRUD + builder open/save/publish.

- [ ] `apps/web/src/globals/*` (new)
  - Action: Add System/Theme/SEO/Runtime globals.
  - Reason: dashboard settings migration to Payload globals.
  - Replacement: `/dashboard/settings` UI.
  - Dependencies: payload config registration.
  - Validation: globals visible + access-protected.

- [ ] `apps/web/src/admin/views/*` (new)
  - Action: Add all custom views listed in this plan.
  - Reason: migrate non-CRUD dashboard screens.
  - Replacement: `/dashboard/*` feature pages.
  - Dependencies: API/services and permission guards.
  - Validation: view rendering + role-based visibility.

- [ ] `apps/web/src/lib/dashboard/*`
  - Action: Delete after `/dashboard` retirement.
  - Reason: obsolete auth/nav abstraction.
  - Replacement: Payload admin + access.ts.
  - Dependencies: redirect complete.
  - Validation: no imports remain.

- [ ] `apps/web/src/app/(app)/dashboard/**`
  - Action: Delete after migration and redirects are stable.
  - Reason: enforce one-admin rule.
  - Replacement: `/admin` collections/views/components.
  - Dependencies: all mapped replacements complete.
  - Validation: no dashboard route remains except redirect.

- [ ] `apps/web/src/app/(app)/dashboard/...` client controls (theme-switcher, template-importer, plugin managers, etc.)
  - Action: migrate into payload custom components under `apps/web/src/admin/components/*`.
  - Reason: preserve capability under unified admin.
  - Replacement: payload custom views/components.
  - Dependencies: API endpoints retained.
  - Validation: same actions functional in `/admin`.

- [ ] `apps/web/e2e/*.spec.ts`
  - Action: rewrite `/dashboard` assertions to `/admin` IA and custom views.
  - Reason: end-to-end tests currently dashboard-centric.
  - Replacement: admin-centric flows.
  - Dependencies: view URLs and selectors finalized.
  - Validation: playwright suite passes.

## 23. Implementation Phases
### Phase 1: Discovery and Architecture Lock
- Finalize this plan from current code reality.
- Lock decisions and migration matrix.

### Phase 2: Payload Sidebar and Admin Information Architecture
- Re-group collections labels/groups.
- Add admin home placeholder custom view.
- Keep dashboard temporarily.

### Phase 3: Globals and Settings
- Add globals under `apps/web/src/globals`.
- Wire into payload config and permissions.

### Phase 4: Custom Admin Views
- Create `apps/web/src/admin/views`.
- Migrate analytics/search/marketplace/plugins/themes/templates/health views.

### Phase 5: Builder Core Cleanup
- Expand builder-core registry and contracts.
- Add migration/test hardening.

### Phase 6: Puck Builder Editor Rebuild
- Refactor builder-editor into explicit puck modules/panels.
- Add required UX features incrementally.

### Phase 7: Payload Page Integration
- Add builder action from pages edit view.
- Add payload admin builder custom route.
- Implement save/publish/preview/audit/revalidate.

### Phase 8: Public Renderer Separation
- Verify public runtime only depends on builder-core + themes.
- Add import-boundary regression checks.

### Phase 9: Migrate Old Dashboard Features
- Move each dashboard feature to payload collection/view/component.
- Add redirect strategy and remove duplicate CRUD routes.

### Phase 10: Security, RBAC, Multi-Tenant Isolation
- Validate all collection/view/action permissions.
- Validate site isolation and protected content boundaries.

### Phase 11: Testing and Cleanup
- Update unit/integration/e2e tests.
- Remove dead dashboard code.
- Run full quality gates and fix regressions.

## 24. Testing and Validation Plan
### Unit
- Builder schema validation, migrations, registry, renderer (`packages/builder-core/src/*.test.ts*`).
- Editor adapter/config (`packages/builder-editor/src/*.test.ts*`).
- Access control (`apps/web/src/lib/auth/access.test.ts`, `apps/web/src/lib/sites/tenant-isolation.test.ts`).
- Forms/commerce/plugins/themes/template services tests.

### Integration
- `/admin` loads and custom views load.
- Pages collection + builder action opens view.
- Save draft + publish + preview workflow.
- `/dashboard` redirects.
- Role-based view restrictions.

### E2E (Playwright)
- Replace dashboard flows in:
  - `apps/web/e2e/smoke.spec.ts`
  - `apps/web/e2e/builder.spec.ts`
  - `apps/web/e2e/auth.spec.ts`
- Add checks for admin IA groups, custom views, builder save/publish, public render parity, security boundaries.

### Commands (from current repo scripts)
- `corepack pnpm install`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`
- `corepack pnpm --filter @nexpress/web test`
- `corepack pnpm --filter @nexpress/web e2e`

## 25. Security and Multi-Tenant Isolation Plan
- Keep server-enforced authorization via `apps/web/src/lib/auth/access.ts`.
- Keep payload access controls for all collections.
- Ensure site-scoped queries use `createSiteScopeWhere`/resolved site context.
- Preserve anti-CSRF browser POST checks used in management APIs (`validateBrowserPostRequest`).
- Keep webhook signature verification (`/api/webhooks/inbound`, webhooks package).
- Keep form anti-spam/rate limiting pipeline in forms API/service.
- Keep MCP scoped execution (role-to-scope mapping in `/api/mcp`).
- Keep OpenAPI read-only document exposure.
- Restrict plugin/theme/template installation and state changes to admin permissions.
- Ensure builder HTML/embed/code blocks (future) are sanitized and constrained before public render.
- Ensure no secrets in client-exposed config, templates, logs, or manifests.

## 26. Risks and Warnings
- **Risk:** breaking operational workflows while moving dashboard pages.
  - Mitigation: migrate view-by-view with redirects and parity tests.
- **Risk:** permission regressions in custom views.
  - Mitigation: central permission wrappers + integration tests per role.
- **Risk:** builder publish/preview mismatch.
  - Mitigation: renderer parity tests and snapshot checks.
- **Risk:** node engine mismatch in CI/local (`>=22` required; environment currently Node 20).
  - Mitigation: enforce Node 22 in execution environment.
- **Risk:** large scope across multiple domains (content/commerce/plugins/themes/forms/system).
  - Mitigation: phased execution and strict phase gates.
- **Warning:** existing lint baseline already fails for unrelated `no-explicit-any` issues in web package.

## 27. Final Acceptance Criteria
- `/admin` is the only management dashboard.
- `/dashboard` fully redirects/deprecated with no duplicate management UI.
- All migrated dashboard capabilities available from Payload collections/globals/custom views/components.
- Builder is launched and managed from Payload Pages context.
- Puck remains editor-only; public renderer has no editor imports.
- Theme/layout engine remains separate from builder document content.
- Access controls and multi-tenant isolation remain server-enforced.
- Required tests updated and passing (except pre-existing documented failures).
- Full migration map and handoff checklist completed.

## 28. Next-Agent Handoff Checklist
- [ ] Confirm Node 22 runtime before implementation.
- [ ] Implement Phase 2 collection regrouping and admin IA labels first.
- [ ] Introduce `apps/web/src/admin/views/*` skeletons and wire into payload config.
- [ ] Introduce `apps/web/src/globals/*` and register in payload config.
- [ ] Move builder route from dashboard to payload custom view/action.
- [ ] Port dashboard feature UIs one by one into payload custom views/components.
- [ ] Add `/dashboard` redirect mapping after equivalent payload views are ready.
- [ ] Remove `apps/web/src/lib/dashboard/*` and `apps/web/src/app/(app)/dashboard/**` only after parity.
- [ ] Rewrite Playwright tests for `/admin` flows.
- [ ] Run full quality gates and resolve regressions.
