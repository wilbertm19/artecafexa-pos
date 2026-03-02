'use client'

import useSWR from 'swr'
import { TrendingUp, Package, AlertTriangle, DollarSign, Loader2 } from 'lucide-react'
import InventoryTable from '@/components/InventoryTable'
import { fetchInventory, type InventoryResponse } from '@/lib/api'

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR<InventoryResponse>(
    '/inventory',
    fetchInventory,
    {
      refreshInterval: 10000, // Refresh cada 10 segundos
    }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold mb-2">Error al cargar datos</p>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  const totalItems = data?.total_items || 0
  const alertsCount = data?.items_with_alerts || 0
  const inventoryItems = data?.inventory || []

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard de Administración</h1>
        <p className="text-gray-600">Monitoreo en tiempo real del inventario y alertas</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Items */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Insumos</p>
              <p className="text-3xl font-bold text-gray-800">{totalItems}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
          alertsCount > 0 ? 'border-red-500' : 'border-green-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Alertas de Stock</p>
              <p className={`text-3xl font-bold ${
                alertsCount > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {alertsCount}
              </p>
            </div>
            <div className={`${
              alertsCount > 0 ? 'bg-red-100' : 'bg-green-100'
            } rounded-full p-3`}>
              <AlertTriangle className={`h-8 w-8 ${
                alertsCount > 0 ? 'text-red-600' : 'text-green-600'
              }`} />
            </div>
          </div>
        </div>

        {/* Today's Sales Placeholder */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Ventas Hoy</p>
              <p className="text-3xl font-bold text-gray-800">-</p>
              <p className="text-xs text-gray-500 mt-1">Próximamente</p>
            </div>
            <div className="bg-primary-100 rounded-full p-3">
              <DollarSign className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Revenue Placeholder */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Utilidad Diaria</p>
              <p className="text-3xl font-bold text-gray-800">-</p>
              <p className="text-xs text-gray-500 mt-1">Próximamente</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Estado del Inventario</h2>
        <InventoryTable items={inventoryItems} />
      </div>
    </div>
  )
}
