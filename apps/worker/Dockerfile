FROM node:20-alpine AS base

# Dependências necessárias para node-gyp
RUN apk add --no-cache python3 make g++ libc6-compat

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
COPY tsconfig.json ./

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
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 worker

# Copy built files only
COPY --from=builder --chown=worker:nodejs /app/apps/worker/dist ./dist
COPY --from=builder --chown=worker:nodejs /app/apps/worker/package.json ./
COPY --from=builder --chown=worker:nodejs /app/node_modules ./node_modules

USER worker

CMD ["node", "dist/main.js"]
