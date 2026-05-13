# System Architecture

## Overview

NexPress is a modular monorepo with a single primary Next.js app and multiple internal packages that isolate CMS, builder, commerce, API, security, and observability concerns behind stable boundaries.

## Architecture Pattern

Modular monorepo with package boundaries, adapter-driven integrations, and a small always-on kernel.

## System Diagram

```txt
apps/web
  -> packages/auth
  -> packages/cms
  -> packages/builder-core
  -> packages/themes
  -> packages/security
  -> packages/api-contracts

packages/builder-editor -> packages/builder-core
packages/commerce -> external commerce adapter boundary
packages/mcp-gateway -> scoped AI automation boundary
packages/observability -> shared logging and telemetry
```

## Core Components

| Component | Responsibility | Location |
|-----------|---------------|----------|
| web app | Admin/public shells and route handlers | `apps/web` |
| cms | Payload config and content adapters | `packages/cms` |
| builder-core | Safe builder schema, validation, renderer contracts | `packages/builder-core` |
| builder-editor | Visual editor adapter surfaces | `packages/builder-editor` |
| plugins | Plugin manifest loading and lifecycle boundaries | `packages/plugins` |
| themes | Theme registry and token contracts | `packages/themes` |
| commerce | Commerce service adapter boundary | `packages/commerce` |
| api-contracts | API schemas and OpenAPI artifacts | `packages/api-contracts` |
| mcp-gateway | Scoped MCP tool gateway | `packages/mcp-gateway` |
| security | Headers, rate limiting, CSRF, scope checks | `packages/security` |
| observability | Logging, tracing, and error reporting adapters | `packages/observability` |

## Data Flow

Requests enter through `apps/web`, pass through security and authorization boundaries, call package-level services, and render public/admin output using typed contracts rather than direct cross-layer coupling.

## External Integrations

| Service | Purpose | Auth Method |
|---------|---------|------------|
| PostgreSQL | Primary production database | Connection string |
| Payload CMS | CMS/admin/content foundation | Internal server integration |
| Medusa | Future commerce backend adapter | Service credentials |
| Redis | Future queue/cache adapter | Connection string |
| S3/R2 | Future object storage adapter | Access key credentials |

## Boundaries & Invariants

- Builder documents store JSON, not executable code
- Public rendering must not require editor-only packages
- Commerce stays behind `packages/commerce`
- MCP remains disabled by default and never exposes raw shell, SQL, filesystem, or arbitrary network primitives

## Security Model

- Auth: Payload auth for admin/content with future public member adapter
- Authorization: Server-enforced permission engine and scopes
- Secrets: Environment variables only
- Input validation: Zod at all public boundaries
