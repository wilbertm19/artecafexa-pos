# Windows PowerShell
# Script para iniciar el frontend

Write-Host "🎨 Iniciando Frontend de ArteCafexa..." -ForegroundColor Green
Write-Host ""

# Verificar si existe node_modules
if (-Not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Cyan
    npm install
}

# Verificar si existe .env.local
if (-Not (Test-Path ".env.local")) {
    Write-Host "⚠️  No se encontró archivo .env.local" -ForegroundColor Yellow
    Write-Host "Creando .env.local con valores por defecto..." -ForegroundColor Cyan
    "NEXT_PUBLIC_API_URL=http://localhost:8000" | Out-File -FilePath ".env.local" -Encoding UTF8
}

# Ejecutar el servidor de desarrollo
Write-Host ""
Write-Host "✨ Iniciando servidor Next.js..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📊 Dashboard: http://localhost:3000/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

npm run dev
