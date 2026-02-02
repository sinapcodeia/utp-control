# Script para verificar credenciales de Supabase
# ================================================

Write-Host "=== Verificación de Credenciales de Supabase ===" -ForegroundColor Cyan
Write-Host ""

# Verificar si el archivo .env existe
$envPath = "C:\UTP\CONTROL\apps\api\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ Archivo .env no encontrado en: $envPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green
Write-Host ""

# Leer y parsear el archivo .env
$envContent = Get-Content $envPath
$dbUrl = ($envContent | Select-String "^DATABASE_URL=").ToString().Replace("DATABASE_URL=", "").Trim('"')

if ($dbUrl -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
    $user = $matches[1]
    $password = $matches[2]
    $host = $matches[3]
    $port = $matches[4]
    $database = $matches[5]
    
    Write-Host "Información de Conexión:" -ForegroundColor Yellow
    Write-Host "  Usuario:  $user" -ForegroundColor White
    Write-Host "  Password: $(if($password.Length -gt 0){'*****(' + $password.Length + ' chars)'}else{'VACÍO'})" -ForegroundColor White
    Write-Host "  Host:     $host" -ForegroundColor White
    Write-Host "  Puerto:   $port" -ForegroundColor White
    Write-Host "  Database: $database" -ForegroundColor White
    Write-Host ""
    
    # Extraer el Project Ref
    if ($user -match "postgres\.(.+)") {
        $projectRef = $matches[1]
        Write-Host "Project Reference: $projectRef" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "URLs de Supabase Dashboard:" -ForegroundColor Yellow
        Write-Host "  Dashboard: https://supabase.com/dashboard/project/$projectRef" -ForegroundColor White
        Write-Host "  Settings:  https://supabase.com/dashboard/project/$projectRef/settings/database" -ForegroundColor White
        Write-Host ""
    }
    
    # Verificar estructura del host
    if ($host -match "aws-0-([^.]+)\.pooler\.supabase\.com") {
        $region = $matches[1]
        Write-Host "✅ Formato de host correcto" -ForegroundColor Green
        Write-Host "   Región: $region" -ForegroundColor Gray
    }
    else {
        Write-Host "⚠️  Formato de host inusual: $host" -ForegroundColor Yellow
    }
    
}
else {
    Write-Host "❌ No se pudo parsear DATABASE_URL" -ForegroundColor Red
    Write-Host "   Formato esperado: postgresql://user:pass@host:port/db" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Pasos para Verificar en Supabase ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Ve a: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Inicia sesión con tu cuenta" -ForegroundColor White
Write-Host "3. Verifica que el proyecto existe y está activo" -ForegroundColor White
Write-Host "4. Ve a Settings > Database" -ForegroundColor White
Write-Host "5. Verifica:" -ForegroundColor White
Write-Host "   - Connection string (debe coincidir con tu DATABASE_URL)" -ForegroundColor Gray
Write-Host "   - Database password (si la cambiaste, actualiza .env)" -ForegroundColor Gray
Write-Host "   - Project no está pausado" -ForegroundColor Gray
Write-Host ""

Write-Host "=== Acción Recomendada ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si el proyecto está pausado o no existe:" -ForegroundColor Yellow
Write-Host "  → Reactiva el proyecto o crea uno nuevo en Supabase" -ForegroundColor White
Write-Host ""
Write-Host "Si las credenciales son incorrectas:" -ForegroundColor Yellow
Write-Host "  → Copia la Connection String correcta desde Supabase Dashboard" -ForegroundColor White
Write-Host "  → Actualiza el archivo .env con las credenciales correctas" -ForegroundColor White
Write-Host ""
