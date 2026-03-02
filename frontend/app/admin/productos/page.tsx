'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Pencil, Trash2, X, Save, Loader2, ChefHat, Coffee, CakeSlice } from 'lucide-react'
import {
  fetchProducts, fetchInventory, createProducto, updateProducto, deleteProducto,
  type Product, type InventoryResponse, type InventoryItem, type RecetaCreate
} from '@/lib/api'

const ICON_OPTIONS = [
  { value: 'coffee', label: 'Café', Icon: Coffee, bg: 'bg-primary-100', text: 'text-primary-600', ring: 'ring-primary-400' },
  { value: 'dessert', label: 'Postre', Icon: CakeSlice, bg: 'bg-pink-100', text: 'text-pink-600', ring: 'ring-pink-400' },
]

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = { coffee: Coffee, dessert: CakeSlice }
const ICON_COLORS: Record<string, { bg: string; text: string }> = {
  coffee: { bg: 'bg-primary-100', text: 'text-primary-600' },
  dessert: { bg: 'bg-pink-100', text: 'text-pink-600' },
}

export default function AdminProductos() {
  const { data: products, error, isLoading, mutate } = useSWR<Product[]>('/admin/productos', fetchProducts, { refreshInterval: 10000 })
  const { data: invData } = useSWR<InventoryResponse>('/admin/inv-for-products', fetchInventory)
  const insumos: InventoryItem[] = invData?.inventory || []

  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState(0)
  const [icono, setIcono] = useState('coffee')
  const [receta, setReceta] = useState<{ insumo_id: string; cantidad_consumida: number }[]>([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const resetForm = () => {
    setNombre(''); setPrecio(0); setIcono('coffee'); setReceta([])
    setEditingId(null); setShowAdd(false)
  }

  const startAdd = () => { resetForm(); setShowAdd(true) }

  const startEdit = (p: Product) => {
    setEditingId(p.id); setShowAdd(false)
    setNombre(p.nombre); setPrecio(p.precio); setIcono(p.icono || 'coffee')
    // Pre-load existing recipe from product data
    const existingReceta = p.receta.map(r => ({
      insumo_id: r.insumo_id,
      cantidad_consumida: r.cantidad,
    }))
    setReceta(existingReceta)
  }

  const addRecetaRow = () => setReceta([...receta, { insumo_id: insumos[0]?.id || '', cantidad_consumida: 0 }])
  const removeRecetaRow = (idx: number) => setReceta(receta.filter((_, i) => i !== idx))
  const updateRecetaRow = (idx: number, field: string, val: any) => {
    const copy = [...receta]
    ;(copy[idx] as any)[field] = val
    setReceta(copy)
  }

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try {
      const validReceta = receta.filter(r => r.insumo_id && r.cantidad_consumida > 0)
      if (editingId) {
        await updateProducto(editingId, { nombre, precio_venta: precio, icono, recetas: validReceta })
        setMsg('Producto actualizado')
      } else {
        await createProducto({ nombre, precio_venta: precio, icono, recetas: validReceta })
        setMsg('Producto creado')
      }
      resetForm(); mutate()
    } catch (err: any) {
      setMsg(`Error: ${err.message}`)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"? Esto también eliminará sus recetas.`)) return
    try {
      await deleteProducto(id)
      setMsg('Producto eliminado'); mutate()
    } catch (err: any) { setMsg(`Error: ${err.message}`) }
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>
  if (error) return <p className="text-red-600 text-center py-8">Error al cargar productos</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Productos</h1>
        <button onClick={startAdd}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition">
          <Plus className="h-5 w-5" /> Agregar Producto
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>
      )}

      {(showAdd || editingId) && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio (MXN)</label>
              <input type="number" step="0.5" value={precio} onChange={e => setPrecio(parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 bg-white" />
            </div>
          </div>

          {/* Icon selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Icono del producto</label>
            <div className="flex gap-3">
              {ICON_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => setIcono(opt.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition ${icono === opt.value ? `${opt.bg} border-transparent ring-2 ${opt.ring}` : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                  <opt.Icon className={`h-6 w-6 ${icono === opt.value ? opt.text : 'text-gray-400'}`} />
                  <span className={`font-medium text-sm ${icono === opt.value ? 'text-gray-800' : 'text-gray-500'}`}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Receta section (both create and edit) */}
          <div className="border-t pt-4 mt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2"><ChefHat className="h-5 w-5" /> Receta (ingredientes)</h3>
              <button onClick={addRecetaRow} className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1">
                <Plus className="h-4 w-4" /> Agregar ingrediente
              </button>
            </div>
            {receta.map((r, idx) => (
              <div key={idx} className="flex gap-3 mb-2 items-center">
                <select value={r.insumo_id} onChange={e => updateRecetaRow(idx, 'insumo_id', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white">
                  <option value="">— Seleccionar insumo —</option>
                  {insumos.map(ins => <option key={ins.id} value={ins.id}>{ins.nombre} ({ins.unidad})</option>)}
                </select>
                <input type="number" step="0.01" value={r.cantidad_consumida} onChange={e => updateRecetaRow(idx, 'cantidad_consumida', parseFloat(e.target.value) || 0)}
                  placeholder="Cantidad" className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white" />
                <button onClick={() => removeRecetaRow(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded"><X className="h-4 w-4" /></button>
              </div>
            ))}
            {receta.length === 0 && <p className="text-sm text-gray-400 italic">Sin ingredientes aún</p>}
            {editingId && <p className="text-xs text-amber-600 mt-2">⚠ Al guardar, la receta se reemplazará completamente con lo de arriba.</p>}
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={saving || !nombre || precio <= 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar
            </button>
            <button onClick={resetForm} className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg transition">
              <X className="h-4 w-4" /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(products || []).map(p => {
          const iconKey = p.icono || 'coffee'
          const Icon = ICON_MAP[iconKey] || Coffee
          const colors = ICON_COLORS[iconKey] || ICON_COLORS.coffee
          return (
            <div key={p.id} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`${colors.bg} rounded-lg p-2`}>
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{p.nombre}</h3>
                    <p className="text-xs text-gray-500">{p.receta.length} ingrediente{p.receta.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-primary-600">${p.precio.toFixed(2)}</span>
              </div>
              <div className="flex gap-2 mt-3 border-t pt-3">
                <button onClick={() => startEdit(p)} className="flex-1 flex items-center justify-center gap-1 text-sm text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg transition">
                  <Pencil className="h-4 w-4" /> Editar
                </button>
                <button onClick={() => handleDelete(p.id, p.nombre)} className="flex-1 flex items-center justify-center gap-1 text-sm text-red-600 hover:bg-red-50 py-1.5 rounded-lg transition">
                  <Trash2 className="h-4 w-4" /> Eliminar
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
