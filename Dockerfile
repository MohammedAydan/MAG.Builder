# Stage 1: Base
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Stage 2: Prune
FROM base AS pruner
RUN pnpm add -g turbo
COPY . .
RUN turbo prune @nexpress/web --out=full

# Stage 3: Build
FROM base AS builder
RUN pnpm add -g turbo
COPY --from=pruner /app/full/ .
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm turbo run build --filter=@nexpress/web

# Stage 4: Runner
FROM base AS runner
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Payload CMS needs its migrations and config sometimes for runtime
# Standalone Next.js handles most dependencies, but Payload might need its media directory
RUN mkdir -p /app/apps/web/media && chown nextjs:nodejs /app/apps/web/media

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Note: Runtime secrets must be provided via environment variables
CMD ["node", "apps/web/server.js"]
