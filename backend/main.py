from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from postgrest.exceptions import APIError
from datetime import datetime
from typing import List, Optional
import json
import re
import ast

from models import (
    LoginRequest, AuthResponse,
    InsumoOut, InsumoCreate, InsumoUpdate,
    ProductoOut, RecetaItem, RecetaCreate, ProductoCreate, ProductoUpdate,
    InventarioResponse,
    VentaRequest, VentaResponse, VentaOut, VentasListResponse,
    CartRequest, CartResponse, CartItemResult,
    ResumenHoyResponse,
)
from config import settings

# ── FastAPI ──────────────────────────────────────────────
app = FastAPI(
    title="ArteCafexa API",
    description="API para gestión de cafetería con Supabase",
    version="2.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Supabase client (singleton) ─────────────────────────
_supabase: Client | None = None


def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        _supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _supabase


# ── Auth dependency ──────────────────────────────────────

async def require_auth(authorization: Optional[str] = Header(None)):
    """Verifica el token JWT de Supabase Auth."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token requerido")
    token = authorization.split(" ", 1)[1]
    try:
        sb = get_supabase()
        user = sb.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Token inválido")
        return user.user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token inválido: {e}")


# ════════════════════════════════════════════════════════
# AUTH ENDPOINTS
# ════════════════════════════════════════════════════════

@app.post("/api/auth/login", response_model=AuthResponse)
def login(req: LoginRequest):
    """Iniciar sesión con email y contraseña."""
    try:
        sb = get_supabase()
        res = sb.auth.sign_in_with_password({"email": req.email, "password": req.password})
        return AuthResponse(
            access_token=res.session.access_token,
            refresh_token=res.session.refresh_token,
            user_id=res.user.id,
            email=res.user.email,
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Credenciales inválidas: {e}")


@app.post("/api/auth/logout")
def logout(authorization: Optional[str] = Header(None)):
    """Cerrar sesión."""
    try:
        sb = get_supabase()
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ", 1)[1]
            sb.auth.sign_out(token)
    except Exception:
        pass
    return {"message": "Sesión cerrada"}


@app.get("/api/auth/me")
async def get_me(user=Depends(require_auth)):
    """Obtener el usuario actual."""
    return {"id": user.id, "email": user.email}


# ════════════════════════════════════════════════════════
# PUBLIC ENDPOINTS (POS)
# ════════════════════════════════════════════════════════

@app.get("/")
def read_root():
    return {
        "message": "ArteCafexa API - Sistema de Gestión de Cafetería",
        "version": "2.1.0",
        "endpoints": {
            "inventario": "/api/inventario",
            "menu": "/api/menu",
            "venta": "/api/venta",
            "auth": "/api/auth/login",
            "docs": "/docs",
        },
    }


@app.get("/api/inventario", response_model=InventarioResponse)
def get_inventario():
    """Inventario actual con alertas de stock mínimo."""
    try:
        sb = get_supabase()
        data = sb.table("vista_inventario").select("*").execute().data
        items = [InsumoOut(**row) for row in data]
        alerts = [i for i in items if i.alerta_stock]
        return InventarioResponse(
            inventory=items, alerts=alerts,
            total_items=len(items), items_with_alerts=len(alerts),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inventario: {e}")


@app.get("/api/menu", response_model=List[ProductoOut])
def get_menu():
    """Menú de productos con recetas."""
    try:
        sb = get_supabase()
        data = sb.table("vista_menu").select("*").execute().data
        products: List[ProductoOut] = []
        for row in data:
            receta_raw = row.get("receta") or []
            # Handle case where receta comes as JSON string
            if isinstance(receta_raw, str):
                try:
                    receta_raw = json.loads(receta_raw)
                except (json.JSONDecodeError, TypeError):
                    receta_raw = []
            receta = [RecetaItem(**r) for r in receta_raw]
            # Use explicit None checks (not `or`) to avoid treating 0.0 as falsy
            precio = row.get("precio_venta")
            if precio is None:
                precio = row.get("precio")
            if precio is None:
                precio = 0.0
            products.append(ProductoOut(
                id=row.get("producto_id") or row.get("id"),
                nombre=row.get("producto_nombre") or row.get("nombre"),
                precio=float(precio),
                icono=row.get("icono") or "coffee",
                receta=receta,
            ))
        return products
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error menú: {e}")


def call_rpc_venta(sb, producto_id: str, cantidad: int) -> dict:
    """Llama al RPC procesar_venta y maneja el APIError de postgrest-py."""
    try:
        result = sb.rpc(
            "procesar_venta",
            {"p_producto_id": producto_id, "p_cantidad": cantidad},
        ).execute()
        return result.data
    except APIError as e:
        # postgrest-py lanza APIError, args[0] es un str con formato dict Python
        raw = e.args[0] if e.args else ""
        try:
            err_dict = ast.literal_eval(raw) if isinstance(raw, str) else raw
        except Exception:
            raise e
        if isinstance(err_dict, dict):
            details = err_dict.get("details", "")
            # details puede ser bytes reales o un string tipo b'...'
            if isinstance(details, (bytes, bytearray)):
                return json.loads(details)
            if isinstance(details, str):
                # Convertir la representación string de bytes a bytes reales
                # e.g. "b'{\"success\": true, ...}'" -> bytes -> json
                try:
                    real_bytes = ast.literal_eval(details)
                    if isinstance(real_bytes, bytes):
                        return json.loads(real_bytes.decode("utf-8"))
                except Exception:
                    pass
                # Fallback: quitar prefijo b' y sufijo '
                m = re.match(r"^b['\"](.+)['\"]$", details, re.DOTALL)
                if m:
                    try:
                        return json.loads(m.group(1))
                    except json.JSONDecodeError:
                        pass
                try:
                    return json.loads(details)
                except json.JSONDecodeError:
                    pass
        raise


@app.post("/api/venta", response_model=VentaResponse)
def registrar_venta(venta: VentaRequest):
    """Registra una venta atómicamente."""
    try:
        sb = get_supabase()
        payload = call_rpc_venta(sb, venta.producto_id, venta.cantidad)
        if not payload:
            raise HTTPException(status_code=500, detail="Sin respuesta del servidor")
        if not payload.get("success"):
            raise HTTPException(status_code=400, detail=payload.get("error", "Error"))
        return VentaResponse(
            success=True,
            message=payload.get("message", "Venta registrada"),
            venta_id=payload.get("venta_id"),
            total=payload.get("total"),
        )
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "stock insuficiente" in error_msg.lower() or "no encontrado" in error_msg.lower():
            raise HTTPException(status_code=400, detail=error_msg)
        raise HTTPException(status_code=500, detail=f"Error venta: {error_msg}")


@app.post("/api/venta/carrito", response_model=CartResponse)
def registrar_carrito(cart: CartRequest):
    """Procesa múltiples productos del carrito."""
    sb = get_supabase()
    results: list = []
    total_general = 0.0
    all_ok = True

    for item in cart.items:
        try:
            payload = call_rpc_venta(sb, item.producto_id, item.cantidad)
            if payload and payload.get("success"):
                venta_id = payload.get("venta_id")
                # Actualizar método de pago
                if venta_id and cart.metodo_pago != "efectivo":
                    sb.table("ventas").update({"metodo_pago": cart.metodo_pago}).eq("id", venta_id).execute()
                t = float(payload.get("total", 0))
                total_general += t
                results.append(CartItemResult(
                    producto_id=item.producto_id,
                    producto_nombre=payload.get("producto"),
                    success=True,
                    message=payload.get("message", "OK"),
                    venta_id=venta_id,
                    total=t,
                ))
            else:
                all_ok = False
                results.append(CartItemResult(
                    producto_id=item.producto_id,
                    success=False,
                    message=payload.get("error", "Error desconocido") if payload else "Sin respuesta",
                ))
        except Exception as e:
            all_ok = False
            results.append(CartItemResult(
                producto_id=item.producto_id,
                success=False,
                message=str(e),
            ))

    return CartResponse(
        success=all_ok,
        message="Carrito procesado correctamente" if all_ok else "Algunos productos fallaron",
        results=results,
        total_general=total_general,
)


# ════════════════════════════════════════════════════════
# CRUD: INSUMOS (requiere auth)
# ════════════════════════════════════════════════════════

@app.post("/api/admin/insumos", response_model=InsumoOut)
async def create_insumo(data: InsumoCreate, user=Depends(require_auth)):
    try:
        sb = get_supabase()
        row = sb.table("insumos").insert(data.model_dump()).execute().data[0]
        return InsumoOut(**row, alerta_stock=row["cantidad_actual"] <= row["stock_minimo"],
                         porcentaje_stock=round((row["cantidad_actual"] / row["stock_minimo"] * 100) if row["stock_minimo"] > 0 else 100, 2))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creando insumo: {e}")


@app.put("/api/admin/insumos/{insumo_id}", response_model=InsumoOut)
async def update_insumo(insumo_id: str, data: InsumoUpdate, user=Depends(require_auth)):
    try:
        sb = get_supabase()
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="Nada que actualizar")
        row = sb.table("insumos").update(update_data).eq("id", insumo_id).execute().data
        if not row:
            raise HTTPException(status_code=404, detail="Insumo no encontrado")
        r = row[0]
        return InsumoOut(**r, alerta_stock=r["cantidad_actual"] <= r["stock_minimo"],
                         porcentaje_stock=round((r["cantidad_actual"] / r["stock_minimo"] * 100) if r["stock_minimo"] > 0 else 100, 2))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error actualizando insumo: {e}")


@app.delete("/api/admin/insumos/{insumo_id}")
async def delete_insumo(insumo_id: str, user=Depends(require_auth)):
    try:
        sb = get_supabase()
        sb.table("insumos").delete().eq("id", insumo_id).execute()
        return {"message": "Insumo eliminado"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error eliminando insumo: {e}")


# ════════════════════════════════════════════════════════
# CRUD: PRODUCTOS (requiere auth)
# ════════════════════════════════════════════════════════

@app.post("/api/admin/productos", response_model=dict)
async def create_producto(data: ProductoCreate, user=Depends(require_auth)):
    try:
        sb = get_supabase()
        prod = sb.table("productos").insert({
            "nombre": data.nombre, "precio_venta": data.precio_venta, "icono": data.icono
        }).execute().data[0]
        # Insertar recetas
        if data.recetas:
            recetas = [{"producto_id": prod["id"], "insumo_id": r.insumo_id,
                        "cantidad_consumida": r.cantidad_consumida} for r in data.recetas]
            sb.table("recetas").insert(recetas).execute()
        return {"id": prod["id"], "nombre": prod["nombre"], "precio_venta": prod["precio_venta"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creando producto: {e}")


@app.put("/api/admin/productos/{producto_id}", response_model=dict)
async def update_producto(producto_id: str, data: ProductoUpdate, user=Depends(require_auth)):
    try:
        sb = get_supabase()
        update_data = {}
        if data.nombre is not None:
            update_data["nombre"] = data.nombre
        if data.precio_venta is not None:
            update_data["precio_venta"] = data.precio_venta
        if data.icono is not None:
            update_data["icono"] = data.icono
        if update_data:
            sb.table("productos").update(update_data).eq("id", producto_id).execute()
        # Reemplazar recetas si se proporcionan
        if data.recetas is not None:
            sb.table("recetas").delete().eq("producto_id", producto_id).execute()
            if data.recetas:
                recetas = [{"producto_id": producto_id, "insumo_id": r.insumo_id,
                            "cantidad_consumida": r.cantidad_consumida} for r in data.recetas]
                sb.table("recetas").insert(recetas).execute()
        return {"message": "Producto actualizado", "id": producto_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error actualizando producto: {e}")


@app.delete("/api/admin/productos/{producto_id}")
async def delete_producto(producto_id: str, user=Depends(require_auth)):
    try:
        sb = get_supabase()
        sb.table("productos").delete().eq("id", producto_id).execute()
        return {"message": "Producto eliminado"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error eliminando producto: {e}")


# ════════════════════════════════════════════════════════
# CRUD: VENTAS (requiere auth para listar/eliminar)
# ════════════════════════════════════════════════════════

@app.get("/api/admin/resumen-hoy", response_model=ResumenHoyResponse)
async def resumen_hoy(user=Depends(require_auth)):
    """Ingreso total y cantidad de ventas del día de hoy."""
    try:
        sb = get_supabase()
        today = datetime.now().strftime("%Y-%m-%d")
        start = f"{today}T00:00:00"
        end = f"{today}T23:59:59"
        data = sb.table("ventas").select("precio_total").gte(
            "fecha_hora", start
        ).lte("fecha_hora", end).execute().data
        ingreso = sum(row["precio_total"] for row in data)
        return ResumenHoyResponse(ingreso_hoy=ingreso, ventas_hoy=len(data))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resumen hoy: {e}")


@app.get("/api/admin/ventas", response_model=VentasListResponse)
async def list_ventas(limit: int = 50, offset: int = 0, user=Depends(require_auth)):
    """Lista las ventas con nombre de producto."""
    try:
        sb = get_supabase()
        data = sb.table("ventas").select(
            "id, fecha_hora, producto_id, cantidad, precio_total, metodo_pago, productos(nombre)"
        ).order("fecha_hora", desc=True).range(offset, offset + limit - 1).execute().data
        ventas = []
        for row in data:
            prod = row.get("productos")
            ventas.append(VentaOut(
                id=row["id"],
                fecha_hora=row["fecha_hora"],
                producto_id=row["producto_id"],
                producto_nombre=prod["nombre"] if prod else None,
                cantidad=row["cantidad"],
                precio_total=row["precio_total"],
                metodo_pago=row.get("metodo_pago", "efectivo"),
            ))
        # Count total
        count_data = sb.table("ventas").select("id", count="exact").execute()
        total = count_data.count or len(ventas)
        return VentasListResponse(ventas=ventas, total=total)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listando ventas: {e}")


@app.delete("/api/admin/ventas/{venta_id}")
async def delete_venta(venta_id: str, user=Depends(require_auth)):
    try:
        sb = get_supabase()
        sb.table("ventas").delete().eq("id", venta_id).execute()
        return {"message": "Venta eliminada"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error eliminando venta: {e}")


# ── Legacy aliases ───────────────────────────────────────
@app.get("/inventory")
def legacy_inventory():
    return get_inventario()

@app.get("/products")
def legacy_products():
    return get_menu()

@app.post("/sales")
def legacy_sales(sale: VentaRequest):
    return registrar_venta(sale)


# ── Health ───────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
