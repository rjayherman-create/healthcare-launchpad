# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

WORKDIR /app

# Copy workspace config files first for better layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json tsconfig.json ./

# Copy all workspace packages pnpm needs to resolve the graph
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

# Install all dependencies (workspace-aware, no scripts needed here)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Generate SQL migration files from the schema
RUN pnpm --filter @workspace/db exec drizzle-kit generate --config ./drizzle.config.ts

# Build the api-server bundle (also produces dist/migrate.mjs)
RUN pnpm --filter @workspace/api-server run build

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

# Copy the compiled server and migration runner
COPY --from=builder /app/artifacts/api-server/dist ./dist

# Copy the generated SQL migration files
COPY --from=builder /app/lib/db/drizzle ./drizzle

# Copy and prepare the entrypoint
COPY --from=builder /app/artifacts/api-server/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER appuser

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
