# NexPress v1 Scope Freeze

## Release Intent

NexPress v1 is a self-hosted, production-oriented, single-installation platform that delivers CMS, visual building, modular extension boundaries, commerce capability, documented APIs, and safe AI automation boundaries without introducing unsafe runtime extensibility.

## Frozen In-Scope Outcomes

### Platform foundation

- Greenfield monorepo with `apps/web` and the package boundaries defined in `PLAN.md`
- Next.js App Router as the primary application shell
- PostgreSQL-first data model and migration discipline
- structured observability, backups, deployment documentation, and production hardening as required release work

### Core kernel

- installation state and runtime configuration
- environment validation
- users, roles, permissions, and scopes
- audit logs
- module and plugin registry
- theme registry
- health and diagnostics surfaces

### CMS and content

- pages and posts
- custom content types and content entries
- drafts, revisions, and preview
- media management
- menus, redirects, and SEO metadata

### Builder

- NexPress-owned builder document schema in `packages/builder-core`
- validated public renderer separated from editor-only bundles
- visual editor adapter using Puck as an adapter rather than the source of truth
- reusable sections, global sections, responsive settings, and dynamic bindings

### Themes, templates, and plugins

- design-token-driven themes with safe CSS-variable boundaries
- import/exportable templates with demo content and manifests
- local or build-time verified plugin modules with typed manifests, permissions, and controlled capability registries

### Forms, identity, and public protection

- forms as a first-class platform capability
- admin/content auth through the chosen platform direction
- public member or customer protection flows for protected public routes

### Commerce

- optional commerce module isolated behind `packages/commerce`
- products, variants, categories or collections, cart, checkout in test mode, orders, customers, and integration boundaries for payments, shipping, tax, and webhook ingestion
- storefront builder blocks for commerce surfaces

### APIs and automation

- REST APIs through route handlers
- OpenAPI 3.1 as the public contract source of truth
- scoped API keys, validation, documented errors, rate limits, and webhook signing
- MCP gateway disabled by default, with read-first business tools and audited approval-gated mutations

## Explicit Out of Scope for v1

- arbitrary uploaded runtime plugin JavaScript
- arbitrary theme JavaScript execution
- raw shell, raw SQL, arbitrary filesystem, or arbitrary HTTP proxy MCP tools
- multi-tenant SaaS mode
- white-label SaaS control plane
- marketplace signing, payment settlement, or revenue-share systems
- public plugin marketplace distribution workflows
- MySQL parity as a v1 requirement
- native mobile applications
- point-of-sale systems
- multi-vendor commerce marketplace features
- unrestricted admin impersonation
- forcing commerce to be always-on for every installation

## Deferred But Intentionally Designed For

- self-hosted multi-site
- SaaS multi-tenant deployment
- plugin signing and marketplace verification
- update channels and signed package delivery
- additional commerce returns and refund workflows
- broader automation and analytics packs

## Scope Guardrails

- v1 scope may be clarified, but not expanded, without a new ADR
- no phase may implement capabilities listed as out of scope
- no implementation may contradict `PLAN.md`, `01-final-decision-record.md`, or accepted ADRs
