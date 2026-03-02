# Ejemplo de Estructura de Google Sheet

## Formato de las Pestañas

### 1. Pestaña: "Inventario"

Esta pestaña debe tener exactamente estas columnas en este orden:

```
| Insumo          | Cantidad | Unidad | StockMinimo |
|-----------------|----------|--------|-------------|
| Café Arábica    | 5.000    | kg     | 2.000       |
| Café Robusta    | 3.000    | kg     | 1.500       |
| Leche Entera    | 10.000   | L      | 3.000       |
| Leche Descremada| 5.000    | L      | 2.000       |
| Azúcar          | 3.000    | kg     | 1.000       |
| Cacao en Polvo  | 0.800    | kg     | 0.300       |
| Canela          | 0.200    | kg     | 0.100       |
| Vainilla        | 0.150    | L      | 0.050       |
| Chocolate       | 1.200    | kg     | 0.400       |
| Crema           | 2.000    | L      | 0.500       |
```

**Notas:**
- La columna "Insumo" debe coincidir exactamente con los nombres usados en "Recetas"
- Los números deben ser valores numéricos (no texto)
- Las unidades son solo informativas

---

### 2. Pestaña: "Recetas"

Esta pestaña define los productos y sus ingredientes:

```
| Producto           | Precio | Insumo           | Cantidad |
|--------------------|--------|------------------|----------|
| Espresso           | 2.50   | Café Arábica     | 0.018    |
| Espresso Doble     | 3.50   | Café Arábica     | 0.036    |
| Americano          | 3.00   | Café Arábica     | 0.018    |
| Cappuccino         | 3.50   | Café Arábica     | 0.018    |
| Cappuccino         | 3.50   | Leche Entera     | 0.120    |
| Latte              | 4.00   | Café Arábica     | 0.018    |
| Latte              | 4.00   | Leche Entera     | 0.180    |
| Mocha              | 4.50   | Café Arábica     | 0.018    |
| Mocha              | 4.50   | Leche Entera     | 0.120    |
| Mocha              | 4.50   | Cacao en Polvo   | 0.020    |
| Macchiato          | 3.00   | Café Arábica     | 0.018    |
| Macchiato          | 3.00   | Leche Entera     | 0.030    |
| Chocolate Caliente | 3.50   | Chocolate        | 0.030    |
| Chocolate Caliente | 3.50   | Leche Entera     | 0.200    |
| Café con Leche     | 2.50   | Café Arábica     | 0.018    |
| Café con Leche     | 2.50   | Leche Entera     | 0.150    |
```

**Notas:**
- Un producto puede tener múltiples filas (una por cada ingrediente)
- El sistema agrupa automáticamente las filas con el mismo nombre de producto
- El "Precio" debe ser el mismo en todas las filas del mismo producto
- Las cantidades están en las mismas unidades que el inventario

**Ejemplo de cálculo:**
```
1 Cappuccino requiere:
- 0.018 kg de Café Arábica
- 0.120 L de Leche Entera

Si vendes 10 Cappuccinos:
- Se restarán 0.18 kg de Café Arábica
- Se restarán 1.20 L de Leche Entera
```

---

### 3. Pestaña: "Ventas"

Esta pestaña se llena automáticamente por el sistema:

```
| Fecha               | Producto           | Cantidad | PrecioUnitario | Total |
|---------------------|--------------------|----------|----------------|-------|
| 2026-02-28 10:30:15 | Espresso           | 1        | 2.50           | 2.50  |
| 2026-02-28 10:35:22 | Cappuccino         | 2        | 3.50           | 7.00  |
| 2026-02-28 10:42:10 | Latte              | 1        | 4.00           | 4.00  |
| 2026-02-28 11:15:33 | Mocha              | 1        | 4.50           | 4.50  |
| 2026-02-28 11:20:45 | Chocolate Caliente | 3        | 3.50           | 10.50 |
```

**Notas:**
- NO edites esta pestaña manualmente
- Se llena automáticamente cada vez que se registra una venta
- La fecha incluye hora exacta
- Útil para análisis posteriores

---

## 🎨 Formato Recomendado en Google Sheets

### Para mejor visualización:

**Inventario:**
1. Aplica formato de números con 3 decimales a "Cantidad" y "StockMinimo"
2. Colorea las filas con stock bajo manualmente si lo deseas
3. Puedes agregar una columna extra con fórmula: `=B2<=D2` para ver alertas

**Recetas:**
1. Agrupa visualmente las recetas del mismo producto con bordes o colores
2. Formato de moneda para "Precio"
3. Formato de número con 3 decimales para "Cantidad"

**Ventas:**
1. Formato de fecha y hora para "Fecha"
2. Formato de moneda para "PrecioUnitario" y "Total"
3. Puedes agregar totalizadores al final

---

## 📊 Fórmulas Útiles Opcionales

Puedes agregar columnas extras con fórmulas:

### En "Inventario":
```
| Columna E: "% Stock" |
=B2/D2
```

```
| Columna F: "Estado" |
=IF(B2<=D2, "⚠️ BAJO", "✅ OK")
```

### En "Ventas" (al final):
```
| Total del Día |
=SUMIF(A:A, TODAY(), E:E)
```

```
| Cantidad de Ventas |
=COUNTIF(A:A, TODAY())
```

---

## ⚠️ Reglas Importantes

1. **NO cambies los nombres de las columnas** - El sistema las busca exactamente como están
2. **NO cambies los nombres de las pestañas** - Deben ser: "Inventario", "Recetas", "Ventas"
3. **Mantén los nombres de insumos consistentes** entre Inventario y Recetas
4. **Usa valores numéricos** no texto con formato
5. **La primera fila es el header** - Los datos empiezan en la fila 2

---

## 🔄 Ejemplo de Flujo Completo

### Estado Inicial:
**Inventario:**
- Café Arábica: 5.000 kg

**Recetas:**
- Espresso requiere 0.018 kg de Café Arábica

### Se vende 1 Espresso:

1. Sistema valida que hay suficiente café (5.000 >= 0.018) ✅
2. Resta del inventario: 5.000 - 0.018 = 4.982 kg
3. Agrega a Ventas: "2026-02-28 10:30:00 | Espresso | 1 | 2.50 | 2.50"

### Estado Final:
**Inventario:**
- Café Arábica: 4.982 kg ✅

**Ventas:**
- Nueva fila agregada ✅

---

## 🎯 Tips para Gestión

### Agregar Nuevo Producto:
1. Agregar insumos necesarios a "Inventario" (si no existen)
2. Agregar filas en "Recetas" con el nuevo producto
3. El sistema lo detectará automáticamente

### Reabastecer Inventario:
1. Simplemente edita la "Cantidad" en "Inventario"
2. El sistema usará el nuevo valor inmediatamente

### Ver Reportes:
1. Usa las fórmulas sugeridas arriba
2. O exporta "Ventas" a Excel/Sheets para análisis más profundos

---

## 📥 Plantilla Lista para Usar

Puedes hacer una copia de esta plantilla:
1. Crea un nuevo Google Sheet
2. Copia las tablas de arriba exactamente como están
3. Ajusta los valores según tu cafetería
4. Comparte con el service account
5. ¡Listo!

---

**Pro Tip:** Puedes agregar más columnas informativas después de las requeridas (a la derecha), el sistema solo usará las columnas especificadas.
