# Windows PowerShell
# Script maestro para iniciar Backend y Frontend simultáneamente

Write-Host ""
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ☕ ArteCafexa - Sistema POS Completo" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la raíz del proyecto
if (-Not (Test-Path "backend") -or -Not (Test-Path "frontend")) {
    Write-Host "❌ Error: Ejecuta este script desde la raíz del proyecto" -ForegroundColor Red
    Write-Host "   Carpeta actual: $PWD" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔍 Verificando configuración..." -ForegroundColor Cyan
Write-Host ""

# Verificar backend
if (-Not (Test-Path "backend\.env")) {
    Write-Host "⚠️  Falta: backend\.env" -ForegroundColor Yellow
    Write-Host "   Copia backend\.env.example a backend\.env y configúralo con SUPABASE_URL y SUPABASE_KEY" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Configuración del backend completa" -ForegroundColor Green

# Verificar frontend (crear .env.local si no existe)
if (-Not (Test-Path "frontend\.env.local")) {
    Write-Host "⚠️  Creando frontend\.env.local..." -ForegroundColor Yellow
    "NEXT_PUBLIC_API_URL=http://localhost:8000" | Out-File -FilePath "frontend\.env.local" -Encoding UTF8
}

Write-Host "✅ Configuración del frontend completa" -ForegroundColor Green
Write-Host ""

# Iniciar Backend en nueva ventana
Write-Host "🚀 Iniciando Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList `
    "-NoExit", `
    "-Command", `
    "cd '$PWD\backend'; .\start.ps1"

Write-Host "   ⏳ Esperando 5 segundos para que el backend inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Iniciar Frontend en nueva ventana
Write-Host "🎨 Iniciando Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList `
    "-NoExit", `
    "-Command", `
    "cd '$PWD\frontend'; .\start.ps1"

Write-Host ""
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✨ ¡Sistema Iniciado Correctamente!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 URLs del Sistema:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Backend API:      http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs:         http://localhost:8000/docs" -ForegroundColor White
Write-Host "   Frontend POS:     http://localhost:3000" -ForegroundColor White
Write-Host "   Dashboard:        http://localhost:3000/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "💡 Consejos:" -ForegroundColor Yellow
Write-Host "   • Se abrieron 2 ventanas de PowerShell (Backend y Frontend)" -ForegroundColor Gray
Write-Host "   • Presiona Ctrl+C en cada ventana para detener los servicios" -ForegroundColor Gray
Write-Host "   • Los cambios en el código se recargan automáticamente" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 ¡Listo para empezar a vender! ☕" -ForegroundColor Green
Write-Host ""
