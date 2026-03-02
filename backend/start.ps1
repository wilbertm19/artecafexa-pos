# Windows PowerShell
# Script para iniciar el backend

Write-Host "🚀 Iniciando Backend de ArteCafexa..." -ForegroundColor Green
Write-Host ""

# Verificar si existe el entorno virtual
if (-Not (Test-Path "venv")) {
    Write-Host "⚠️  No se encontró el entorno virtual" -ForegroundColor Yellow
    Write-Host "Creando entorno virtual..." -ForegroundColor Cyan
    python -m venv venv
}

# Activar entorno virtual
Write-Host "📦 Activando entorno virtual..." -ForegroundColor Cyan
& ".\venv\Scripts\Activate.ps1"

# Verificar si existe .env
if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  No se encontró archivo .env" -ForegroundColor Yellow
    Write-Host "Copia .env.example a .env y configúralo con SUPABASE_URL y SUPABASE_KEY" -ForegroundColor Red
    exit 1
}

# Instalar dependencias si es necesario
Write-Host "📚 Verificando dependencias..." -ForegroundColor Cyan
pip install -q -r requirements.txt

# Ejecutar el servidor
Write-Host ""
Write-Host "✨ Iniciando servidor FastAPI..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 URL: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📖 Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

python main.py
