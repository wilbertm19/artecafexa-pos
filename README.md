# 🍕 ArteCafexa - Sistema POS para Cafetería

Sistema completo de gestión de punto de venta (POS) para la cafetería ArteCafexa, desarrollado con **FastAPI** (Backend) y **Next.js 14** (Frontend), utilizando **Google Sheets** como base de datos temporal.

## 📋 Características

### Backend (FastAPI)
- ✅ API REST completa con FastAPI
- ✅ Integración con Google Sheets mediante `gspread`
- ✅ Validación de datos con Pydantic
- ✅ Gestión automática de inventario
- ✅ Sistema de alertas de stock mínimo
- ✅ CORS configurado para desarrollo local

### Frontend (Next.js 14)
- ✅ Interfaz Mobile First optimizada
- ✅ POS con botones grandes y táctiles
- ✅ Dashboard administrativo con KPIs
- ✅ Actualización en tiempo real con SWR
- ✅ Diseño moderno con Tailwind CSS
- ✅ Iconos con Lucide React

## 🏗️ Estructura del Proyecto

```
pos2/
├── backend/
│   ├── main.py                 # API principal de FastAPI
│   ├── models.py               # Modelos Pydantic
│   ├── config.py               # Configuración
│   ├── requirements.txt        # Dependencias Python
│   └── .env.example           # Plantilla de variables de entorno
│
└── frontend/
    ├── app/
    │   ├── layout.tsx          # Layout principal
    │   ├── page.tsx            # Página POS
    │   ├── dashboard/
    │   │   └── page.tsx        # Dashboard administrativo
    │   └── globals.css         # Estilos globales
    ├── components/
    │   ├── ProductButton.tsx   # Botón de producto
    │   ├── SaleModal.tsx       # Modal de confirmación
    │   └── InventoryTable.tsx  # Tabla de inventario
    ├── lib/
    │   └── api.ts              # Cliente API
    ├── package.json
    ├── tailwind.config.js
    └── .env.example
```

---

## 🚀 Configuración Completa

### 1. Configurar Google Cloud Console y Service Account

#### Paso 1.1: Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en el selector de proyectos (parte superior)
3. Clic en **"Nuevo Proyecto"**
4. Nombre: `ArteCafexa` (o el que prefieras)
5. Clic en **"Crear"**

#### Paso 1.2: Habilitar APIs necesarias

1. En el menú lateral, ve a **"APIs y servicios" > "Biblioteca"**
2. Busca y habilita las siguientes APIs:
   - **Google Sheets API**
   - **Google Drive API**

#### Paso 1.3: Crear Service Account

1. Ve a **"APIs y servicios" > "Credenciales"**
2. Clic en **"Crear credenciales"** → **"Cuenta de servicio"**
3. Completa:
   - **Nombre**: `artecafexa-service-account`
   - **Descripción**: `Cuenta para acceso a Google Sheets`
4. Clic en **"Crear y continuar"**
5. En **"Rol"**, selecciona: **Editor** (o un rol más restrictivo si prefieres)
6. Clic en **"Continuar"** y luego **"Listo"**

#### Paso 1.4: Descargar credenciales JSON

1. En la lista de cuentas de servicio, haz clic en la que acabas de crear
2. Ve a la pestaña **"Claves"**
3. Clic en **"Agregar clave" > "Crear clave nueva"**
4. Selecciona formato **JSON**
5. Clic en **"Crear"** (se descargará automáticamente)
6. **Guarda este archivo** como `credentials.json` en la carpeta `backend/`

⚠️ **IMPORTANTE**: Este archivo contiene información sensible. **NO lo subas a GitHub**.

---

### 2. Configurar Google Sheets

#### Paso 2.1: Crear el Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nómbrala: **"ArteCafexa - Gestión"**

#### Paso 2.2: Compartir con Service Account

1. Abre el archivo `credentials.json` que descargaste
2. Busca el campo `"client_email"` (algo como `artecafexa-service-account@...iam.gserviceaccount.com`)
3. En tu Google Sheet, haz clic en **"Compartir"**
4. Pega el email de la service account
5. Asegúrate de darle permisos de **Editor**
6. Desmarca "Notificar a las personas" si aparece
7. Clic en **"Compartir"**

#### Paso 2.3: Obtener el ID del Sheet

En la URL de tu Google Sheet:
```
https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
```

