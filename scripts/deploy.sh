#!/bin/bash

# ============================================
# Script de Despliegue a Producción - UTP CONTROL
# ============================================

set -e  # Salir si hay algún error

echo "🚀 Iniciando despliegue a producción..."
echo ""

# ============================================
# 1. Validación de Variables de Entorno
# ============================================
echo "📋 Validando variables de entorno..."

if [ ! -f "apps/api/.env.production" ]; then
    echo "❌ Error: No se encontró apps/api/.env.production"
    echo "Por favor, crea el archivo basándote en .env.production.example"
    exit 1
fi

if [ ! -f "apps/web/.env.production" ]; then
    echo "❌ Error: No se encontró apps/web/.env.production"
    echo "Por favor, crea el archivo basándote en .env.production.example"
    exit 1
fi

echo "✅ Variables de entorno validadas"
echo ""

# ============================================
# 2. Detener Contenedores Existentes
# ============================================
echo "🛑 Deteniendo contenedores existentes..."
docker compose -f docker-compose.prod.yml down || true
echo "✅ Contenedores detenidos"
echo ""

# ============================================
# 3. Construir Imágenes Docker
# ============================================
echo "🔨 Construyendo imágenes Docker de producción..."
docker compose -f docker-compose.prod.yml build --no-cache

if [ $? -ne 0 ]; then
    echo "❌ Error al construir las imágenes Docker"
    exit 1
fi

echo "✅ Imágenes construidas exitosamente"
echo ""

# ============================================
# 4. Ejecutar Migraciones de Base de Datos
# ============================================
echo "🗄️  Ejecutando migraciones de base de datos..."

# Crear un contenedor temporal para ejecutar las migraciones
docker compose -f docker-compose.prod.yml run --rm api sh -c "npx prisma db push && npx prisma generate"

if [ $? -ne 0 ]; then
    echo "❌ Error al ejecutar las migraciones"
    exit 1
fi

echo "✅ Migraciones ejecutadas exitosamente"
echo ""

# ============================================
# 5. Iniciar Servicios
# ============================================
echo "🚀 Iniciando servicios en producción..."
docker compose -f docker-compose.prod.yml up -d

if [ $? -ne 0 ]; then
    echo "❌ Error al iniciar los servicios"
    exit 1
fi

echo "✅ Servicios iniciados"
echo ""

# ============================================
# 6. Verificar Estado de los Servicios
# ============================================
echo "🔍 Verificando estado de los servicios..."
sleep 5  # Esperar a que los servicios inicien

docker compose -f docker-compose.prod.yml ps

echo ""
echo "📊 Verificando logs de inicio..."
docker compose -f docker-compose.prod.yml logs --tail=20

echo ""

# ============================================
# 7. Healthcheck
# ============================================
echo "🏥 Ejecutando healthcheck..."
sleep 10  # Esperar a que los servicios estén completamente listos

# Verificar API
echo "Verificando API..."
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health || echo "000")

if [ "$API_HEALTH" = "200" ]; then
    echo "✅ API está funcionando correctamente"
else
    echo "⚠️  Advertencia: API no responde correctamente (código: $API_HEALTH)"
fi

# Verificar Web
echo "Verificando Frontend..."
WEB_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003 || echo "000")

if [ "$WEB_HEALTH" = "200" ]; then
    echo "✅ Frontend está funcionando correctamente"
else
    echo "⚠️  Advertencia: Frontend no responde correctamente (código: $WEB_HEALTH)"
fi

echo ""

# ============================================
# 8. Resumen Final
# ============================================
echo "============================================"
echo "✅ Despliegue completado"
echo "============================================"
echo ""
echo "📍 URLs de acceso:"
echo "   - Frontend: http://localhost:3003"
echo "   - API: http://localhost:3001"
echo ""
echo "📊 Comandos útiles:"
echo "   - Ver logs: docker compose -f docker-compose.prod.yml logs -f"
echo "   - Ver estado: docker compose -f docker-compose.prod.yml ps"
echo "   - Detener: docker compose -f docker-compose.prod.yml down"
echo ""
echo "⚠️  IMPORTANTE: Monitorea los logs durante las próximas horas"
echo "   docker compose -f docker-compose.prod.yml logs -f"
echo ""
