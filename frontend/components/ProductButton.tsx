import { Coffee, CakeSlice } from 'lucide-react'
import { type Product } from '@/lib/api'

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  coffee: Coffee,
  dessert: CakeSlice,
}

const ICON_COLORS: Record<string, { bg: string; text: string }> = {
  coffee: { bg: 'bg-primary-100 group-hover:bg-primary-200', text: 'text-primary-600' },
  dessert: { bg: 'bg-pink-100 group-hover:bg-pink-200', text: 'text-pink-600' },
}

interface ProductButtonProps {
  product: Product
  cartQty?: number
  onClick: () => void
}

export default function ProductButton({ product, cartQty = 0, onClick }: ProductButtonProps) {
  const iconKey = product.icono || 'coffee'
  const Icon = ICON_MAP[iconKey] || Coffee
  const colors = ICON_COLORS[iconKey] || ICON_COLORS.coffee

  return (
    <button
      onClick={onClick}
      className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 p-6 border-2 border-transparent hover:border-primary-400 active:scale-95"
    >
      {/* Cart badge */}
      {cartQty > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center z-10 shadow">
          {cartQty}
        </span>
      )}

      <div className="flex flex-col items-center space-y-3">
        {/* Icon */}
        <div className={`${colors.bg} rounded-full p-4 transition-colors`}>
          <Icon className={`h-10 w-10 ${colors.text}`} />
        </div>
        
        {/* Product Name */}
        <h3 className="text-lg font-bold text-gray-800 text-center">
          {product.nombre}
        </h3>
        
        {/* Price */}
        <div className="bg-primary-50 px-4 py-2 rounded-full">
          <p className="text-2xl font-bold text-primary-700">
            ${product.precio.toFixed(2)}
          </p>
        </div>
        
        {/* Recipe Info */}
        <div className="text-xs text-gray-500 text-center">
          {product.receta.length} insumo{product.receta.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 rounded-xl bg-primary-400 opacity-0 group-hover:opacity-5 transition-opacity" />
    </button>
  )
}
