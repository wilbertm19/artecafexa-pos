'use client'

import useSWR from 'swr'
import { TrendingUp, Package, AlertTriangle, DollarSign, Loader2 } from 'lucide-react'
import { fetchInventory, fetchVentas, fetchResumenHoy, type InventoryResponse, type VentasListResponse, type ResumenHoy } from '@/lib/api'

export default function AdminDashboard() {
  const { data: inv } = useSWR<InventoryResponse>('/admin/inv', fetchInventory, { refreshInterval: 10000 })
  const { data: ventasData } = useSWR<VentasListResponse>('/admin/ventas', () => fetchVentas(10), { refreshInterval: 10000 })
  const { data: resumen } = useSWR<ResumenHoy>('/admin/resumen-hoy', fetchResumenHoy, { refreshInterval: 10000 })

  const totalItems = inv?.total_items || 0
  const alertsCount = inv?.items_with_alerts || 0
  const ventas = ventasData?.ventas || []
  const totalVentas = ventasData?.total || 0

  // Ventas de hoy (del endpoint dedicado)
  const ingresoHoy = resumen?.ingreso_hoy ?? 0
  const ventasHoyCount = resumen?.ventas_hoy ?? 0

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Panel de Administración</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Insumos</p>
              <p className="text-3xl font-bold text-gray-800">{totalItems}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3"><Package className="h-8 w-8 text-blue-600" /></div>
          </div>
        </div>

        <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${alertsCount > 0 ? 'border-red-500' : 'border-green-500'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Alertas Stock</p>
              <p className={`text-3xl font-bold ${alertsCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{alertsCount}</p>
            </div>
            <div className={`${alertsCount > 0 ? 'bg-red-100' : 'bg-green-100'} rounded-full p-3`}>
              <AlertTriangle className={`h-8 w-8 ${alertsCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Ventas Totales</p>
              <p className="text-3xl font-bold text-gray-800">{totalVentas}</p>
            </div>
            <div className="bg-primary-100 rounded-full p-3"><DollarSign className="h-8 w-8 text-primary-600" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Ingreso Hoy</p>
              <p className="text-3xl font-bold text-green-600">${ingresoHoy.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3"><TrendingUp className="h-8 w-8 text-green-600" /></div>
          </div>
        </div>
      </div>

      {/* Recent sales */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Últimas Ventas</h2>
        {ventas.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay ventas registradas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 text-left">
                  <th className="px-4 py-2 font-semibold text-gray-700">Fecha</th>
                  <th className="px-4 py-2 font-semibold text-gray-700">Producto</th>
                  <th className="px-4 py-2 font-semibold text-gray-700 text-right">Cant.</th>
                  <th className="px-4 py-2 font-semibold text-gray-700 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map(v => (
                  <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-600">{new Date(v.fecha_hora).toLocaleString('es-MX')}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">{v.producto_nombre || '-'}</td>
                    <td className="px-4 py-2 text-right text-gray-900">{v.cantidad}</td>
                    <td className="px-4 py-2 text-right font-bold text-green-600">${v.precio_total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
