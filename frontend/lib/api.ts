// API Base URL - Railway en producción, localhost solo en desarrollo local
const RAILWAY_URL = 'https://artecafexa-pos-production.up.railway.app'
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? RAILWAY_URL
    : 'http://localhost:8000')

// ── Auth helpers ────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
}

export function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

// ── Types ───────────────────────────────────────────────

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user_id: string
  email: string
}

export interface RecetaItem {
  insumo_id: string
  insumo: string
  cantidad: number
}

export interface Product {
  id: string
  nombre: string
  precio: number
  icono: string
  receta: RecetaItem[]
}

export interface InventoryItem {
  id: string
  nombre: string
  cantidad_actual: number
  unidad: string
  stock_minimo: number
  alerta_stock: boolean
  porcentaje_stock: number
}

export interface InventoryResponse {
  inventory: InventoryItem[]
  alerts: InventoryItem[]
  total_items: number
  items_with_alerts: number
}

export interface SaleRequest {
  producto_id: string
  cantidad: number
}

export interface SaleResponse {
  success: boolean
  message: string
  venta_id?: string
  total?: number
}

export interface VentaOut {
  id: string
  fecha_hora: string
  producto_id: string
  producto_nombre?: string
  cantidad: number
  precio_total: number
  metodo_pago: string
}

export interface VentasListResponse {
  ventas: VentaOut[]
  total: number
}

export interface RecetaCreate {
  insumo_id: string
  cantidad_consumida: number
}

export interface CartItem {
  producto_id: string
  cantidad: number
}

export interface CartItemResult {
  producto_id: string
  producto_nombre?: string
  success: boolean
  message: string
  venta_id?: string
  total?: number
}

export interface CartResponse {
  success: boolean
  message: string
  results: CartItemResult[]
  total_general: number
}

// ── Auth ────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.detail || 'Error de autenticación')
  }
  const data: AuthResponse = await response.json()
  setTokens(data.access_token, data.refresh_token)
  return data
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: authHeaders(),
    })
  } finally {
    clearTokens()
  }
}

export async function getMe(): Promise<{ id: string; email: string } | null> {
  const token = getToken()
  if (!token) return null
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, { headers: authHeaders() })
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

// ── Public fetchers (POS) ───────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/api/menu`)
  } catch (err) {
    throw new Error(`No se pudo conectar al servidor (${API_BASE_URL}). Verifica que el backend esté corriendo.`)
  }
  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try {
      const body = await response.json()
      detail = body.detail || detail
    } catch {}
    throw new Error(`Error al cargar productos: ${detail}`)
  }
  return response.json()
}

export async function fetchInventory(): Promise<InventoryResponse> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/api/inventario`)
  } catch (err) {
    throw new Error(`No se pudo conectar al servidor (${API_BASE_URL}). Verifica que el backend esté corriendo.`)
  }
  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try {
      const body = await response.json()
      detail = body.detail || detail
    } catch {}
    throw new Error(`Error al cargar inventario: ${detail}`)
  }
  return response.json()
}

export async function registerSale(sale: SaleRequest): Promise<SaleResponse> {
  const response = await fetch(`${API_BASE_URL}/api/venta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sale),
  })
  const data = await response.json()
  if (!response.ok) {
    if (response.status === 400 && data.detail) {
      throw new Error(typeof data.detail === 'string' ? data.detail : data.detail.message || 'Stock insuficiente')
    }
    throw new Error('Error al registrar venta')
  }
  return data
}

export async function registerCart(items: CartItem[], metodo_pago: string = 'efectivo'): Promise<CartResponse> {
  const response = await fetch(`${API_BASE_URL}/api/venta/carrito`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, metodo_pago }),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.detail || 'Error al procesar carrito')
  }
  return data
}

// ── Admin: Insumos CRUD ─────────────────────────────────

export async function createInsumo(data: { nombre: string; cantidad_actual: number; unidad: string; stock_minimo: number }) {
  const res = await fetch(`${API_BASE_URL}/api/admin/insumos`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  })
  if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Error') }
  return res.json()
}

export async function updateInsumo(id: string, data: Partial<{ nombre: string; cantidad_actual: number; unidad: string; stock_minimo: number }>) {
  const res = await fetch(`${API_BASE_URL}/api/admin/insumos/${id}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  })
  if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Error') }
  return res.json()
}

export async function deleteInsumo(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/admin/insumos/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  })
  if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Error') }
  return res.json()
}

// ── Admin: Productos CRUD ───────────────────────────────

export async function createProducto(data: { nombre: string; precio_venta: number; icono?: string; recetas?: RecetaCreate[] }) {
  const res = await fetch(`${API_BASE_URL}/api/admin/productos`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  })
  if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Error') }
  return res.json()
}

export async function updateProducto(id: string, data: { nombre?: string; precio_venta?: number; icono?: string; recetas?: RecetaCreate[] }) {
  const res = await fetch(`${API_BASE_URL}/api/admin/productos/${id}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  })
  if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Error') }
  return res.json()
}

export async function deleteProducto(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/admin/productos/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  })
  if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Error') }
  return res.json()
}

// ── Admin: Ventas ───────────────────────────────────────

export async function fetchVentas(limit = 50, offset = 0): Promise<VentasListResponse> {
  const res = await fetch(`${API_BASE_URL}/api/admin/ventas?limit=${limit}&offset=${offset}`, {
    headers: authHeaders(),
  })
  if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Error') }
  return res.json()
}

export async function deleteVenta(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/admin/ventas/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  })
  if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Error') }
  return res.json()
}

// ── Admin: Resumen Hoy ────────────────────────────────────

export interface ResumenHoy {
  ingreso_hoy: number
  ventas_hoy: number
}

export async function fetchResumenHoy(): Promise<ResumenHoy> {
  const res = await fetch(`${API_BASE_URL}/api/admin/resumen-hoy`, {
    headers: authHeaders(),
  })
  if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Error') }
  return res.json()
}
