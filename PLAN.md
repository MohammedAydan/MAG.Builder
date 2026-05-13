# NexPress Greenfield Production Blueprint v4

_Last updated: 2026-05-13_

## 0. Executive summary

NexPress is a greenfield, production-grade, modular CMS + commerce + visual-builder platform built with the latest stable Next.js App Router generation. The target outcome is not a WordPress clone internally; the target is to provide the useful product outcomes of WordPress, WooCommerce, Shopify, Elementor/Webflow-style editing, headless APIs, and AI-native MCP automation through a safer typed architecture.

This blueprint assumes there is **no existing project**. Agents must start by creating the repository, scaffolding the app, adding configuration, and then implementing one phase at a time.

## 1. Non-negotiable product goals

NexPress must eventually support:

- install/setup wizard similar to WordPress, but more secure and typed;
- modern admin dashboard;
- CMS pages, posts, custom content types, custom fields, drafts, revisions, preview;
- page builder with sections, containers, columns, responsive controls, reusable/global sections, dynamic bindings, forms, products, and CMS data;
- theme/template system with import/export and demo content;
- plugin/module system, but v1 plugins are local/build-time verified modules, not arbitrary runtime JavaScript;
- commerce module comparable to WooCommerce/Shopify core flows: products, variants, cart, checkout, orders, customers, coupons, taxes/shipping integration points, storefront blocks;
- public members/customers and protected public routes;
- REST APIs with OpenAPI 3.1, API keys/scopes, webhooks, rate limits, and validation;
- MCP gateway for safe AI automation, disabled by default;
- audit logs, approvals, backups, migrations, observability, and production deployment.

## 2. Final stack decision

| Area | Final decision |
|---|---|
| Framework | Next.js 16 App Router, TypeScript strict, React Server Components where suitable |
| Runtime | Node.js LTS runtime; avoid Edge runtime unless a route is explicitly edge-safe |
| Package manager | pnpm workspaces |
| Monorepo | Turborepo-style packages/apps layout from day one |
| CMS foundation | Payload CMS integrated with Next.js |
| Builder | NexPress-owned Builder Kernel: stable JSON schema + renderer + validation; Puck adapter for visual editing; @dnd-kit only for custom advanced editor surfaces |
| Commerce | Medusa-backed NexCommerce module after spike; isolate commerce as an adapter/service boundary |
| Database | PostgreSQL first-class production DB; MySQL compatibility is a later adapter, not a v1 requirement |
| Validation | Zod for all public inputs, plugin manifests, builder schema, API payloads |
| UI | Tailwind CSS, shadcn/ui, Radix UI, Lucide icons |
| Forms | React Hook Form + Zod, with server actions or route handlers depending on external-call needs |
| Rich text | Payload Lexical by default |
| Auth | Payload Auth for admin/content; NexPress Permission Engine for roles/scopes; optional public member auth adapter |
| API | Next.js Route Handlers for public APIs/webhooks/mobile integrations; OpenAPI 3.1 docs |
| MCP | HTTP MCP gateway, OAuth-ready, scoped, audited, approval-gated, disabled by default |
| Jobs | Queue adapter interface first; BullMQ + Redis after spike |
| Storage | Local dev adapter; S3/R2 production adapter |
| Testing | Vitest, Playwright, MSW, contract tests, migration tests |
| Observability | Pino structured logs, OpenTelemetry instrumentation, Sentry-compatible error adapter |
| Security baseline | OWASP ASVS-inspired controls, OWASP API Security controls, secure defaults |

## 3. Core architecture rule

The kernel must remain small. NexPress must not load every feature for every site.

### Always-on kernel

- installation state;
- runtime config and environment validation;
- users, roles, permissions, scopes;
- audit logs;
- module/plugin registry;
- theme registry;
- builder schema/renderer runtime;
- content rendering;
- API scope checker;
- security middleware;
- system health and diagnostics.

### Optional modules

- Blog Pack;
- Commerce Pack;
- Forms Pack;
- SEO Pack;
- Membership Pack;
- LMS Pack;
- Booking Pack;
- Docs/Knowledge Base Pack;
- Analytics Pack;
- MCP Tools Pack;
- Marketplace Pack.

## 4. Product readiness levels

| Level | Name | Meaning |
|---:|---|---|
| 0 | Prototype | Pages render locally; not production-safe |
| 1 | CMS MVP | Admin login, pages, builder, public rendering, media, SEO basics |
| 2 | Platform MVP | Plugin registry, theme engine, templates, forms, members, APIs, audit, permissions |
| 3 | Commerce MVP | Products, cart, checkout test mode, orders, customers, storefront blocks |
| 4 | Production Candidate | Security gates, tests, backups, monitoring, deployment, migrations, rate limits |
| 5 | Market-ready Platform | Signed plugins/templates, update system, docs, installer, multi-site/SaaS strategy |

## 5. Hard engineering principles

1. Server-enforced authorization only. UI hiding is not authorization.
2. No arbitrary runtime plugin JavaScript in v1.
3. No raw shell, SQL, filesystem, or network MCP tools.
4. Builder stores JSON, not executable code.
5. Public renderer is separate from editor bundles.
6. Commerce is isolated behind adapters.
7. Every critical write is audited.
8. Every public API validates input, checks scope, rate limits, and returns documented errors.
9. Every phase must be buildable and testable before moving on.
10. Prefer adapters for storage, queue, email, search, payments, analytics, and AI tools.
11. No mega-PRs. One phase per branch or PR.
12. If an agent is uncertain, it must update `IMPLEMENTATION_STATUS.md` and stop before destructive changes.

