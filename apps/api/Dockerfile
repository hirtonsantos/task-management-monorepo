# ======================
# Builder
# ======================
FROM node:20-bullseye-slim AS builder

WORKDIR /app

# Dependências para node-gyp e PostgreSQL (com retry)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    libpq-dev \
    postgresql-client \
    || (sleep 5 && apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    libpq-dev \
    postgresql-client) && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Copy ALL workspace files (incluindo tsconfig.base.json)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY tsconfig.json tsconfig.base.json ./

# Copy ALL packages first (important for dependencies)
COPY packages ./packages

# Copy API app
COPY apps/api ./apps/api

# Install deps
RUN pnpm install --frozen-lockfile

# Build database package explicitly first
RUN pnpm run build --filter=@task-app/database

# Build API (database will be cached from previous step)
RUN pnpm run build --filter=@task-app/api

# ======================
# Runtime (produção)
# ======================
FROM node:20-bullseye-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Instalar apenas runtime dependencies do PostgreSQL (com retry)
RUN apt-get update && \
    apt-get install -y --no-install-recommends libpq5 \
    || (sleep 5 && apt-get update && apt-get install -y --no-install-recommends libpq5) && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs

# Copy only what is needed
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main.js"]