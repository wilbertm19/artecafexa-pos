'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Trash2, Loader2, Receipt, Calendar, DollarSign, Search, Banknote, CreditCard } from 'lucide-react'
import { fetchVentas, deleteVenta, type VentaOut, type VentasListResponse } from '@/lib/api'

const ventasFetcher = () => fetchVentas()

export default function AdminVentas() {
  const { data, error, isLoading, mutate } = useSWR<VentasListResponse>('/admin/ventas', ventasFetcher, { refreshInterval: 15000 })
  const [search, setSearch] = useState('')
  const [msg, setMsg] = useState('')

  const ventas = data?.ventas || []
  const total = data?.total || 0

  const filtered = search
    ? ventas.filter(v =>
        v.producto_nombre?.toLowerCase().includes(search.toLowerCase()) ||
        v.id.includes(search)
      )
    : ventas

  const totalIngresos = ventas.reduce((s, v) => s + (v.precio_total || 0), 0)

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este registro de venta?')) return
    try {
      await deleteVenta(id)
      setMsg('Venta eliminada')
      mutate()
    } catch (err: any) {
      setMsg(`Error: ${err.message}`)
    }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>
  if (error) return <p className="text-red-600 text-center py-8">Error al cargar ventas</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Registro de Ventas</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg"><Receipt className="h-6 w-6 text-blue-600" /></div>
          <div>
            <p className="text-sm text-gray-500">Total Ventas</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg"><DollarSign className="h-6 w-6 text-green-600" /></div>
          <div>
            <p className="text-sm text-gray-500">Ingresos Totales</p>
            <p className="text-2xl font-bold text-green-700">${totalIngresos.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg"><Calendar className="h-6 w-6 text-purple-600" /></div>
          <div>
            <p className="text-sm text-gray-500">Ticket Promedio</p>
            <p className="text-2xl font-bold text-purple-700">${total > 0 ? (totalIngresos / total).toFixed(2) : '0.00'}</p>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por producto o ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 bg-white" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Producto</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Cantidad</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">P. Unit.</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Pago</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No hay ventas registradas</td></tr>
            ) : filtered.map(v => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(v.fecha_hora)}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{v.producto_nombre || v.producto_id}</td>
                <td className="px-4 py-3 text-right text-gray-900">{v.cantidad}</td>
                <td className="px-4 py-3 text-right text-gray-600">${v.cantidad > 0 ? (v.precio_total / v.cantidad).toFixed(2) : '-'}</td>
                <td className="px-4 py-3 text-right font-bold text-green-700">${v.precio_total?.toFixed(2) || '-'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    v.metodo_pago === 'tarjeta' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {v.metodo_pago === 'tarjeta' ? <CreditCard className="h-3 w-3" /> : <Banknote className="h-3 w-3" />}
                    {v.metodo_pago === 'tarjeta' ? 'Tarjeta' : 'Efectivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleDelete(v.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
