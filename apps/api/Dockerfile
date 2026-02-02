FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

# Copiamos archivos de configuración del monorepo
COPY package.json pnpm-workspace.yaml ./

# Copiamos el código de la API
COPY apps/api ./apps/api

# Instalamos dependencias específicamente para la API usando el filtro de pnpm
RUN pnpm install --filter api...

WORKDIR /app/apps/api

# Generar cliente prisma (importante para evitar errores de tipos en runtime)
RUN npx prisma generate

EXPOSE 3001

CMD ["pnpm", "run", "start:dev"]
