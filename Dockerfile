FROM node:22-alpine AS builder
WORKDIR /app

# Workspace manifests first — better layer caching
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/ packages/

RUN npm ci

COPY apps/api/src apps/api/src
COPY apps/api/tsconfig.json apps/api/tsconfig.json
COPY apps/api/prisma apps/api/prisma

RUN cd apps/api && npx prisma generate && npm run build

# ---- runtime ----
FROM node:22-alpine AS runner
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/ packages/

# --ignore-scripts prevents @prisma/client postinstall from failing
# (prisma CLI is a devDep, not available here)
RUN npm ci --omit=dev --ignore-scripts

# Copy generated Prisma client and compiled JS from builder
COPY --from=builder /app/node_modules/.prisma node_modules/.prisma
COPY --from=builder /app/apps/api/dist apps/api/dist

WORKDIR /app/apps/api

EXPOSE 8080

CMD ["node", "dist/server.js"]
