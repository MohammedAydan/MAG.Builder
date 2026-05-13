# Final Decision Record

## Decision 1 — Greenfield project

This project starts from an empty repository. No phase may assume existing application code.

## Decision 2 — Next.js 16 App Router

The platform targets Next.js 16 App Router with TypeScript strict mode. The App Router is the default route model. Pages Router is prohibited unless a documented compatibility exception is approved.

## Decision 3 — Payload CMS foundation

Payload is the CMS/admin/content foundation because it provides code-first TypeScript CMS primitives, admin UI, auth, collections, media, drafts, versions, and extensibility. NexPress owns the platform architecture around Payload and must not expose Payload internals as the only product API.

## Decision 4 — Owned builder schema

NexPress owns the builder document JSON schema. Puck is an editor adapter, not the source of truth. Public rendering must use NexPress builder-core, not editor-specific structures.

## Decision 5 — Commerce isolation

Commerce must be isolated behind `packages/commerce`. Medusa is the preferred commerce engine after spike validation. NexPress owns storefront/admin integration and builder blocks.

## Decision 6 — API-first and MCP-native, but safe

Public APIs are documented through OpenAPI 3.1. MCP is a first-class integration surface but is disabled by default and never exposes raw shell, raw SQL, filesystem, or arbitrary HTTP tools.

## Decision 7 — One phase per agent session

Every AI agent must implement only the requested phase. The agent must not skip phases, silently change architecture, or implement large unrelated scope.

## Decision 8 — Production gates are part of the product

Security, tests, observability, migrations, backups, and deployment are required deliverables, not optional later cleanup.
