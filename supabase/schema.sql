-- ============================================================
-- ArteCafexa - Esquema de Base de Datos (Supabase / PostgreSQL)
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABLAS
-- ============================================================

CREATE TABLE insumos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre          TEXT NOT NULL UNIQUE,
    cantidad_actual NUMERIC(12, 4) NOT NULL DEFAULT 0,
    unidad          TEXT NOT NULL,
    stock_minimo    NUMERIC(12, 4) NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE productos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre          TEXT NOT NULL UNIQUE,
    precio_venta    NUMERIC(10, 2) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE recetas (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id         UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    insumo_id           UUID NOT NULL REFERENCES insumos(id) ON DELETE CASCADE,
    cantidad_consumida  NUMERIC(12, 4) NOT NULL,
    UNIQUE(producto_id, insumo_id)
);

CREATE TABLE ventas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha_hora      TIMESTAMPTZ NOT NULL DEFAULT now(),
    producto_id     UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
    precio_total    NUMERIC(10, 2) NOT NULL
);

-- ============================================================
-- 2. ÍNDICES
-- ============================================================

CREATE INDEX idx_recetas_producto  ON recetas(producto_id);
CREATE INDEX idx_recetas_insumo    ON recetas(insumo_id);
CREATE INDEX idx_ventas_fecha      ON ventas(fecha_hora DESC);
CREATE INDEX idx_ventas_producto   ON ventas(producto_id);

-- ============================================================
-- 3. FUNCIÓN RPC: procesar_venta (transacción atómica)
-- ============================================================

CREATE OR REPLACE FUNCTION procesar_venta(
    p_producto_id UUID,
    p_cantidad    INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_producto      RECORD;
    v_receta        RECORD;
    v_stock_faltante JSON[] := '{}';
    v_item          JSON;
    v_precio_total  NUMERIC;
    v_venta_id      UUID;
BEGIN
    -- 1. Validar que el producto exista
    SELECT id, nombre, precio_venta INTO v_producto
    FROM productos WHERE id = p_producto_id;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Producto no encontrado',
            'status', 404
        );
    END IF;

    -- 2. Verificar stock suficiente para TODOS los insumos
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

    -- 3. Restar insumos del inventario
    FOR v_receta IN
        SELECT r.insumo_id, r.cantidad_consumida
        FROM recetas r WHERE r.producto_id = p_producto_id
    LOOP
        UPDATE insumos
        SET cantidad_actual = cantidad_actual - (v_receta.cantidad_consumida * p_cantidad)
        WHERE id = v_receta.insumo_id;
    END LOOP;

    -- 4. Insertar venta
    v_precio_total := v_producto.precio_venta * p_cantidad;

    INSERT INTO ventas (producto_id, cantidad, precio_total)
    VALUES (p_producto_id, p_cantidad, v_precio_total)
    RETURNING id INTO v_venta_id;

    -- 5. Retornar éxito
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
-- 4. SEED DATA
-- ============================================================

INSERT INTO insumos (nombre, cantidad_actual, unidad, stock_minimo) VALUES
    ('Café Arábica',     5.000,  'kg',  2.000),
    ('Café Robusta',     3.000,  'kg',  1.500),
    ('Leche Entera',     10.000, 'L',   3.000),
    ('Leche Descremada', 5.000,  'L',   2.000),
    ('Azúcar',           3.000,  'kg',  1.000),
    ('Cacao en Polvo',   0.800,  'kg',  0.300),
    ('Canela',           0.200,  'kg',  0.100),
    ('Vainilla',         0.150,  'L',   0.050),
    ('Chocolate',        1.200,  'kg',  0.400),
    ('Crema',            2.000,  'L',   0.500);

INSERT INTO productos (nombre, precio_venta) VALUES
    ('Espresso',           2.50),
    ('Espresso Doble',     3.50),
    ('Americano',          3.00),
    ('Cappuccino',         3.50),
    ('Latte',              4.00),
    ('Mocha',              4.50),
    ('Macchiato',          3.00),
    ('Chocolate Caliente', 3.50),
    ('Café con Leche',     2.50);

INSERT INTO recetas (producto_id, insumo_id, cantidad_consumida)
SELECT p.id, i.id, v.cantidad
FROM (VALUES
    ('Espresso',           'Café Arábica',   0.018),
    ('Espresso Doble',     'Café Arábica',   0.036),
    ('Americano',          'Café Arábica',   0.018),
    ('Cappuccino',         'Café Arábica',   0.018),
    ('Cappuccino',         'Leche Entera',   0.120),
    ('Latte',              'Café Arábica',   0.018),
    ('Latte',              'Leche Entera',   0.180),
    ('Mocha',              'Café Arábica',   0.018),
    ('Mocha',              'Leche Entera',   0.120),
    ('Mocha',              'Cacao en Polvo', 0.020),
    ('Macchiato',          'Café Arábica',   0.018),
    ('Macchiato',          'Leche Entera',   0.030),
    ('Chocolate Caliente', 'Chocolate',      0.030),
    ('Chocolate Caliente', 'Leche Entera',   0.200),
    ('Café con Leche',     'Café Arábica',   0.018),
    ('Café con Leche',     'Leche Entera',   0.150)
) AS v(producto_nombre, insumo_nombre, cantidad)
JOIN productos p ON p.nombre = v.producto_nombre
JOIN insumos   i ON i.nombre = v.insumo_nombre;

-- ============================================================
-- 5. VISTAS ÚTILES
-- ============================================================

CREATE OR REPLACE VIEW vista_inventario AS
SELECT
    id, nombre, cantidad_actual, unidad, stock_minimo,
    (cantidad_actual <= stock_minimo) AS alerta_stock,
    CASE WHEN stock_minimo > 0
         THEN ROUND((cantidad_actual / stock_minimo) * 100, 2)
         ELSE 100
    END AS porcentaje_stock
FROM insumos
ORDER BY alerta_stock DESC, nombre ASC;

CREATE OR REPLACE VIEW vista_menu AS
SELECT
    p.id AS producto_id,
    p.nombre AS producto_nombre,
    p.precio_venta,
    json_agg(json_build_object(
        'insumo_id', i.id,
        'insumo', i.nombre,
        'cantidad', r.cantidad_consumida
    )) AS receta
FROM productos p
JOIN recetas r ON r.producto_id = p.id
JOIN insumos i ON i.id = r.insumo_id
GROUP BY p.id, p.nombre, p.precio_venta
ORDER BY p.nombre;

-- ============================================================
-- ¡Listo! Ejecuta este script completo en Supabase SQL Editor
-- ============================================================
