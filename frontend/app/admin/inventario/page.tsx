'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Pencil, Trash2, X, Save, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
import { fetchInventory, createInsumo, updateInsumo, deleteInsumo, type InventoryResponse, type InventoryItem } from '@/lib/api'

export default function AdminInventario() {
  const { data, error, isLoading, mutate } = useSWR<InventoryResponse>('/admin/inventario', fetchInventory, { refreshInterval: 10000 })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [formData, setFormData] = useState({ nombre: '', cantidad_actual: 0, unidad: '', stock_minimo: 0 })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const items = data?.inventory || []

  const resetForm = () => {
    setFormData({ nombre: '', cantidad_actual: 0, unidad: '', stock_minimo: 0 })
    setEditingId(null)
    setShowAdd(false)
  }

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id)
    setFormData({ nombre: item.nombre, cantidad_actual: item.cantidad_actual, unidad: item.unidad, stock_minimo: item.stock_minimo })
    setShowAdd(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setMsg('')
    try {
      if (editingId) {
        await updateInsumo(editingId, formData)
        setMsg('Insumo actualizado')
      } else {
        await createInsumo(formData)
        setMsg('Insumo creado')
      }
      resetForm()
      mutate()
    } catch (err: any) {
      setMsg(`Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return
    try {
      await deleteInsumo(id)
      setMsg('Insumo eliminado')
      mutate()
    } catch (err: any) {
      setMsg(`Error: ${err.message}`)
    }
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>
  if (error) return <p className="text-red-600 text-center py-8">Error al cargar inventario</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Inventario</h1>
        <button onClick={() => { setShowAdd(true); setEditingId(null); setFormData({ nombre: '', cantidad_actual: 0, unidad: '', stock_minimo: 0 }) }}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition">
          <Plus className="h-5 w-5" /> Agregar Insumo
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {msg}
        </div>
      )}

      {/* Add / Edit Form */}
      {(showAdd || editingId) && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'Editar Insumo' : 'Nuevo Insumo'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <input type="number" step="0.01" value={formData.cantidad_actual} onChange={e => setFormData({...formData, cantidad_actual: parseFloat(e.target.value) || 0})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
              <input type="text" value={formData.unidad} onChange={e => setFormData({...formData, unidad: e.target.value})}
                placeholder="kg, L, unidad..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
              <input type="number" step="0.01" value={formData.stock_minimo} onChange={e => setFormData({...formData, stock_minimo: parseFloat(e.target.value) || 0})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 bg-white" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={saving || !formData.nombre || !formData.unidad}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar
            </button>
            <button onClick={resetForm} className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg transition">
              <X className="h-4 w-4" /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Insumo</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Cantidad</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Unidad</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Stock Mín.</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Nivel</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map(item => (
              <tr key={item.id} className={`hover:bg-gray-50 ${item.alerta_stock ? 'bg-red-50' : ''}`}>
                <td className="px-4 py-3">
                  {item.alerta_stock
                    ? <AlertTriangle className="h-5 w-5 text-red-500" />
                    : <CheckCircle className="h-5 w-5 text-green-500" />}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{item.nombre}</td>
                <td className={`px-4 py-3 text-right font-bold ${item.alerta_stock ? 'text-red-600' : 'text-gray-900'}`}>
                  {item.cantidad_actual.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-gray-600">{item.unidad}</td>
                <td className="px-4 py-3 text-right text-gray-600">{item.stock_minimo.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${item.porcentaje_stock < 50 ? 'bg-red-500' : item.porcentaje_stock < 100 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(item.porcentaje_stock, 100)}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-10 text-right">{item.porcentaje_stock.toFixed(0)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => startEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id, item.nombre)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
