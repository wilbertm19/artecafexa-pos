-- ============================================================
-- ArteCafexa - Migración: Agregar icono a productos
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. Agregar columna icono (coffee por defecto)
ALTER TABLE productos ADD COLUMN IF NOT EXISTS icono TEXT NOT NULL DEFAULT 'coffee';

-- 2. Agregar columna metodo_pago a ventas (efectivo por defecto)
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS metodo_pago TEXT NOT NULL DEFAULT 'efectivo';

-- 3. Actualizar vista_menu para incluir icono
DROP VIEW IF EXISTS vista_menu;
CREATE VIEW vista_menu AS
SELECT
    p.id AS producto_id,
    p.nombre AS producto_nombre,
    p.precio_venta,
    p.icono,
    json_agg(json_build_object(
        'insumo_id', i.id,
        'insumo', i.nombre,
        'cantidad', r.cantidad_consumida
    )) AS receta
FROM productos p
JOIN recetas r ON r.producto_id = p.id
JOIN insumos i ON i.id = r.insumo_id
GROUP BY p.id, p.nombre, p.precio_venta, p.icono
ORDER BY p.nombre;

-- ============================================================
-- ¡Listo! Ejecuta en Supabase SQL Editor
-- ============================================================