Copia el ID (la parte entre `/d/` y `/edit`)

#### Paso 2.4: Crear las pestañas necesarias

Crea **3 pestañas** con los siguientes nombres y estructuras:

##### **Pestaña 1: "Inventario"**

| Insumo | Cantidad | Unidad | StockMinimo |
|--------|----------|--------|-------------|
| Café Arábica | 5.0 | kg | 2.0 |
| Leche Entera | 10.0 | L | 3.0 |
| Azúcar | 3.0 | kg | 1.0 |
| Cacao en Polvo | 0.8 | kg | 0.3 |
| Canela | 0.2 | kg | 0.1 |

##### **Pestaña 2: "Recetas"**

| Producto | Precio | Insumo | Cantidad |
|----------|--------|--------|----------|
| Espresso | 2.50 | Café Arábica | 0.018 |
| Cappuccino | 3.50 | Café Arábica | 0.018 |
| Cappuccino | 3.50 | Leche Entera | 0.120 |
| Latte | 4.00 | Café Arábica | 0.018 |
| Latte | 4.00 | Leche Entera | 0.180 |
| Mocha | 4.50 | Café Arábica | 0.018 |
| Mocha | 4.50 | Leche Entera | 0.120 |
| Mocha | 4.50 | Cacao en Polvo | 0.020 |

##### **Pestaña 3: "Ventas"**

| Fecha | Producto | Cantidad | PrecioUnitario | Total |
|-------|----------|----------|----------------|-------|
| 2026-02-28 10:30:00 | Espresso | 1 | 2.50 | 2.50 |

*(Esta pestaña se irá llenando automáticamente con las ventas)*

---

### 3. Configurar Backend

#### Paso 3.1: Instalar Python

Asegúrate de tener **Python 3.9+** instalado:

```powershell
python --version
```

