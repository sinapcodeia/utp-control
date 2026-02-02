# Guía de Despliegue a Producción - UTP CONTROL

Esta guía describe el proceso completo para desplegar la aplicación UTP CONTROL a producción.

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Acceso a la base de datos de Supabase
- Variables de entorno configuradas
- Claves VAPID para notificaciones push

## 🚀 Proceso de Despliegue

### Opción 1: Script Automatizado (Recomendado)

#### En Windows:
```bash
cd c:\UTP\CONTROL
.\scripts\deploy.bat
```

#### En Linux/Mac:
```bash
cd /path/to/UTP/CONTROL
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Opción 2: Despliegue Manual

#### 1. Configurar Variables de Entorno

Asegúrate de que existan los archivos:
- `apps/api/.env.production`
- `apps/web/.env.production`

Verifica que contengan todas las variables necesarias (ver templates).

#### 2. Construir Imágenes

```bash
docker compose -f docker-compose.prod.yml build --no-cache
```

#### 3. Ejecutar Migraciones

```bash
docker compose -f docker-compose.prod.yml run --rm api sh -c "npx prisma db push && npx prisma generate"
```

#### 4. Iniciar Servicios

```bash
docker compose -f docker-compose.prod.yml up -d
```

#### 5. Verificar Estado

```bash
# Ver estado de contenedores
docker compose -f docker-compose.prod.yml ps

# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Verificar healthcheck de API
curl http://localhost:3001/health

# Verificar frontend
curl http://localhost:3003
```

## 🔍 Verificación Post-Despliegue

### 1. Verificación Automática

Los contenedores incluyen healthchecks automáticos que se ejecutan cada 30 segundos:

```bash
docker compose -f docker-compose.prod.yml ps
```

Deberías ver `healthy` en el estado de ambos servicios.

### 2. Verificación Manual

#### Probar Login
1. Abrir `http://localhost:3003`
2. Iniciar sesión con credenciales válidas
3. Verificar que cargue el dashboard

#### Probar Funcionalidades Críticas
- ✅ Crear un reporte regional
- ✅ Subir un documento
- ✅ Verificar notificaciones push
- ✅ Revisar directorio de usuarios
- ✅ Verificar permisos por rol

### 3. Monitoreo de Logs

```bash
# Ver logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f

# Ver logs solo de la API
docker compose -f docker-compose.prod.yml logs -f api

# Ver logs solo del frontend
docker compose -f docker-compose.prod.yml logs -f web
```

## 📊 Comandos Útiles

### Gestión de Contenedores

```bash
# Ver estado
docker compose -f docker-compose.prod.yml ps

# Reiniciar servicios
docker compose -f docker-compose.prod.yml restart

# Detener servicios
docker compose -f docker-compose.prod.yml down

# Detener y eliminar volúmenes
docker compose -f docker-compose.prod.yml down -v
```

### Acceso a Contenedores

```bash
# Acceder al contenedor de la API
docker compose -f docker-compose.prod.yml exec api sh

# Acceder al contenedor del frontend
docker compose -f docker-compose.prod.yml exec web sh
```

### Gestión de Base de Datos

```bash
# Ejecutar migraciones
docker compose -f docker-compose.prod.yml exec api npx prisma db push

# Generar cliente Prisma
docker compose -f docker-compose.prod.yml exec api npx prisma generate

# Abrir Prisma Studio
docker compose -f docker-compose.prod.yml exec api npx prisma studio
```

## 🔧 Solución de Problemas

### La API no inicia

1. Verificar logs:
   ```bash
   docker compose -f docker-compose.prod.yml logs api
   ```

2. Verificar variables de entorno:
   ```bash
   docker compose -f docker-compose.prod.yml exec api env | grep DATABASE_URL
   ```

3. Verificar conectividad con la base de datos:
   ```bash
   docker compose -f docker-compose.prod.yml exec api npx prisma db pull
   ```

### El Frontend no carga

1. Verificar que la API esté funcionando:
   ```bash
   curl http://localhost:3001/health
   ```

2. Verificar logs del frontend:
   ```bash
   docker compose -f docker-compose.prod.yml logs web
   ```

3. Verificar variables de entorno públicas:
   ```bash
   docker compose -f docker-compose.prod.yml exec web env | grep NEXT_PUBLIC
   ```

### Errores de Healthcheck

Si los healthchecks fallan:

1. Aumentar el tiempo de inicio:
   ```yaml
   healthcheck:
     start_period: 60s  # Aumentar de 40s a 60s
   ```

2. Verificar manualmente:
   ```bash
   docker compose -f docker-compose.prod.yml exec api curl http://localhost:3001/health
   ```

## 🔄 Actualización de la Aplicación

Para actualizar a una nueva versión:

```bash
# 1. Detener servicios
docker compose -f docker-compose.prod.yml down

# 2. Obtener últimos cambios (si usas git)
git pull

# 3. Reconstruir imágenes
docker compose -f docker-compose.prod.yml build --no-cache

# 4. Ejecutar migraciones
docker compose -f docker-compose.prod.yml run --rm api npx prisma db push

# 5. Iniciar servicios
docker compose -f docker-compose.prod.yml up -d
```

## 🛡️ Seguridad

### Recomendaciones

1. **Variables de Entorno**: Nunca commitear archivos `.env.production` al repositorio
2. **Credenciales**: Rotar las claves VAPID y JWT periódicamente
3. **Actualizaciones**: Mantener Docker y las dependencias actualizadas
4. **Backups**: Realizar backups regulares de la base de datos
5. **Monitoreo**: Configurar alertas para errores críticos

### Configuración de CORS

En producción, actualizar `CORS_ORIGIN` en `apps/api/.env.production`:

```env
CORS_ORIGIN="https://tu-dominio.com"
```

## 📈 Monitoreo de Rendimiento

### Uso de Recursos

```bash
# Ver uso de CPU y memoria
docker stats

# Ver uso específico de los contenedores
docker stats control_api_prod control_web_prod
```

### Límites de Recursos

Si es necesario limitar recursos, editar `docker-compose.prod.yml`:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## 📞 Soporte

Para problemas o dudas:
- Revisar logs: `docker compose -f docker-compose.prod.yml logs -f`
- Verificar estado: `docker compose -f docker-compose.prod.yml ps`
- Contactar al equipo de desarrollo

## 🎯 URLs de Producción

- **Frontend**: http://localhost:3003
- **API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

> **Nota**: Actualizar estas URLs según el dominio de producción real.
