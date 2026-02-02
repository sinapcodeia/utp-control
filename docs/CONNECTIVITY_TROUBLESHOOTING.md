# Diagnóstico y Solución de Conectividad - Supabase

## Fecha: 2026-01-23

## Problema Identificado
La conexión a Supabase falla a pesar de tener configuradas las credenciales correctamente.

## Configuración Actual

### Variables de Entorno

**API (`apps/api/.env`):**
```
DATABASE_URL=postgresql://postgres.mhaqatbmjuqdodaczlmc:zT%238i27%25bBtSD%2B%3F@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.mhaqatbmjuqdodaczlmc:zT%238i27%25bBtSD%2B%3F@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://mhaqatbmjuqdodaczlmc.supabase.co
```

**Web (`apps/web/.env.local`):**
```
NEXT_PUBLIC_SUPABASE_URL=https://mhaqatbmjuqdodaczlmc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_QLG-swRePQ0day0-lQ9ZmQ_b1eFUA2e
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Estado del Firewall
✅ Regla "Supabase Pooler" existente y habilitada

## Pasos de Diagnóstico

### 1. Verificar Reglas de Firewall

Ejecutar como **Administrador**:

```powershell
# Verificar reglas existentes
Get-NetFirewallRule -DisplayName "Supabase*" | Format-Table DisplayName, Enabled, Direction

# Si no existen o están deshabilitadas, crear/habilitar:
New-NetFirewallRule -DisplayName "Supabase PostgreSQL" -Direction Outbound -RemotePort 5432 -Protocol TCP -Action Allow -Profile Any -ErrorAction SilentlyContinue
New-NetFirewallRule -DisplayName "Supabase Pooler" -Direction Outbound -RemotePort 6543 -Protocol TCP -Action Allow -Profile Any -ErrorAction SilentlyContinue

# Habilitar si existen pero están deshabilitadas
Enable-NetFirewallRule -DisplayName "Supabase PostgreSQL"
Enable-NetFirewallRule -DisplayName "Supabase Pooler"
```

### 2. Probar Conectividad de Red

```powershell
# Probar puerto 6543 (Pooler)
Test-NetConnection -ComputerName "aws-0-sa-east-1.pooler.supabase.com" -Port 6543

# Probar puerto 5432 (PostgreSQL directo)
Test-NetConnection -ComputerName "aws-0-sa-east-1.pooler.supabase.com" -Port 5432
```

**Resultado esperado:** `TcpTestSucceeded: True`

### 3. Probar Conexión a la Base de Datos

```bash
cd apps/api
node test-connection.js
```

## Posibles Causas del Problema

### A. Firewall de Windows
- ❌ Reglas no creadas
- ❌ Reglas deshabilitadas
- ⚠️ Perfil de red incorrecto

### B. Antivirus/Seguridad
- Kaspersky, Norton, McAfee bloqueando conexiones salientes
- Windows Defender con configuración restrictiva

### C. Red Corporativa
- Proxy corporativo
- Firewall de red bloqueando puertos 5432/6543
- VPN requerida

### D. Configuración de Supabase
- Credenciales incorrectas
- Base de datos pausada
- IP bloqueada en Supabase

## Soluciones por Orden de Prioridad

### Solución 1: Recrear Reglas de Firewall (PowerShell como Admin)

```powershell
# Eliminar reglas antiguas
Remove-NetFirewallRule -DisplayName "Supabase*" -ErrorAction SilentlyContinue

# Crear reglas nuevas con perfil Any
New-NetFirewallRule `
    -DisplayName "Supabase PostgreSQL Direct" `
    -Direction Outbound `
    -RemotePort 5432 `
    -Protocol TCP `
    -Action Allow `
    -Profile Any `
    -Enabled True

New-NetFirewallRule `
    -DisplayName "Supabase Pooler Connection" `
    -Direction Outbound `
    -RemotePort 6543 `
    -Protocol TCP `
    -Action Allow `
    -Profile Any `
    -Enabled True

# Verificar
Get-NetFirewallRule -DisplayName "Supabase*" | Format-Table
```

### Solución 2: Desactivar Temporalmente Antivirus

1. Abrir Windows Security
2. Virus & threat protection → Manage settings
3. Desactivar "Real-time protection" temporalmente
4. Probar conexión
5. Reactivar protección

### Solución 3: Verificar Proxy/Red

```powershell
# Verificar configuración de proxy
netsh winhttp show proxy

# Si hay proxy, intentar bypass
$env:HTTP_PROXY = ""
$env:HTTPS_PROXY = ""
```

### Solución 4: Usar URL Directa de Supabase

Editar `apps/api/.env` para usar conexión directa sin pooler:

```env
# En lugar del pooler (puerto 6543), usar conexión directa (puerto 5432)
DATABASE_URL="postgresql://postgres.mhaqatbmjuqdodaczlmc:zT%238i27%25bBtSD%2B%3F@db.mhaqatbmjuqdodaczlmc.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres.mhaqatbmjuqdodaczlmc:zT%238i27%25bBtSD%2B%3F@db.mhaqatbmjuqdodaczlmc.supabase.co:5432/postgres"
```

## Script de Verificación Completa

Ejecutar `apps/api/test-connection.js`:
- ✅ Verifica variables de entorno
- ✅ Prueba conexión al pooler (6543)
- ✅ Prueba conexión directa (5432 si está configurada)
- ✅ Verifica acceso a tablas

### 1. Script de Configuración Automatizada

#### [NEW] [configure-firewall.ps1](file:///C:/UTP/CONTROL/scripts/configure-firewall.ps1)

**Funcionalidad:**
- Verifica privilegios de administrador
- Elimina reglas antiguas/duplicadas
- Crea reglas nuevas para puertos 5432 y 6543
- Verifica la configuración
- Prueba conectividad automáticamente

**Uso:**
```powershell
# Como Administrador
cd C:\UTP\CONTROL\scripts
.\configure-firewall.ps1
```
Una vez que `test-connection.js` pase exitosamente:

```bash
# 1. Generar Prisma Client
cd apps/api
npx prisma generate

# 2. Ejecutar migraciones
npx prisma migrate deploy

# 3. Iniciar API
npm run start:dev

# Deberías ver:
# [Nest] LOG [NestFactory] Starting Nest application...
# --- DB CONECTADA EXITOSAMENTE ---
# [Nest] LOG [NestApplication] Nest application successfully started
```

## Notas de Seguridad

⚠️ **IMPORTANTE:** Las credenciales mostradas en este documento son para propósitos de diagnóstico únicamente. En producción:
- Usar variables de entorno seguras
- No commitear archivos `.env` al repositorio
- Rotar credenciales regularmente
- Usar roles de base de datos con permisos mínimos

## Referencias
- [Supabase Connection Strings](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Windows Firewall Configuration](https://learn.microsoft.com/en-us/powershell/module/netsecurity/new-netfirewallrule)
- Documento interno: `docs/FIREWALL_SETUP.md`
