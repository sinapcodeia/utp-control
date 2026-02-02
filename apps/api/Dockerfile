FROM node:22-alpine AS base

# Instalar pnpm y dependencias de sistema para Prisma
RUN apk add --no-cache openssl libc6-compat && \
    corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copiar archivos de configuración del monorepo
COPY package.json pnpm-workspace.yaml ./

# ============================================
# STAGE 1: Dependencies
# ============================================
FROM base AS dependencies

# Copiar el código de la API
COPY apps/api ./apps/api

# Instalar TODAS las dependencias (dev + prod) para el build
RUN pnpm install --filter api...

# ============================================
# STAGE 2: Build
# ============================================
FROM dependencies AS build

WORKDIR /app/apps/api

# Generar cliente Prisma
RUN pnpm exec prisma generate

# Compilar la aplicación NestJS
RUN pnpm run build

# ============================================
# STAGE 3: Production
# ============================================
FROM node:22-alpine AS production

RUN apk add --no-cache openssl libc6-compat && \
    corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copiar archivos de configuración
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Instalar SOLO dependencias de producción
RUN pnpm install --filter api... --prod

WORKDIR /app/apps/api

# Copiar el código compilado desde la etapa de build
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/prisma ./prisma

# Generar Prisma Client en producción
RUN pnpm exec prisma generate

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Cambiar permisos
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/src/main"]
