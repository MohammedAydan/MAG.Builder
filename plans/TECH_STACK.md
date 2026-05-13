# Tech Stack

## Runtime

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Language | TypeScript | 6.0.3 | strict mode required |
| Runtime | Node.js | 22.x target | local target for the current workspace |
| Package Manager | pnpm | 10.11.0 | workspace root initialized in Phase 00 |

## Frontend

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js | 16.2.6 | App Router only |
| UI Library | React | 19.2.6 | paired with Next.js |
| Styling | Tailwind CSS | 4.3.0 | baseline active in `apps/web` |
| UI Primitives | shadcn/ui + Radix UI | planned | implementation deferred |
| Icons | Lucide | planned | implementation deferred |
| Forms | React Hook Form + Zod | planned | implementation deferred |

## Backend

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| CMS | Payload CMS | planned | integrated in later phase |
| Database | PostgreSQL | 16.x target | first-class production DB |
| Validation | Zod | 4.4.3 | env validation active in Phase 02 |
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
| Workspace orchestrator | Turbo | 2.9.12 | `turbo.json` |
| Linter | ESLint CLI + `eslint-config-next` | 9.39.4 / 16.2.6 | `apps/web/eslint.config.mjs` |
| TypeScript config | root base + app override | `tsconfig.base.json`, `apps/web/tsconfig.json` |
| Testing | Vitest | 4.1.6 | `apps/web/vitest.config.ts` |

## Key Conventions

- Import alias: `@/` maps to `apps/web/src/` inside the web app
- App router is the only approved routing model
- Server Components remain the default in `apps/web`
