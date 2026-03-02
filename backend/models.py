from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# ── Auth ─────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: str
    email: str


# ── Insumos (Inventario) ────────────────────────────────

class InsumoOut(BaseModel):
    """Un insumo del inventario"""
    id: str
    nombre: str
    cantidad_actual: float
    unidad: str
    stock_minimo: float
    alerta_stock: bool = False
    porcentaje_stock: float = 100.0


class InsumoCreate(BaseModel):
    nombre: str
    cantidad_actual: float = Field(ge=0)
    unidad: str
    stock_minimo: float = Field(ge=0)


class InsumoUpdate(BaseModel):
    nombre: Optional[str] = None
    cantidad_actual: Optional[float] = Field(default=None, ge=0)
    unidad: Optional[str] = None
    stock_minimo: Optional[float] = Field(default=None, ge=0)


# ── Productos ────────────────────────────────────────────

class RecetaItem(BaseModel):
    """Un ingrediente dentro de la receta de un producto"""
    insumo_id: str
    insumo: str
    cantidad: float


class RecetaCreate(BaseModel):
    insumo_id: str
    cantidad_consumida: float = Field(gt=0)


class ProductoOut(BaseModel):
    """Producto del menú con su receta"""
    id: str
    nombre: str
    precio: float
    icono: str = "coffee"
    receta: List[RecetaItem]


class ProductoCreate(BaseModel):
    nombre: str
    precio_venta: float = Field(gt=0)
    icono: str = "coffee"
    recetas: List[RecetaCreate] = []


class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    precio_venta: Optional[float] = Field(default=None, gt=0)
    icono: Optional[str] = None
    recetas: Optional[List[RecetaCreate]] = None


# ── Ventas ───────────────────────────────────────────────

class VentaOut(BaseModel):
    id: str
    fecha_hora: str
    producto_id: str
    producto_nombre: Optional[str] = None
    cantidad: int
    precio_total: float
    metodo_pago: str = "efectivo"


class VentaRequest(BaseModel):
    """Petición para registrar una venta"""
    producto_id: str
    cantidad: int = Field(default=1, ge=1)


class VentaResponse(BaseModel):
    """Respuesta tras registrar una venta"""
    success: bool
    message: str
    venta_id: Optional[str] = None
    total: Optional[float] = None


class CartItem(BaseModel):
    """Un ítem del carrito"""
    producto_id: str
    cantidad: int = Field(ge=1)


class CartRequest(BaseModel):
    """Petición para registrar ventas del carrito"""
    items: List[CartItem] = Field(min_length=1)
    metodo_pago: str = "efectivo"  # efectivo | tarjeta


class CartItemResult(BaseModel):
    producto_id: str
    producto_nombre: Optional[str] = None
    success: bool
    message: str
    venta_id: Optional[str] = None
    total: Optional[float] = None


class CartResponse(BaseModel):
    """Respuesta tras procesar el carrito"""
    success: bool
    message: str
    results: List[CartItemResult]
    total_general: float


# ── Responses ────────────────────────────────────────────

class InventarioResponse(BaseModel):
    """Respuesta del endpoint /api/inventario"""
    inventory: List[InsumoOut]
    alerts: List[InsumoOut]
    total_items: int
    items_with_alerts: int


class VentasListResponse(BaseModel):
    ventas: List[VentaOut]
    total: int


class ResumenHoyResponse(BaseModel):
    ingreso_hoy: float
    ventas_hoy: int