#### Paso 3.2: Crear entorno virtual

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
```

#### Paso 3.3: Instalar dependencias

```powershell
pip install -r requirements.txt
```

#### Paso 3.4: Configurar variables de entorno

1. Copia el archivo de ejemplo:
```powershell
cp .env.example .env
```

2. Edita el archivo `.env` y completa:

```env
GOOGLE_SHEET_ID=tu_id_del_google_sheet_aqui
GOOGLE_CREDENTIALS_FILE=credentials.json
```

#### Paso 3.5: Verificar que `credentials.json` esté en la carpeta

Asegúrate de que el archivo `credentials.json` esté en la carpeta `backend/`

#### Paso 3.6: Ejecutar el servidor

```powershell
python main.py
```

O con uvicorn:

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El servidor estará disponible en: **http://localhost:8000**

#### Paso 3.7: Verificar funcionamiento

Abre en tu navegador:
- **http://localhost:8000** - Información de la API
- **http://localhost:8000/docs** - Documentación interactiva (Swagger UI)
- **http://localhost:8000/products** - Lista de productos

---

### 4. Configurar Frontend

#### Paso 4.1: Instalar Node.js

Asegúrate de tener **Node.js 18+** instalado:

```powershell
node --version
```

#### Paso 4.2: Instalar dependencias

Abre una **nueva terminal PowerShell** (deja el backend corriendo):

```powershell
cd ..\frontend
npm install
```

#### Paso 4.3: Configurar variables de entorno

1. Copia el archivo de ejemplo:
```powershell
cp .env.example .env.local
```

2. Edita el archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Paso 4.4: Ejecutar el servidor de desarrollo

```powershell
npm run dev
```

El frontend estará disponible en: **http://localhost:3000**

---

## 🎯 Uso del Sistema

### Interfaz de Ventas (POS)

1. Abre **http://localhost:3000**
2. Verás todos los productos disponibles en botones grandes
3. Haz clic en un producto para abrir el modal de venta
4. Ajusta la cantidad con los botones **+** y **-**
5. Haz clic en **"Confirmar Venta"**
6. El sistema validará el stock y registrará la venta

### Dashboard Administrativo

1. Haz clic en el botón **"Dashboard"** en la parte superior derecha
2. Verás:
   - **Total de Insumos**: Cantidad de items en inventario
   - **Alertas de Stock**: Items con stock bajo
   - **Tabla de Inventario**: Con colores dinámicos según el nivel de stock
     - 🟢 Verde: Stock suficiente
     - 🟡 Amarillo: Stock bajo (50-100% del mínimo)
     - 🔴 Rojo: Stock crítico (menos del 50% del mínimo)

---

## 📡 Endpoints de la API

### `GET /products`
Retorna lista de productos con sus recetas.

**Respuesta ejemplo:**
```json
[
  {
    "id": "espresso",
    "nombre": "Espresso",
    "precio": 2.5,
    "receta": [
      {"insumo": "Café Arábica", "cantidad": 0.018}
    ]
  }
]
```

### `GET /inventory`
Retorna el inventario actual con alertas.

**Respuesta ejemplo:**
```json
{
  "inventory": [
    {
      "insumo": "Café Arábica",
      "cantidad": 5.0,
      "unidad": "kg",
      "stock_minimo": 2.0,
      "alerta": false
    }
  ],
  "alerts": [],
  "total_items": 5,
  "items_with_alerts": 0
}
```

### `POST /sales`
Registra una venta.

**Body:**
```json
{
  "producto_id": "espresso",
  "cantidad": 1
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Venta registrada exitosamente: 1x Espresso",
  "venta_id": "2026-02-28 10:30:00",
  "total": 2.5
}
```

**Error de stock:**
```json
{
  "detail": {
    "message": "Stock insuficiente",
    "items": [
      {
        "insumo": "Café Arábica",
        "necesaria": 0.018,
        "disponible": 0.010,
        "faltante": 0.008
      }
    ]
  }
}
```

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **FastAPI** 0.109.0 - Framework web moderno
- **gspread** 5.12.4 - Cliente Python para Google Sheets
- **Pydantic** 2.5.3 - Validación de datos
- **Uvicorn** 0.27.0 - Servidor ASGI

### Frontend
- **Next.js** 14.1.0 - Framework React
- **React** 18.2.0 - Biblioteca UI
- **Tailwind CSS** 3.4.1 - Framework CSS
- **SWR** 2.2.4 - Data fetching y caché
- **Lucide React** 0.311.0 - Iconos
- **TypeScript** 5.3.3 - Tipado estático

---

## 📝 Notas Adicionales

### Limitaciones de Google Sheets
- **Rate Limits**: Google Sheets tiene límites de requests por minuto
- **Latencia**: Las operaciones pueden tomar 1-3 segundos
- **Concurrencia**: No es ideal para múltiples usuarios simultáneos

### Recomendaciones para Producción
Para un despliegue real, considera:
1. Migrar a una base de datos real (PostgreSQL, MySQL)
2. Implementar autenticación (JWT, OAuth)
3. Agregar logs y monitoreo
4. Configurar SSL/HTTPS
5. Implementar cache (Redis)
6. Agregar tests automatizados

### Seguridad
- ⚠️ **NUNCA** subas `credentials.json` ni `.env` a GitHub
- Agrega estos archivos a `.gitignore`
- Usa variables de entorno en producción

---

## 🐛 Troubleshooting

### Error: "Error al conectar con Google Sheets"
- Verifica que `credentials.json` exista en `backend/`
- Verifica que el GOOGLE_SHEET_ID en `.env` sea correcto
- Verifica que hayas compartido el Sheet con el service account

### Error: "Pestaña 'X' no encontrada"
- Verifica que las pestañas se llamen exactamente: **Inventario**, **Recetas**, **Ventas**
- Los nombres son case-sensitive

### Error: "CORS"
- Verifica que el backend esté corriendo en `http://localhost:8000`
- Verifica que el frontend tenga configurado `NEXT_PUBLIC_API_URL` correctamente

### El frontend no carga productos
- Verifica que el backend esté corriendo
- Abre la consola del navegador (F12) para ver errores
- Verifica que las llamadas a la API estén llegando correctamente

---

## 📧 Contacto y Soporte

Para dudas o consultas sobre este proyecto:
- Revisa la documentación interactiva en `/docs`
- Verifica los logs del backend
- Revisa la consola del navegador para errores del frontend

---

## 📄 Licencia

Este proyecto es un prototipo educativo para ArteCafexa.

---

**¡Listo para empezar! 🚀**

Recuerda:
1. ✅ Configurar Google Cloud y Service Account
2. ✅ Crear y compartir Google Sheet
3. ✅ Configurar backend con `.env` y `credentials.json`
4. ✅ Instalar y ejecutar backend
5. ✅ Instalar y ejecutar frontend
6. ✅ ¡Empezar a vender! ☕
