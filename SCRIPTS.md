# 🔧 Utilidades y Scripts

Esta carpeta contiene scripts útiles para desarrollo y testing.

## Scripts Disponibles

### Backend

#### `test_connection.py`
Prueba la conexión con Google Sheets y verifica la configuración.

**Uso:**
```powershell
cd backend
python test_connection.py
```

**Verifica:**
- ✅ Autenticación con Google
- ✅ Acceso al spreadsheet
- ✅ Existencia de pestañas requeridas
- ✅ Lectura de datos

#### `start.ps1`
Script PowerShell para iniciar el backend automáticamente.

**Uso:**
```powershell
cd backend
.\start.ps1
```

**Hace:**
- Crea el entorno virtual si no existe
- Activa el entorno virtual
- Verifica archivos de configuración
- Instala dependencias
- Inicia el servidor

---

### Frontend

#### `start.ps1`
Script PowerShell para iniciar el frontend automáticamente.

**Uso:**
```powershell
cd frontend
.\start.ps1
```

**Hace:**
- Instala dependencias si no existen
- Crea .env.local si no existe
- Inicia el servidor de desarrollo

---

## 🚀 Inicio Rápido con Scripts

### Opción 1: Manual (Dos terminales)

**Terminal 1 - Backend:**
```powershell
cd backend
.\start.ps1
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
.\start.ps1
```

### Opción 2: Todo en uno

Puedes crear un script maestro en la raíz del proyecto:

**`start-all.ps1`:**
```powershell
# Inicia backend en ventana nueva
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\start.ps1"

# Espera 5 segundos para que el backend inicie
Start-Sleep -Seconds 5

# Inicia frontend en ventana nueva
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; .\start.ps1"

Write-Host "✨ Sistema iniciado!" -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
```

---

## 🧪 Testing y Debugging

### Probar Endpoints Manualmente

Usando PowerShell:

```powershell
# GET /products
Invoke-WebRequest -Uri "http://localhost:8000/products" | Select-Object -Expand Content

# GET /inventory
Invoke-WebRequest -Uri "http://localhost:8000/inventory" | Select-Object -Expand Content

# POST /sales
$body = @{
    producto_id = "espresso"
    cantidad = 1
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/sales" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

Usando cURL (Git Bash o WSL):

```bash
# GET /products
curl http://localhost:8000/products

# POST /sales
curl -X POST http://localhost:8000/sales \
  -H "Content-Type: application/json" \
  -d '{"producto_id": "espresso", "cantidad": 1}'
```

---

## 🔍 Logs y Debugging

### Ver logs del Backend:
Los logs aparecen en la terminal donde corre el backend.

### Ver logs del Frontend:
1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña "Console"
3. Verás los logs de SWR y las llamadas a la API

### Habilitar logs detallados:

**Backend** - Agregar en `main.py`:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Frontend** - Agregar en `lib/api.ts`:
```typescript
export async function fetchProducts(): Promise<Product[]> {
  console.log('Fetching products...')
  const response = await fetch(`${API_BASE_URL}/products`)
  console.log('Response:', response)
  // ... resto del código
}
```

---

## 🛠️ Problemas Comunes y Soluciones

### "No se puede ejecutar scripts en este sistema"

**Error:**
```
.\start.ps1 : No se puede cargar el archivo ... porque la ejecución de scripts está deshabilitada...
```

**Solución:**
```powershell
# Abrir PowerShell como Administrador y ejecutar:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Puerto 8000 ya en uso

**Solución:**
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :8000

# Matar el proceso (reemplaza PID con el número que aparece)
taskkill /PID <PID> /F
```

### Puerto 3000 ya en uso

**Solución:**
```powershell
# Next.js automáticamente usará 3001 si 3000 está ocupado
# O puedes especificar otro puerto:
npm run dev -- -p 3001
```

---

## 📊 Monitoreo en Producción

Para un entorno de producción, considera:

### Backend:
- Usar Gunicorn con múltiples workers
- Implementar logging a archivos
- Usar herramientas como Sentry para errores
- Monitorear con Prometheus + Grafana

### Frontend:
- Build optimizado: `npm run build`
- Usar variables de entorno de producción
- Implementar analytics (Google Analytics, Plausible)
- Monitorear rendimiento con Vercel Analytics

---

## 🎯 Scripts Personalizados

Puedes crear tus propios scripts para tareas comunes:

### Backup del Google Sheet:

```python
# backend/backup_sheet.py
from main import get_sheet
from config import settings
import json
from datetime import datetime

def backup():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    for sheet_name in [settings.INVENTORY_SHEET, settings.RECIPES_SHEET, settings.SALES_SHEET]:
        sheet = get_sheet(sheet_name)
        data = sheet.get_all_records()
        
        with open(f"backup_{sheet_name}_{timestamp}.json", "w") as f:
            json.dump(data, f, indent=2)
    
    print(f"✅ Backup completado: {timestamp}")

if __name__ == "__main__":
    backup()
```

### Poblar datos de prueba:

```python
# backend/seed_data.py
from main import get_sheet
from config import settings

def seed():
    # Agregar productos de ejemplo
    recipes_sheet = get_sheet(settings.RECIPES_SHEET)
    
    test_products = [
        ["Café de Prueba", 5.00, "Café Arábica", 0.020],
        # ... más productos
    ]
    
    for product in test_products:
        recipes_sheet.append_row(product)
    
    print("✅ Datos de prueba agregados")

if __name__ == "__main__":
    seed()
```

---

¡Usa estos scripts para acelerar tu desarrollo! 🚀
