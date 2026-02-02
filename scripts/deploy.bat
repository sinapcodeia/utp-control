@echo off
REM ============================================
REM Script de Despliegue a Producción - UTP CONTROL (Windows)
REM ============================================

echo.
echo 🚀 Iniciando despliegue a producción...
echo.

REM ============================================
REM 1. Validación de Variables de Entorno
REM ============================================
echo 📋 Validando variables de entorno...

if not exist "apps\api\.env.production" (
    echo ❌ Error: No se encontró apps\api\.env.production
    echo Por favor, crea el archivo basándote en .env.production.example
    exit /b 1
)

if not exist "apps\web\.env.production" (
    echo ❌ Error: No se encontró apps\web\.env.production
    echo Por favor, crea el archivo basándote en .env.production.example
    exit /b 1
)

echo ✅ Variables de entorno validadas
echo.

REM ============================================
REM 2. Detener Contenedores Existentes
REM ============================================
echo 🛑 Deteniendo contenedores existentes...
docker compose -f docker-compose.prod.yml down 2>nul
echo ✅ Contenedores detenidos
echo.

REM ============================================
REM 3. Construir Imágenes Docker
REM ============================================
echo 🔨 Construyendo imágenes Docker de producción...
docker compose -f docker-compose.prod.yml build --no-cache

if errorlevel 1 (
    echo ❌ Error al construir las imágenes Docker
    exit /b 1
)

echo ✅ Imágenes construidas exitosamente
echo.

REM ============================================
REM 4. Ejecutar Migraciones de Base de Datos
REM ============================================
echo 🗄️  Ejecutando migraciones de base de datos...

docker compose -f docker-compose.prod.yml run --rm api sh -c "npx prisma db push && npx prisma generate"

if errorlevel 1 (
    echo ❌ Error al ejecutar las migraciones
    exit /b 1
)

echo ✅ Migraciones ejecutadas exitosamente
echo.

REM ============================================
REM 5. Iniciar Servicios
REM ============================================
echo 🚀 Iniciando servicios en producción...
docker compose -f docker-compose.prod.yml up -d

if errorlevel 1 (
    echo ❌ Error al iniciar los servicios
    exit /b 1
)

echo ✅ Servicios iniciados
echo.

REM ============================================
REM 6. Verificar Estado de los Servicios
REM ============================================
echo 🔍 Verificando estado de los servicios...
timeout /t 5 /nobreak >nul

docker compose -f docker-compose.prod.yml ps

echo.
echo 📊 Verificando logs de inicio...
docker compose -f docker-compose.prod.yml logs --tail=20

echo.

REM ============================================
REM 7. Healthcheck
REM ============================================
echo 🏥 Ejecutando healthcheck...
timeout /t 10 /nobreak >nul

echo Verificando API...
curl -s -o nul -w "%%{http_code}" http://localhost:3001/health > temp_api_health.txt 2>nul
set /p API_HEALTH=<temp_api_health.txt
del temp_api_health.txt 2>nul

if "%API_HEALTH%"=="200" (
    echo ✅ API está funcionando correctamente
) else (
    echo ⚠️  Advertencia: API no responde correctamente
)

echo Verificando Frontend...
curl -s -o nul -w "%%{http_code}" http://localhost:3003 > temp_web_health.txt 2>nul
set /p WEB_HEALTH=<temp_web_health.txt
del temp_web_health.txt 2>nul

if "%WEB_HEALTH%"=="200" (
    echo ✅ Frontend está funcionando correctamente
) else (
    echo ⚠️  Advertencia: Frontend no responde correctamente
)

echo.

REM ============================================
REM 8. Resumen Final
REM ============================================
echo ============================================
echo ✅ Despliegue completado
echo ============================================
echo.
echo 📍 URLs de acceso:
echo    - Frontend: http://localhost:3003
echo    - API: http://localhost:3001
echo.
echo 📊 Comandos útiles:
echo    - Ver logs: docker compose -f docker-compose.prod.yml logs -f
echo    - Ver estado: docker compose -f docker-compose.prod.yml ps
echo    - Detener: docker compose -f docker-compose.prod.yml down
echo.
echo ⚠️  IMPORTANTE: Monitorea los logs durante las próximas horas
echo    docker compose -f docker-compose.prod.yml logs -f
echo.

pause
