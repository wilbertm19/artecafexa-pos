# 🚀 Guía Rápida de Inicio - ArteCafexa

Esta es una guía ultra-rápida para poner en marcha el sistema en menos de 10 minutos.

## ✅ Checklist Pre-Requisitos

Antes de comenzar, asegúrate de tener:

- [ ] Python 3.9+ instalado
- [ ] Node.js 18+ instalado
- [ ] Una cuenta de Google
- [ ] Acceso a Google Cloud Console

---

## 📝 Pasos Rápidos

### 1️⃣ Google Cloud (5 minutos)

```
1. Ir a: https://console.cloud.google.com/
2. Crear proyecto "ArteCafexa"
3. Habilitar APIs:
   - Google Sheets API
   - Google Drive API
4. Crear Service Account:
   - APIs y servicios > Credenciales > Crear credenciales
   - Tipo: Cuenta de servicio
   - Rol: Editor
5. Descargar JSON de credenciales
6. Guardar como: backend/credentials.json
```

### 2️⃣ Google Sheet (3 minutos)

```
1. Crear nuevo Google Sheet
2. Nombrar: "ArteCafexa - Gestión"
3. Crear 3 pestañas:
   
   📊 Inventario:
   Insumo | Cantidad | Unidad | StockMinimo
   Café Arábica | 5 | kg | 2
   Leche Entera | 10 | L | 3
   
   📋 Recetas:
   Producto | Precio | Insumo | Cantidad
   Espresso | 2.5 | Café Arábica | 0.018
   Cappuccino | 3.5 | Café Arábica | 0.018
   Cappuccino | 3.5 | Leche Entera | 0.120
   
   💰 Ventas:
   Fecha | Producto | Cantidad | PrecioUnitario | Total
   (se llenará automáticamente)

4. Compartir con email del Service Account (del JSON: "client_email")
5. Copiar ID del Sheet (de la URL)
```

### 3️⃣ Backend (2 minutos)

```powershell
# Terminal 1
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt

# Crear .env
echo "GOOGLE_SHEET_ID=TU_ID_AQUI" > .env
echo "GOOGLE_CREDENTIALS_FILE=credentials.json" >> .env

# Ejecutar
python main.py
```

✅ Verificar: http://localhost:8000/docs

### 4️⃣ Frontend (2 minutos)

```powershell
# Terminal 2 (nueva)
cd ..\frontend
npm install

# Crear .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Ejecutar
npm run dev
```

✅ Abrir: http://localhost:3000

---

## 🎯 ¿Funciona?

### Test Rápido:

1. **Backend**: Abre http://localhost:8000/products
   - ¿Ves la lista de productos? ✅

2. **Frontend**: Abre http://localhost:3000
   - ¿Ves los botones de productos? ✅

3. **Venta**: Haz clic en "Espresso" → "Confirmar Venta"
   - ¿Se registró la venta? ✅
   - ¿Se actualizó el inventario en el Sheet? ✅

---

## 🐛 Problemas Comunes

### "Error al conectar con Google Sheets"
```
❌ Problema: credentials.json incorrecto o no compartido el Sheet
✅ Solución: 
   1. Verifica que credentials.json esté en backend/
   2. Verifica que compartiste el Sheet con el email del Service Account
```

### "Cannot connect to API"
```
❌ Problema: Backend no está corriendo
✅ Solución: 
   cd backend
   python main.py
```

### "Products not loading"
```
❌ Problema: CORS o URL incorrecta
✅ Solución: 
   Verifica que .env.local tenga:
   NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📱 Comandos Útiles

### Reiniciar Backend:
```powershell
cd backend
.\venv\Scripts\Activate
python main.py
```

### Reiniciar Frontend:
```powershell
cd frontend
npm run dev
```

### Ver logs del Backend:
```powershell
# Los logs aparecen en la terminal donde corre python main.py
```

### Limpiar cache del Frontend:
```powershell
cd frontend
rm -rf .next
npm run dev
```

---

## 🎨 Personalización Rápida

### Cambiar puerto del Backend:
```python
# backend/main.py (última línea)
uvicorn.run(app, host="0.0.0.0", port=8001)  # Cambia 8000 a 8001
```

### Cambiar colores del Frontend:
```javascript
// frontend/tailwind.config.js
primary: {
  500: '#tu-color-aqui',
  600: '#tu-color-oscuro-aqui',
}
```

---

## 📚 ¿Necesitas más ayuda?

1. 📖 Lee el [README.md](README.md) completo
2. 📊 Revisa [GOOGLE_SHEET_STRUCTURE.md](GOOGLE_SHEET_STRUCTURE.md)
3. 🔍 Abre http://localhost:8000/docs para ver la API

---

## ✨ ¡Listo!

Si llegaste aquí, tu sistema debería estar funcionando. 🎉

**Próximos pasos:**
- Agrega más productos en "Recetas"
- Ajusta el inventario inicial
- Empieza a vender ☕

---

**¡Que tengas un excelente día de ventas! 🚀**
