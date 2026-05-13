# Tech Stack

## Runtime

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Language | TypeScript | planned | strict mode required |
| Runtime | Node.js | 22.x target | bootstrap validators use Node scripts |
| Package Manager | pnpm | 10.x target | workspace root initialized in Phase 00 |

## Frontend

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js | 16.x target | App Router only |
| UI Library | React | planned | paired with Next.js |
| Styling | Tailwind CSS | planned | implementation deferred |
| UI Primitives | shadcn/ui + Radix UI | planned | implementation deferred |
| Icons | Lucide | planned | implementation deferred |
| Forms | React Hook Form + Zod | planned | implementation deferred |

## Backend

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| CMS | Payload CMS | planned | integrated in later phase |
| Database | PostgreSQL | 16.x target | first-class production DB |
| Validation | Zod | planned | required at public boundaries |
| Queue | BullMQ + Redis | planned | adapter-first, later phase |

## Infrastructure

| Layer | Technology | Notes |
|-------|-----------|-------|
| Storage | Local dev plus S3/R2 adapter | later phase |
| Hosting | TBD | documented later |
| CI/CD | GitHub Actions | pipeline scaffolding later |
| Monitoring | OpenTelemetry + Sentry-compatible adapter | later phase |

## Dev Tooling

| Tool | Version | Config File |
|------|---------|------------|
| Workspace orchestrator | Turborepo schema | `turbo.json` |
| TypeScript config | bootstrap | `tsconfig.base.json` |
| Validation scripts | custom Node scripts | `tools/scripts/*.mjs` |

## Key Conventions

- Import alias: `@/` reserved at repo root for future shared path conventions
- App router is the only approved routing model
- Phase 00 uses placeholders only; no product behavior lands yet
