# Script de prueba para endpoints de informes gerenciales
# PowerShell syntax

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA DE ENDPOINTS - UTP CONTROL API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Primero, obtener un token válido
Write-Host "1. Verificando salud del servidor..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://127.0.0.1:3001/health" -Method Get
    Write-Host "✅ Servidor funcionando correctamente" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "❌ Error: Servidor no responde" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# NOTA: Para probar los endpoints protegidos, necesitas un token válido
# Puedes obtenerlo desde el navegador (DevTools > Application > Local Storage > supabase.auth.token)

Write-Host "2. Para probar endpoints protegidos, necesitas un token de Supabase" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pasos para obtener el token:" -ForegroundColor Cyan
Write-Host "  1. Abre http://localhost:3000 en el navegador" -ForegroundColor White
Write-Host "  2. Inicia sesión" -ForegroundColor White
Write-Host "  3. Abre DevTools (F12)" -ForegroundColor White
Write-Host "  4. Ve a Application > Local Storage > http://localhost:3000" -ForegroundColor White
Write-Host "  5. Busca 'sb-mhaqatbmjuqdodaczlmc-auth-token'" -ForegroundColor White
Write-Host "  6. Copia el valor del campo 'access_token'" -ForegroundColor White
Write-Host ""

# Ejemplo de cómo usar el token (descomenta y reemplaza YOUR_TOKEN)
# $token = "TU_TOKEN_AQUI"
# $headers = @{
#     "Authorization" = "Bearer $token"
# }

# Write-Host "3. Probando endpoint de informes gerenciales..." -ForegroundColor Yellow
# try {
#     $complianceReport = Invoke-RestMethod -Uri "http://127.0.0.1:3001/reports/advanced/visits-compliance" -Method Get -Headers $headers
#     Write-Host "✅ Informe de cumplimiento obtenido" -ForegroundColor Green
#     Write-Host ""
#     Write-Host "Métricas Nacionales:" -ForegroundColor Cyan
#     Write-Host "  Total Visitas: $($complianceReport.national.totalVisits)" -ForegroundColor White
#     Write-Host "  Completadas: $($complianceReport.national.completedVisits)" -ForegroundColor White
#     Write-Host "  Tasa de Cumplimiento: $($complianceReport.national.completionRate)%" -ForegroundColor White
#     Write-Host ""
# } catch {
#     Write-Host "❌ Error al obtener informe" -ForegroundColor Red
#     Write-Host $_.Exception.Message
# }

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ENDPOINTS DISPONIBLES:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Informes Gerenciales (requieren autenticación):" -ForegroundColor Yellow
Write-Host "  GET /reports/advanced/visits-compliance" -ForegroundColor White
Write-Host "  GET /reports/advanced/territorial-coverage" -ForegroundColor White
Write-Host "  GET /reports/advanced/reach-projection" -ForegroundColor White
Write-Host "  GET /reports/advanced/executive-dashboard" -ForegroundColor White
Write-Host ""
Write-Host "Usuarios y Directorio:" -ForegroundColor Yellow
Write-Host "  GET /users" -ForegroundColor White
Write-Host "  GET /users/me" -ForegroundColor White
Write-Host ""
Write-Host "Visitas:" -ForegroundColor Yellow
Write-Host "  GET /territory/visits" -ForegroundColor White
Write-Host "  GET /territory/my-visits" -ForegroundColor White
Write-Host ""
Write-Host "Salud del Sistema:" -ForegroundColor Yellow
Write-Host "  GET /health" -ForegroundColor White
Write-Host "  GET /audit/health" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Para continuar, abre el navegador en:" -ForegroundColor Green
Write-Host "  http://localhost:3000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
