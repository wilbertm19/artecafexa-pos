# 🌳 Estructura Completa del Proyecto

```
pos2/
│
├── 📚 DOCUMENTACIÓN
│   ├── INDEX.md                      ← 📌 Empieza aquí (Índice general)
│   ├── QUICK_START.md                ← ⚡ Guía de inicio rápido (10 min)
│   ├── README.md                     ← 📖 Documentación completa
│   ├── GOOGLE_SHEET_STRUCTURE.md     ← 📊 Estructura del Google Sheet
│   ├── SCRIPTS.md                    ← 🔧 Utilidades y scripts
│   └── TREE.md                       ← 🌳 Este archivo
│
├── 🎬 SCRIPTS DE INICIO
│   ├── start-all.ps1                 ← 🚀 Inicia todo el sistema
│   └── .gitignore                    ← 🔒 Archivos a ignorar en Git
│
├── 🐍 BACKEND (FastAPI)
│   ├── 📄 ARCHIVOS PRINCIPALES
│   │   ├── main.py                   ← ⚙️ API principal (FastAPI)
│   │   ├── models.py                 ← 📦 Modelos Pydantic
│   │   ├── config.py                 ← ⚙️ Configuración y settings
│   │   └── test_connection.py        ← 🧪 Script de prueba de conexión
│   │
│   ├── 📋 CONFIGURACIÓN
│   │   ├── requirements.txt          ← 📚 Dependencias Python
│   │   ├── .env.example              ← 📝 Plantilla de variables de entorno
│   │   ├── .env                      ← 🔐 Variables de entorno (CREAR)
│   │   └── credentials.json          ← 🔑 Credenciales Google (DESCARGAR)
│   │
│   ├── 🔄 EJECUCIÓN
│   │   ├── start.ps1                 ← ▶️ Script para iniciar backend
│   │   └── venv/                     ← 📦 Entorno virtual Python (auto-generado)
│   │
│   └── 🎯 ENDPOINTS
│       ├── GET  /                    → Info general
│       ├── GET  /products            → Lista de productos
│       ├── GET  /inventory           → Estado del inventario
│       ├── POST /sales               → Registrar venta
│       ├── GET  /health              → Health check
│       └── GET  /docs                → Documentación interactiva
│
└── ⚛️ FRONTEND (Next.js 14)
    ├── 📱 PÁGINAS (App Router)
    │   ├── app/
    │   │   ├── layout.tsx            ← 🎨 Layout principal con navegación
    │   │   ├── page.tsx              ← 🛒 Página POS (ventas)
    │   │   ├── dashboard/
    │   │   │   └── page.tsx          ← 📊 Dashboard administrativo
    │   │   └── globals.css           ← 🎨 Estilos globales
    │   │
    │   ├── 🧩 COMPONENTES
    │   │   ├── components/
    │   │   │   ├── ProductButton.tsx     ← 🔘 Botón de producto (POS)
    │   │   │   ├── SaleModal.tsx         ← 💬 Modal de confirmación de venta
    │   │   │   └── InventoryTable.tsx    ← 📋 Tabla de inventario (Dashboard)
    │   │   │
    │   │   └── lib/
    │   │       └── api.ts            ← 🔌 Cliente API (fetch functions)
    │   │
    │   ├── 📋 CONFIGURACIÓN
    │   │   ├── package.json          ← 📚 Dependencias Node.js
    │   │   ├── tsconfig.json         ← ⚙️ Configuración TypeScript
    │   │   ├── tailwind.config.js    ← 🎨 Configuración Tailwind CSS
    │   │   ├── postcss.config.js     ← 🎨 Configuración PostCSS
    │   │   ├── next.config.js        ← ⚙️ Configuración Next.js
    │   │   ├── .env.example          ← 📝 Plantilla de variables de entorno
    │   │   └── .env.local            ← 🔐 Variables de entorno (CREAR)
    │   │
    │   ├── 🔄 EJECUCIÓN
    │   │   ├── start.ps1             ← ▶️ Script para iniciar frontend
    │   │   └── node_modules/         ← 📦 Dependencias instaladas (npm install)
    │   │
    │   └── 🎯 RUTAS
    │       ├── /                     → Interfaz POS (ventas)
    │       └── /dashboard            → Dashboard administrativo
```

