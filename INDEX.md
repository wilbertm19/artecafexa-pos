# 📚 Índice de Documentación - ArteCafexa

Bienvenido a ArteCafexa POS System. Esta es tu guía para navegar toda la documentación del proyecto.

## 🚀 Inicio Rápido

**¿Primera vez?** Empieza aquí:

1. 📖 **[QUICK_START.md](QUICK_START.md)** - Guía de inicio en 10 minutos
2. 📚 **[README.md](README.md)** - Documentación completa del proyecto

## 📁 Estructura del Proyecto

```
pos2/
├── 📖 Documentación
│   ├── README.md                    # Documentación principal
│   ├── QUICK_START.md               # Guía rápida de inicio
│   ├── GOOGLE_SHEET_STRUCTURE.md    # Estructura del Google Sheet
│   ├── SCRIPTS.md                   # Utilidades y scripts
│   └── INDEX.md                     # Este archivo
│
├── 🔧 Scripts de Inicio
│   ├── start-all.ps1                # Inicia backend + frontend
│   ├── backend/start.ps1            # Inicia solo backend
│   └── frontend/start.ps1           # Inicia solo frontend
│
├── 🐍 Backend (FastAPI)
│   ├── main.py                      # API principal
│   ├── models.py                    # Modelos de datos
│   ├── config.py                    # Configuración
│   ├── test_connection.py           # Script de prueba
│   ├── requirements.txt             # Dependencias Python
│   ├── .env.example                 # Plantilla de variables
│   └── credentials.json             # (Crear) Credenciales Google
│
└── ⚛️ Frontend (Next.js)
    ├── app/
    │   ├── layout.tsx               # Layout principal
    │   ├── page.tsx                 # Interfaz POS
    │   ├── dashboard/page.tsx       # Dashboard admin
    │   └── globals.css              # Estilos globales
    ├── components/
    │   ├── ProductButton.tsx        # Botón de producto
    │   ├── SaleModal.tsx            # Modal de venta
    │   └── InventoryTable.tsx       # Tabla de inventario
    ├── lib/
    │   └── api.ts                   # Cliente API
    ├── package.json                 # Dependencias Node
    └── .env.example                 # Plantilla de variables
```

## 📖 Guías por Tema

### 🎯 Configuración Inicial

| Documento | Descripción | Tiempo |
|-----------|-------------|--------|
| [QUICK_START.md](QUICK_START.md) | Pasos mínimos para empezar | 10 min |
| [README.md](README.md) - Sección 1-4 | Configuración completa paso a paso | 30 min |
| [GOOGLE_SHEET_STRUCTURE.md](GOOGLE_SHEET_STRUCTURE.md) | Estructura de las pestañas | 15 min |

### 💻 Desarrollo

| Documento | Descripción |
|-----------|-------------|
| [README.md](README.md) - Estructura | Arquitectura del proyecto |
| [README.md](README.md) - Endpoints | Documentación de la API |
| [SCRIPTS.md](SCRIPTS.md) | Scripts útiles para desarrollo |

### 🚀 Ejecución

| Documento | Descripción |
|-----------|-------------|
| [QUICK_START.md](QUICK_START.md) - Comandos | Comandos para iniciar el sistema |
| [SCRIPTS.md](SCRIPTS.md) - Scripts PowerShell | Automatización con scripts |

### 🐛 Troubleshooting

| Documento | Descripción |
|-----------|-------------|
| [README.md](README.md) - Troubleshooting | Solución de problemas comunes |
| [QUICK_START.md](QUICK_START.md) - Problemas | Problemas y soluciones rápidas |
| [SCRIPTS.md](SCRIPTS.md) - Debugging | Herramientas de debugging |

## 🎓 Tutoriales por Flujo de Trabajo

### 1️⃣ Primera Vez - Setup Completo

```
1. README.md → Sección "Configuración Completa"
2. GOOGLE_SHEET_STRUCTURE.md → Crear las pestañas
3. QUICK_START.md → Verificar que funciona
```

### 2️⃣ Desarrollo Diario

```
1. start-all.ps1 → Iniciar el sistema
2. http://localhost:8000/docs → Ver API
3. http://localhost:3000 → Probar frontend
```

### 3️⃣ Debugging de Problemas

```
1. backend/test_connection.py → Probar conexión
2. SCRIPTS.md → Ver logs y debugging
3. README.md → Troubleshooting
```

### 4️⃣ Agregar Nuevo Producto