## 6. Target monorepo structure

```txt
nexpress/
  apps/
    web/                         # Next.js 16 app: admin, public site, APIs
    docs/                        # documentation site later
  packages/
    config/                      # eslint/tsconfig/prettier/shared config
    db/                          # database adapters, migrations, generated clients
    auth/                        # permission engine and auth helpers
    cms/                         # Payload collections and CMS adapters
    builder-core/                # schema, renderer, block registry, validation
    builder-editor/              # Puck adapter and custom editor surfaces
    themes/                      # theme engine, tokens, layouts, demo templates
    plugins/                     # plugin manifest loader and local modules
    commerce/                    # commerce adapter and Medusa integration layer
    api-contracts/               # OpenAPI, schemas, generated SDKs
    mcp-gateway/                 # MCP server/gateway and tool registry
    observability/               # logs, metrics, tracing, error adapter
    security/                    # rate limits, CSP, headers, CSRF, policy helpers
    shared/                      # shared types and utilities
  templates/
    starter-site/
    ecommerce-site/
    blog-site/
  plugins/
    blog-pack/
    forms-pack/
    seo-pack/
    commerce-pack/
    membership-pack/
  tools/
    scripts/
    generators/
    seed/
  docs/
    product/
    architecture/
    decisions/
    runbooks/
    api/
    mcp/
  .github/
  .agent/
  .antigravity/
  .qwen/
  .claude/
  PLAN.md
  IMPLEMENTATION_STATUS.md
```

## 7. Domain modules

### Kernel

- install wizard;
- runtime configuration;
- environment validation;
- users/roles/permissions/scopes;
- audit logs;
- module registry;
- plugin capability registry;
- feature flags;
- update state;
- health checks.

### CMS

- pages;
- posts;
- content types;
- content entries;
- drafts/revisions;
- preview links;
- media manager;
- menus;
- redirects;
- taxonomies;
- SEO metadata;
- localization-ready fields.

### Builder

- builder document schema;
- recursive block tree;
- Section, Container, Columns, Grid, Stack, Tabs, Accordion, Card, Hero, CTA, Media, Form, Product Grid, Collection List;
- style token system;
- responsive settings;
- reusable sections;
- global sections;
- template import/export;
- dynamic bindings;
- safe server-side data resolver.

### Plugins

- manifest;
- lifecycle hooks;
- permission declarations;
- admin menu entries;
- block declarations;
- API route declarations through controlled registration;
- MCP tool declarations;
- settings schema;
- migrations;
- compatibility constraints;
- signature/verification model for later marketplace.

### Themes

- design tokens;
- layouts;
- header/footer slots;
- block variants;
- typography;
- spacing scale;
- color palettes;
- safe custom CSS variables;
- no arbitrary JS in v1 themes.

### Commerce

- commerce adapter layer;
- Medusa service integration;
- products and variants;
- categories/collections;
- cart and checkout;
- orders and customers;
- payment provider adapter;
- shipping/tax region adapter;
- discounts/coupons;
- refunds/returns in later phases;
- storefront builder blocks.

### API and integrations

- REST APIs;
- OpenAPI 3.1;
- API keys;
- OAuth/OIDC-ready boundary;
- scoped tokens;
- webhooks;
- webhook signing;
- SDK generation;
- integration registry.

### MCP

- read-only tools first;
- mutation tools later behind approval policies;
- scoped tool permissions;
- audit log for every tool call;
- no raw shell, DB, filesystem, or network primitives;
- tools expose business actions only.

## 8. Implementation phases

See `03-phases/README.md` and each phase folder. Agents must implement phases in order.

## 9. AI-agent execution model

All supported agents must treat this repository as a controlled build program:

1. read `PLAN.md`;
2. read `01-final-decision-record.md`;
3. read `03-phases/README.md`;
4. identify the current phase from `IMPLEMENTATION_STATUS.md`;
5. read only the relevant phase folder plus directly linked architecture docs;
6. implement one phase only;
7. run the required quality gates;
8. update `IMPLEMENTATION_STATUS.md`;
9. stop with a review summary.

## 10. Initial command target

When starting from an empty folder, use this instruction:

```txt
Start Phase 00 only. This is a greenfield project. Read the agent instruction file for your tool, then read PLAN.md, 01-final-decision-record.md, 03-phases/README.md, and 03-phases/phase-00-greenfield-bootstrap/*. Create the initial repository structure and status files. Do not implement later phases.
```

## 11. Definition of done for the whole platform

The platform is not considered ready until:

- admin and public routes are protected correctly;
- install wizard can configure the system safely;
- pages can be built visually and rendered publicly;
- plugins/modules can be activated/deactivated safely;
- a template can be imported and customized;
- commerce checkout works in test mode;
- public APIs have OpenAPI docs and scoped access;
- MCP gateway is disabled by default and audited when enabled;
- tests cover critical flows;
- production deployment, backups, and observability are documented and tested;
- security checklist is completed.
