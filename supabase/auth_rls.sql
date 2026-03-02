-- ============================================================
-- ArteCafexa - Autenticación y RLS (Row Level Security)
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de schema.sql
-- ============================================================

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE insumos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas     ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes (por si ya se ejecutó antes)
DROP POLICY IF EXISTS "Lectura pública insumos"    ON insumos;
DROP POLICY IF EXISTS "Lectura pública productos"  ON productos;
DROP POLICY IF EXISTS "Lectura pública recetas"    ON recetas;
DROP POLICY IF EXISTS "Lectura pública ventas"     ON ventas;

DROP POLICY IF EXISTS "Insert insumos auth"   ON insumos;
DROP POLICY IF EXISTS "Update insumos auth"   ON insumos;
DROP POLICY IF EXISTS "Delete insumos auth"   ON insumos;
DROP POLICY IF EXISTS "Insert productos auth" ON productos;
DROP POLICY IF EXISTS "Update productos auth" ON productos;
DROP POLICY IF EXISTS "Delete productos auth" ON productos;
DROP POLICY IF EXISTS "Insert recetas auth"   ON recetas;
DROP POLICY IF EXISTS "Update recetas auth"   ON recetas;
DROP POLICY IF EXISTS "Delete recetas auth"   ON recetas;
DROP POLICY IF EXISTS "Insert ventas auth"    ON ventas;
DROP POLICY IF EXISTS "Update ventas auth"    ON ventas;
DROP POLICY IF EXISTS "Delete ventas auth"    ON ventas;

-- 3. Políticas: lectura pública (anon + authenticated)
CREATE POLICY "Lectura pública insumos"    ON insumos    FOR SELECT USING (true);
CREATE POLICY "Lectura pública productos"  ON productos  FOR SELECT USING (true);
CREATE POLICY "Lectura pública recetas"    ON recetas    FOR SELECT USING (true);
CREATE POLICY "Lectura pública ventas"     ON ventas     FOR SELECT USING (true);

-- 4. Políticas: escritura solo para usuarios autenticados
CREATE POLICY "Insert insumos auth"  ON insumos    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update insumos auth"  ON insumos    FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete insumos auth"  ON insumos    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Insert productos auth" ON productos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update productos auth" ON productos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete productos auth" ON productos FOR DELETE TO authenticated USING (true);

CREATE POLICY "Insert recetas auth"  ON recetas    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update recetas auth"  ON recetas    FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete recetas auth"  ON recetas    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Insert ventas auth"   ON ventas     FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update ventas auth"   ON ventas     FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete ventas auth"   ON ventas     FOR DELETE TO authenticated USING (true);

-- 4. Permitir que la función RPC procesar_venta funcione con anon (POS público)
--    La función usa SECURITY DEFINER para bypass RLS
DROP FUNCTION IF EXISTS procesar_venta(UUID, INTEGER);

CREATE OR REPLACE FUNCTION procesar_venta(
    p_producto_id UUID,
    p_cantidad    INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- Ejecuta con permisos del owner (bypass RLS)
AS $$
DECLARE
    v_producto      RECORD;
    v_receta        RECORD;
    v_stock_faltante JSON[] := '{}';
    v_item          JSON;
    v_precio_total  NUMERIC;
    v_venta_id      UUID;
BEGIN
    SELECT id, nombre, precio_venta INTO v_producto
    FROM productos WHERE id = p_producto_id;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Producto no encontrado',
            'status', 404
        );
    END IF;

    FOR v_receta IN
        SELECT r.insumo_id, r.cantidad_consumida,
               i.nombre AS insumo_nombre, i.cantidad_actual
        FROM recetas r
        JOIN insumos i ON i.id = r.insumo_id
        WHERE r.producto_id = p_producto_id
    LOOP
        IF v_receta.cantidad_actual < (v_receta.cantidad_consumida * p_cantidad) THEN
            v_item := json_build_object(
                'insumo',     v_receta.insumo_nombre,
                'necesaria',  v_receta.cantidad_consumida * p_cantidad,
                'disponible', v_receta.cantidad_actual,
                'faltante',   (v_receta.cantidad_consumida * p_cantidad) - v_receta.cantidad_actual
            );
            v_stock_faltante := array_append(v_stock_faltante, v_item);
        END IF;
    END LOOP;

    IF array_length(v_stock_faltante, 1) > 0 THEN
        RETURN json_build_object(
            'success', false,
            'error',   'Stock insuficiente',
            'items',   array_to_json(v_stock_faltante),
            'status',  400
        );
    END IF;

    FOR v_receta IN
        SELECT r.insumo_id, r.cantidad_consumida
        FROM recetas r WHERE r.producto_id = p_producto_id
    LOOP
        UPDATE insumos
        SET cantidad_actual = cantidad_actual - (v_receta.cantidad_consumida * p_cantidad)
        WHERE id = v_receta.insumo_id;
    END LOOP;

    v_precio_total := v_producto.precio_venta * p_cantidad;

    INSERT INTO ventas (producto_id, cantidad, precio_total)
    VALUES (p_producto_id, p_cantidad, v_precio_total)
    RETURNING id INTO v_venta_id;

    RETURN json_build_object(
        'success',    true,
        'message',    format('Venta registrada: %sx %s', p_cantidad, v_producto.nombre),
        'venta_id',   v_venta_id,
        'total',      v_precio_total,
        'producto',   v_producto.nombre,
        'status',     200
    );
END;
$$;

-- ============================================================
-- ¡Listo! Ejecuta este script en Supabase SQL Editor
-- Luego crea un usuario en Authentication > Users > Add user
-- ============================================================