```
1. GOOGLE_SHEET_STRUCTURE.md → Formato de Recetas
2. Agregar en Google Sheet → Pestaña "Recetas"
3. Recargar http://localhost:3000 → Verificar
```

### 5️⃣ Modificar Inventario

```
1. Abrir Google Sheet → Pestaña "Inventario"
2. Editar cantidad directamente
3. El sistema lo detecta automáticamente
```

## 🔗 Enlaces Rápidos

### Documentación Externa

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [gspread Docs](https://docs.gspread.org/)
- [SWR Docs](https://swr.vercel.app/)

### Google Cloud

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Service Accounts](https://cloud.google.com/iam/docs/service-accounts)

## 📊 Diagramas

### Flujo de Ventas

```
Usuario hace clic en producto
    ↓
SaleModal se abre
    ↓
Usuario confirma cantidad
    ↓
POST /sales al backend
    ↓
Backend valida stock en Google Sheet
    ↓
Si hay stock:
    → Actualiza inventario
    → Registra venta
    → Retorna éxito
Si no hay stock:
    → Retorna error 400
    ↓
Frontend muestra resultado
    ↓
SWR revalida datos automáticamente
```

### Arquitectura del Sistema

```
┌─────────────────┐
│   Google Sheet  │
│  (Base de Datos)│
└────────┬────────┘
         │
         ↓ gspread
┌─────────────────┐
│  Backend FastAPI│
│    Port 8000    │
└────────┬────────┘
         │
         ↓ HTTP/REST
┌─────────────────┐
│ Frontend Next.js│
│    Port 3000    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Navegador     │
│  (Usuario Final)│
└─────────────────┘
```

## 📝 Checklist de Configuración

### Antes de empezar:

- [ ] Python 3.9+ instalado
- [ ] Node.js 18+ instalado
- [ ] Cuenta de Google activa
- [ ] Acceso a Google Cloud Console

### Google Cloud:

- [ ] Proyecto creado en Google Cloud
- [ ] Google Sheets API habilitada
- [ ] Google Drive API habilitada
- [ ] Service Account creada
- [ ] Credenciales JSON descargadas

### Google Sheet:

- [ ] Google Sheet creado
- [ ] Pestaña "Inventario" con datos
- [ ] Pestaña "Recetas" con datos
- [ ] Pestaña "Ventas" creada (vacía)
- [ ] Sheet compartido con Service Account
- [ ] ID del Sheet copiado

### Backend:

- [ ] Dependencias instaladas (`pip install -r requirements.txt`)
- [ ] `credentials.json` en carpeta backend/
- [ ] Archivo `.env` creado y configurado
- [ ] Servidor inicia correctamente (`python main.py`)
- [ ] http://localhost:8000/docs accesible

### Frontend:

- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env.local` creado y configurado
- [ ] Servidor inicia correctamente (`npm run dev`)
- [ ] http://localhost:3000 accesible
- [ ] Productos se cargan correctamente

### Verificación Final:

- [ ] Puedes ver productos en el frontend
- [ ] Puedes registrar una venta
- [ ] La venta se refleja en Google Sheet
- [ ] El inventario se actualiza correctamente
- [ ] El dashboard muestra datos correctos

## 🎯 Próximos Pasos

Una vez que tengas todo funcionando:

1. **Personaliza los productos** en Google Sheet
2. **Ajusta el inventario inicial**
3. **Prueba el flujo completo** de ventas
4. **Explora el dashboard** administrativo
5. **Lee [README.md](README.md)** para funcionalidades avanzadas

## 💡 Tips Útiles

- **Atajos de teclado**: F12 para abrir DevTools en el navegador
- **Recargar datos**: Ctrl+R en el frontend recarga productos
- **Ver logs**: Mira las ventanas de PowerShell del backend/frontend
- **API interactiva**: http://localhost:8000/docs para probar endpoints
- **Hot reload**: Los cambios en código se aplican automáticamente

## ❓ ¿Necesitas ayuda?

1. **Problemas técnicos**: [README.md - Troubleshooting](README.md#-troubleshooting)
2. **Configuración**: [QUICK_START.md - Problemas Comunes](QUICK_START.md#-problemas-comunes)
3. **Estructura de datos**: [GOOGLE_SHEET_STRUCTURE.md](GOOGLE_SHEET_STRUCTURE.md)

---

**¡Bienvenido a ArteCafexa POS System! ☕**

Si completaste la configuración, ¡estás listo para empezar a vender!

Ejecuta: `.\start-all.ps1` y disfruta tu nuevo sistema de punto de venta. 🚀
