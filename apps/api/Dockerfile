# ======================
# Builder
# ======================
FROM node:20-alpine AS builder

WORKDIR /app

# Dependências para node-gyp
RUN apk add --no-cache python3 make g++ libc6-compat

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api

# Install deps
RUN pnpm install --frozen-lockfile

# Build API
RUN pnpm run build --filter=@task-app/api

# ======================
# Runtime (produção)
# ======================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

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