---

## 📊 Flujo de Datos

```
┌──────────────────────────────────────────────────────────────┐
│                      GOOGLE SHEETS                           │
│                    (Base de Datos)                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Inventario │  │  Recetas   │  │   Ventas   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└──────────────┬───────────────────────────────────────────────┘
               │ gspread
               ↓
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                         │
│                   localhost:8000                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ main.py  │  │models.py │  │config.py │  │ /docs    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────┬───────────────────────────────────────────────┘
               │ HTTP REST API
               ↓
┌──────────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                         │
│                   localhost:3000                              │
│  ┌────────────────┐  ┌────────────────┐                     │
│  │   POS (/)      │  │ Dashboard      │                     │
│  │ ProductButton  │  │ InventoryTable │                     │
│  │ SaleModal      │  │ KPI Cards      │                     │
│  └────────────────┘  └────────────────┘                     │
│           │                    │                              │
│           └────────┬───────────┘                             │
│                    │ SWR (Data Fetching)                     │
│                    ↓                                         │
│            lib/api.ts (API Client)                           │
└──────────────┬───────────────────────────────────────────────┘
               │
               ↓
        👤 Usuario Final
```

---

## 🔍 Detalles de Archivos Clave

### Backend

#### `main.py` (324 líneas)
- ✅ Configuración de FastAPI
- ✅ Middleware CORS
- ✅ Cliente de Google Sheets (gspread)
- ✅ Endpoints: /, /products, /inventory, /sales, /health
- ✅ Lógica de validación de stock
- ✅ Actualización automática de inventario
- ✅ Registro de ventas

#### `models.py` (77 líneas)
- ✅ `InventoryItem` - Modelo para items del inventario
- ✅ `Recipe` - Modelo para ingredientes
- ✅ `Product` - Modelo para productos
- ✅ `SaleRequest` - Modelo para request de venta
- ✅ `SaleResponse` - Modelo para response de venta
- ✅ `InventoryAlert` - Modelo para alertas

#### `config.py` (22 líneas)
- ✅ Carga de variables de entorno (.env)
- ✅ Configuración de Google Sheets
- ✅ Configuración de CORS

### Frontend

#### `app/page.tsx` (87 líneas)
- ✅ Interfaz POS principal
- ✅ Grid de productos responsive
- ✅ Integración con SWR para data fetching
- ✅ Modal de confirmación de venta
- ✅ Auto-refresh cada 30 segundos

#### `app/dashboard/page.tsx` (99 líneas)
- ✅ Dashboard administrativo
- ✅ KPI Cards (Total Insumos, Alertas, etc.)
- ✅ Tabla de inventario con colores dinámicos
- ✅ Auto-refresh cada 10 segundos

#### `components/ProductButton.tsx` (38 líneas)
- ✅ Botón de producto estilizado
- ✅ Muestra nombre, precio e ingredientes
- ✅ Hover effects y animaciones

#### `components/SaleModal.tsx` (161 líneas)
- ✅ Modal de confirmación de venta
- ✅ Selector de cantidad (+/-)
- ✅ Muestra total y receta
- ✅ Estados: idle, loading, success, error
- ✅ Cierre automático tras venta exitosa

#### `components/InventoryTable.tsx` (110 líneas)
- ✅ Tabla responsive de inventario
- ✅ Colores dinámicos según stock
- ✅ Barra de progreso visual
- ✅ Iconos de alerta

#### `lib/api.ts` (77 líneas)
- ✅ Funciones fetch para todos los endpoints
- ✅ Tipos TypeScript definidos
- ✅ Manejo de errores
- ✅ Configuración de API base URL

---

## 📦 Dependencias Principales

### Backend (Python)
```
fastapi==0.109.0           # Framework web
uvicorn[standard]==0.27.0  # Servidor ASGI
gspread==5.12.4            # Cliente Google Sheets
oauth2client==4.1.3        # Autenticación Google
pydantic==2.5.3            # Validación de datos
python-dotenv==1.0.0       # Variables de entorno
```

### Frontend (Node.js)
```
next==14.1.0               # Framework React
react==18.2.0              # Biblioteca UI
swr==2.2.4                 # Data fetching & cache
lucide-react==0.311.0      # Iconos
tailwindcss==3.4.1         # Framework CSS
typescript==5.3.3          # Tipado estático
```

