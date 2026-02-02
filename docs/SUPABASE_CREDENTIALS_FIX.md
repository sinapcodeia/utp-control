# Diagnóstico de Credenciales de Supabase

## Error Actual
```
❌ Connection failed for DATABASE_URL (Pooler)
   Error: Tenant or user not found
   Code: XX000
```

## ✅ Buenas Noticias
**El firewall NO está bloqueando** - La conexión llegó al servidor de Supabase exitosamente.

## ❌ Problema Identificado
El error `XX000: Tenant or user not found` significa:
- El proyecto Supabase no existe
- El proyecto está pausado/eliminado
- Las credenciales son incorrectas

## Información de tu Conexión

**Project Reference:** `mhaqatbmjuqdodaczlmc`  
**Región:** `sa-east-1` (São Paulo)  
**Usuario:** `postgres.mhaqatbmjuqdodaczlmc`

## Pasos para Verificar en Supabase

### 1. Acceder al Dashboard
Ve a: **https://supabase.com/dashboard**

### 2. Verificar que el Proyecto Existe
- Busca el proyecto: `mhaqatbmjuqdodaczlmc`
- Si NO aparece en la lista: El proyecto fue eliminado o el nombre es incorrecto

### 3. Verificar Estado del Proyecto
Si el proyecto existe:
- ❓ ¿Está pausado? → Reactívalo
- ❓ ¿Está activo? → Verifica las credenciales

### 4. Obtener Credenciales Correctas

**En el Dashboard:**
1. Selecciona tu proyecto
2. Ve a: **Settings** → **Database**
3. En la sección "Connection string", selecciona:
   - **Connection pooling** (si quieres usar pooler)
   - O **Direct connection** (para conexión directa)

4. Copia la URI completa que se muestra

**Formato esperado:**
```
# Pooler (recomendado)
postgresql://postgres.PROJECT_REF:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

# Directo
postgresql://postgres:[YOUR-PASSWORD]@db.PROJECT_REF.supabase.co:5432/postgres
```

### 5. Actualizar .env

Edita: `C:\UTP\CONTROL\apps\api\.env`

```env
# Reemplaza con la URI correcta de Supabase Dashboard
DATABASE_URL="postgresql://postgres.PROJECT_REF:[PASSWORD]@HOST:PORT/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@HOST:PORT/postgres"

# Actualiza también la URL del proyecto
SUPABASE_URL="https://PROJECT_REF.supabase.co"
```

**⚠️ IMPORTANTE:** Si la contraseña contiene caracteres especiales, codifícalos:
- `#` → `%23`
- `%` → `%25`
- `+` → `%2B`
- `?` → `%3F`
- `@` → `%40`

### 6. Probar Nuevamente

```bash
cd C:\UTP\CONTROL\apps\api
node test-connection.js
```

## Escenarios Comunes

### Escenario A: Proyecto Eliminado o No Existe
**Solución:** Crear nuevo proyecto en Supabase
1. Ve a https://supabase.com/dashboard
2. Click en "New Project"
3. Selecciona región: South America (sa-east-1)
4. Configura nombre y contraseña
5. Copia las credenciales al .env

### Escenario B: Proyecto Pausado
**Solución:** Reactivar proyecto
1. En Dashboard, selecciona el proyecto
2. Si ves banner "Project paused", click "Restore"
3. Espera a que el proyecto esté activo
4. Prueba la conexión nuevamente

### Escenario C: Credenciales Incorrectas
**Solución:** Resetear contraseña de base de datos
1. Ve a Settings → Database
2. Click en "Reset database password"
3. Genera nueva contraseña
4. Actualiza .env con nueva contraseña (encoded)

### Escenario D: Cambio de Región/Proyecto
**Solución:** Verificar Project Ref
1. En Dashboard, verifica el Project Reference
2. La URL debe ser: `https://PROJECT_REF.supabase.co`
3. El connection string debe incluir el mismo PROJECT_REF
4. Si no coincide, copia el correcto del Dashboard

## Si Necesitas Crear un Nuevo Proyecto

### Configuración Recomendada:
- **Nombre:** UTP Control
- **Región:** South America (sa-east-1) - Para mejor latencia en Américas
- **Database Password:** Guarda en lugar seguro
- **Plan:** Free tier es suficiente para desarrollo

### Después de Crear el Proyecto:
1. Ve a Settings → Database
2. Copia "Connection string" (con pooling)
3. Actualiza `apps/api/.env` con las nuevas credenciales
4. Ejecuta migraciones: `npx prisma migrate deploy`
5. (Opcional) Ejecuta seed: `npm run seed`

## Checklist de Verificación

- [ ] Proyecto existe en Supabase Dashboard
- [ ] Proyecto está activo (no pausado)
- [ ] Connection string copiada del Dashboard
- [ ] Password codificada correctamente en .env
- [ ] Project Reference coincide en SUPABASE_URL
- [ ] test-connection.js pasa exitosamente

## Siguiente Paso

**Después de actualizar .env:**
```bash
cd C:\UTP\CONTROL\apps\api
node test-connection.js
```

**Si pasa exitosamente:**
```bash
# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# Iniciar API
npm run start:dev
```
