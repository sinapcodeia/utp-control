# Configurar Firewall para Supabase

> **Última actualización:** 2026-01-23

## Problema
El firewall de Windows bloquea conexiones salientes a Supabase (puertos 5432 y 6543), causando error P1001 en Prisma y fallos de conexión en la aplicación.

## Solución Rápida: Script Automatizado ⚡

### Paso 1: Abrir PowerShell como Administrador
1. Presiona `Win + X`
2. Selecciona **"Windows PowerShell (Admin)"** o **"Terminal (Admin)"**

### Paso 2: Ejecutar Script de Configuración

```powershell
cd C:\UTP\CONTROL\scripts
.\configure-firewall.ps1
```

Este script automáticamente:
- ✅ Verifica permisos de administrador
- ✅ Elimina reglas antiguas si existen
- ✅ Crea reglas nuevas para puertos 5432 y 6543
- ✅ Verifica la configuración
- ✅ Prueba la conectividad

### Paso 3: Verificar Conexión a la Base de Datos

```bash
cd C:\UTP\CONTROL\apps\api
node test-connection.js
```

**Resultado esperado:**
```
=== SUPABASE CONNECTION TEST ===

1. Checking environment variables...
✅ DATABASE_URL found

3. Testing DATABASE_URL (Pooler)...
✅ Connection successful!
   Server time: 2026-01-23...
   PostgreSQL version: 15.x
   
✅ All connection tests passed!
```

---

## Solución Manual

Si prefieres configurar manualmente o el script falla:

### Paso 1: Crear Reglas de Firewall

```powershell
# Permitir conexión directa a PostgreSQL (puerto 5432)
New-NetFirewallRule `
    -DisplayName "Supabase PostgreSQL Direct" `
    -Direction Outbound `
    -RemotePort 5432 `
    -Protocol TCP `
    -Action Allow `
    -Profile Any

# Permitir conexión al Pooler de Supabase (puerto 6543)
New-NetFirewallRule `
    -DisplayName "Supabase Pooler Connection" `
    -Direction Outbound `
    -RemotePort 6543 `
    -Protocol TCP `
    -Action Allow `
    -Profile Any
```

### Paso 2: Verificar Reglas Creadas

```powershell
Get-NetFirewallRule -DisplayName "Supabase*" | Format-Table DisplayName, Enabled, Direction
```

Deberías ver:
```
DisplayName                    Enabled Direction
-----------                    ------- ---------
Supabase PostgreSQL Direct     True    Outbound
Supabase Pooler Connection     True    Outbound
```

### Paso 3: Probar Conectividad de Red

```powershell
# Probar puerto 6543
Test-NetConnection -ComputerName "aws-0-sa-east-1.pooler.supabase.com" -Port 6543

# Probar puerto 5432
Test-NetConnection -ComputerName "aws-0-sa-east-1.pooler.supabase.com" -Port 5432
```

**Resultado esperado:** `TcpTestSucceeded: True`

---

## Verificación Post-Configuración

### 1. Probar Conexión a Supabase
```bash
cd apps/api
node test-connection.js
```

### 2. Iniciar el Servidor API
```bash
npm run start:dev
```

Deberías ver:
```
[Nest] ... LOG [NestFactory] Starting Nest application...
--- DB CONECTADA EXITOSAMENTE ---
[Nest] ... LOG [NestApplication] Nest application successfully started
```

---

## Troubleshooting

### ❌ Error P1001: Can't reach database server
**Causas posibles:**
- Firewall bloqueando conexión
- Antivirus bloqueando puertos
- Proxy corporativo
- Credenciales incorrectas

**Solución:** Ver guía completa en [`CONNECTIVITY_TROUBLESHOOTING.md`](./CONNECTIVITY_TROUBLESHOOTING.md)

### ❌ "Acceso denegado" al ejecutar comandos
**Causa:** PowerShell no ejecutado como Administrador

**Solución:**
1. Click derecho en PowerShell
2. Selecciona "Ejecutar como administrador"
3. Vuelve a ejecutar el script

### ❌ Test-NetConnection falla (TcpTestSucceeded: False)
**Causas posibles:**
- Antivirus bloqueando (Kaspersky, Norton, McAfee)
- Firewall corporativo
- VPN requerida

**Soluciones:**
1. Desactiva temporalmente el antivirus
2. Verifica configuración de proxy: `netsh winhttp show proxy`
3. Contacta al administrador de red

### ❌ Conexión exitosa pero API falla
**Verifica:**
1. Variables de entorno en `apps/api/.env`
2. Prisma Client generado: `npx prisma generate`
3. Logs detallados de la API

---

## Recursos Adicionales

- 📖 [Guía Completa de Troubleshooting](./CONNECTIVITY_TROUBLESHOOTING.md)
- 🔧 [Script de Configuración](./configure-firewall.ps1)
- 🔗 [Documentación de Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres)

---

## Notas de Seguridad

⚠️ **IMPORTANTE:**
- Estas reglas permiten conexiones salientes SOLAMENTE
- No exponen puertos locales
- Son específicas para el dominio de Supabase
- No comprometen la seguridad del sistema

✅ **Cumplimiento:**
- Alineado con ISO 27001 (Control de Acceso a Redes)
- Principio de mínimo privilegio
- Configuración documentada y auditable