---

## 🎨 Paleta de Colores (Tailwind)

```css
primary-50:  #fef7ee  /* Muy claro */
primary-100: #fdecd3  /* Claro */
primary-200: #fad5a5  /* Suave */
primary-300: #f7b86d  /* Medio claro */
primary-400: #f39133  /* Medio */
primary-500: #f07315  /* Base - Naranja cálido */
primary-600: #e1570b  /* Oscuro - Naranja intenso */
primary-700: #ba3f0b  /* Muy oscuro */
primary-800: #943210  /* Extra oscuro */
primary-900: #782b10  /* Negro café */
```

Inspirado en tonos de café y cafetería ☕

---

## 📊 Tamaños de Archivo

```
Backend:
  main.py .............. ~15 KB
  models.py ............ ~3 KB
  config.py ............ ~1 KB
  requirements.txt ..... <1 KB

Frontend:
  app/page.tsx ......... ~4 KB
  app/dashboard/page.tsx ~5 KB
  components/ .......... ~12 KB total
  lib/api.ts ........... ~3 KB
  package.json ......... ~1 KB

Documentación:
  README.md ............ ~30 KB
  QUICK_START.md ....... ~8 KB
  GOOGLE_SHEET_STRUCTURE.md ~10 KB
  SCRIPTS.md ........... ~12 KB

Total (sin node_modules/venv): ~104 KB
```

---

## 🚀 Comandos Esenciales

### Setup Inicial
```powershell
# Backend
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt

# Frontend
cd ..\frontend
npm install
```

### Ejecución Diaria
```powershell
# Opción 1: Todo junto
.\start-all.ps1

# Opción 2: Separado
# Terminal 1
cd backend; .\start.ps1

# Terminal 2
cd frontend; .\start.ps1
```

### Testing
```powershell
# Probar conexión Google Sheets
cd backend
python test_connection.py

# Probar API
Invoke-WebRequest http://localhost:8000/products
```

---

## 🎯 Características Implementadas

### ✅ Backend
- [x] API REST completa con FastAPI
- [x] Integración con Google Sheets
- [x] Validación de stock en tiempo real
- [x] Actualización automática de inventario
- [x] Sistema de alertas de stock mínimo
- [x] Registro de ventas con timestamp
- [x] Documentación interactiva (Swagger)
- [x] CORS configurado
- [x] Manejo de errores robusto

### ✅ Frontend
- [x] Interfaz POS mobile-first
- [x] Dashboard administrativo
- [x] Actualización en tiempo real (SWR)
- [x] Modal de confirmación de ventas
- [x] Tabla de inventario con colores dinámicos
- [x] KPI Cards informativos
- [x] Diseño responsive
- [x] Animaciones suaves
- [x] Manejo de estados de carga/error

### ✅ Documentación
- [x] README completo
- [x] Quick Start guide
- [x] Estructura de Google Sheet
- [x] Scripts y utilidades
- [x] Índice navegable
- [x] Troubleshooting

---

## 📈 Líneas de Código

```
Backend:
  Python: ~500 líneas

Frontend:
  TypeScript/TSX: ~700 líneas
  CSS: ~50 líneas

Documentación:
  Markdown: ~1500 líneas

Scripts:
  PowerShell: ~150 líneas

Total: ~2900 líneas
```

---

## 🎓 Para Aprender Más

### Backend (FastAPI)
- Archivos a estudiar: `main.py`, `models.py`
- Conceptos: Endpoints REST, Pydantic models, async/await
- Recursos: https://fastapi.tiangolo.com/

### Frontend (Next.js)
- Archivos a estudiar: `app/page.tsx`, `components/SaleModal.tsx`
- Conceptos: App Router, Server/Client Components, SWR
- Recursos: https://nextjs.org/docs

### Google Sheets API
- Archivos a estudiar: `main.py` (funciones get_sheet)
- Conceptos: Service Accounts, OAuth2, gspread
- Recursos: https://docs.gspread.org/

---

**💡 Pro Tip**: Usa INDEX.md como punto de partida para navegar toda la documentación del proyecto. ¡Está diseñado para eso! 🎯
