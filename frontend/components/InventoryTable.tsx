import { AlertTriangle, CheckCircle } from 'lucide-react'
import { type InventoryItem } from '@/lib/api'

interface InventoryTableProps {
  items: InventoryItem[]
}

export default function InventoryTable({ items }: InventoryTableProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay items en el inventario
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b-2 border-gray-200">
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Insumo
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Cantidad
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Unidad
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Stock Mínimo
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Nivel
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => {
            const percentage = item.porcentaje_stock
            let statusColor = 'bg-green-100 text-green-800'
            let barColor = 'bg-green-500'
            let icon = <CheckCircle className="h-5 w-5" />
            
            if (item.alerta_stock) {
              if (percentage < 50) {
                statusColor = 'bg-red-100 text-red-800'
                barColor = 'bg-red-500'
              } else {
                statusColor = 'bg-yellow-100 text-yellow-800'
                barColor = 'bg-yellow-500'
              }
              icon = <AlertTriangle className="h-5 w-5" />
            }

            return (
              <tr
                key={item.id}
                className={`hover:bg-gray-50 transition-colors ${
                  item.alerta_stock ? 'bg-red-50' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                    {icon}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {item.nombre}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className={`text-sm font-bold ${
                    item.alerta_stock ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {item.cantidad_actual.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{item.unidad}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-600">
                    {item.stock_minimo.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${barColor}`}
                        style={{
                          width: `${Math.min(Math.max(percentage, 0), 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 font-medium min-w-[45px]">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
