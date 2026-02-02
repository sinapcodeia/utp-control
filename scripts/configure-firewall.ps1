# PowerShell script to configure Windows Firewall for Supabase connectivity
# Run as Administrator

Write-Host "=== Configuración de Firewall para Supabase ===" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: Este script debe ejecutarse como Administrador" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pasos para ejecutar como Administrador:" -ForegroundColor Yellow
    Write-Host "  1. Presiona Win + X" -ForegroundColor Yellow
    Write-Host "  2. Selecciona 'Windows PowerShell (Admin)' o 'Terminal (Admin)'" -ForegroundColor Yellow
    Write-Host "  3. Ejecuta: cd 'C:\UTP\CONTROL\docs'" -ForegroundColor Yellow
    Write-Host "  4. Ejecuta: .\configure-firewall.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Ejecutando como Administrador" -ForegroundColor Green
Write-Host ""

# Step 1: Remove old rules if they exist
Write-Host "Paso 1: Eliminando reglas antiguas (si existen)..." -ForegroundColor Yellow
Remove-NetFirewallRule -DisplayName "Supabase PostgreSQL" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "Supabase Pooler" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "Supabase PostgreSQL Direct" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "Supabase Pooler Connection" -ErrorAction SilentlyContinue
Write-Host "  Listo" -ForegroundColor Gray
Write-Host ""

# Step 2: Create new firewall rules
Write-Host "Paso 2: Creando nuevas reglas de firewall..." -ForegroundColor Yellow

try {
    # Rule for PostgreSQL direct connection (port 5432)
    New-NetFirewallRule `
        -DisplayName "Supabase PostgreSQL Direct" `
        -Description "Allow outbound connection to Supabase PostgreSQL (port 5432)" `
        -Direction Outbound `
        -RemotePort 5432 `
        -Protocol TCP `
        -Action Allow `
        -Profile Any `
        -Enabled True `
        -ErrorAction Stop | Out-Null
    
    Write-Host "  ✅ Regla 'Supabase PostgreSQL Direct' creada (puerto 5432)" -ForegroundColor Green
    
    # Rule for Pooler connection (port 6543)
    New-NetFirewallRule `
        -DisplayName "Supabase Pooler Connection" `
        -Description "Allow outbound connection to Supabase Pooler (port 6543)" `
        -Direction Outbound `
        -RemotePort 6543 `
        -Protocol TCP `
        -Action Allow `
        -Profile Any `
        -Enabled True `
        -ErrorAction Stop | Out-Null
    
    Write-Host "  ✅ Regla 'Supabase Pooler Connection' creada (puerto 6543)" -ForegroundColor Green
    
}
catch {
    Write-Host "  ❌ Error creando reglas: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Verify rules
Write-Host "Paso 3: Verificando reglas creadas..." -ForegroundColor Yellow
$rules = Get-NetFirewallRule -DisplayName "Supabase*" | Select-Object DisplayName, Enabled, Direction, Action

if ($rules.Count -eq 2) {
    Write-Host ""
    $rules | Format-Table -AutoSize
    Write-Host "✅ Configuración completada exitosamente!" -ForegroundColor Green
}
else {
    Write-Host "  ⚠️  Advertencia: Se esperaban 2 reglas pero se encontraron $($rules.Count)" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Test connectivity
Write-Host "Paso 4: Probando conectividad..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Probando puerto 6543 (Pooler)..." -ForegroundColor Gray
$test6543 = Test-NetConnection -ComputerName "aws-0-sa-east-1.pooler.supabase.com" -Port 6543 -WarningAction SilentlyContinue

if ($test6543.TcpTestSucceeded) {
    Write-Host "  ✅ Puerto 6543 accesible" -ForegroundColor Green
}
else {
    Write-Host "  ❌ Puerto 6543 NO accesible" -ForegroundColor Red
}

Write-Host ""
Write-Host "  Probando puerto 5432 (PostgreSQL)..." -ForegroundColor Gray
$test5432 = Test-NetConnection -ComputerName "aws-0-sa-east-1.pooler.supabase.com" -Port 5432 -WarningAction SilentlyContinue

if ($test5432.TcpTestSucceeded) {
    Write-Host "  ✅ Puerto 5432 accesible" -ForegroundColor Green
}
else {
    Write-Host "  ❌ Puerto 5432 NO accesible" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Siguiente Paso ===" -ForegroundColor Cyan
Write-Host ""

if ($test6543.TcpTestSucceeded -or $test5432.TcpTestSucceeded) {
    Write-Host "Probar conexión a la base de datos:" -ForegroundColor Green
    Write-Host "  cd C:\UTP\CONTROL\apps\api" -ForegroundColor White
    Write-Host "  node test-connection.js" -ForegroundColor White
}
else {
    Write-Host "⚠️  Los puertos no son accesibles. Posibles causas:" -ForegroundColor Yellow
    Write-Host "  1. Antivirus bloqueando la conexión" -ForegroundColor White
    Write-Host "  2. Proxy corporativo" -ForegroundColor White
    Write-Host "  3. VPN requerida" -ForegroundColor White
    Write-Host "  4. Firewall de red corporativa" -ForegroundColor White
    Write-Host ""
    Write-Host "Revisa: C:\UTP\CONTROL\docs\CONNECTIVITY_TROUBLESHOOTING.md" -ForegroundColor Cyan
}

Write-Host ""
