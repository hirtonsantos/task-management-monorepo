FROM node:20-bullseye-slim AS base

# Dependências necessárias para node-gyp e PostgreSQL
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# ======================
# Builder
# ======================
FROM base AS builder

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY turbo.json ./
COPY tsconfig.json tsconfig.base.json ./

# Copy packages
COPY packages ./packages

# Copy worker app
COPY apps/worker ./apps/worker

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build worker
RUN pnpm turbo run build --filter=@task-app/worker...

# ======================
# Runner
# ======================
FROM node:20-bullseye-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Instalar apenas runtime dependencies do PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 worker

# Copy built files only
COPY --from=builder --chown=worker:nodejs /app/apps/worker/dist ./dist
COPY --from=builder --chown=worker:nodejs /app/apps/worker/package.json ./
COPY --from=builder --chown=worker:nodejs /app/node_modules ./node_modules

USER worker

CMD ["node", "dist/main.js"]