'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { Coffee, AlertCircle, Loader2, ShoppingCart } from 'lucide-react'
import ProductButton from '@/components/ProductButton'
import CartPanel from '@/components/CartPanel'
import { fetchProducts, type Product } from '@/lib/api'

export interface CartEntry {
  product: Product
  cantidad: number
}

export default function POSPage() {
  const [cart, setCart] = useState<CartEntry[]>([])
  const [showCart, setShowCart] = useState(false)

  const { data: products, error, isLoading, mutate } = useSWR<Product[]>(
    '/products',
    fetchProducts,
    { refreshInterval: 30000, revalidateOnFocus: true }
  )

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(e => e.product.id === product.id)
      if (existing) {
        return prev.map(e => e.product.id === product.id ? { ...e, cantidad: e.cantidad + 1 } : e)
      }
      return [...prev, { product, cantidad: 1 }]
    })
    setShowCart(true)
  }, [])

  const updateQuantity = useCallback((productId: string, cantidad: number) => {
    if (cantidad <= 0) {
      setCart(prev => prev.filter(e => e.product.id !== productId))
    } else {
      setCart(prev => prev.map(e => e.product.id === productId ? { ...e, cantidad } : e))
    }
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(e => e.product.id !== productId))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartCount = cart.reduce((s, e) => s + e.cantidad, 0)

  const handleSaleSuccess = () => {
    clearCart()
    mutate()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold mb-2">Error al cargar productos</p>
          <button onClick={() => mutate()}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Coffee className="h-10 w-10 text-primary-600 mr-2" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Punto de Venta</h1>
            <p className="text-gray-500 text-sm">Toca un producto para agregarlo al carrito</p>
          </div>
        </div>
        <button onClick={() => setShowCart(true)}
          className="relative flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl transition shadow-lg">
          <ShoppingCart className="h-6 w-6" />
          <span className="font-bold text-lg">Carrito</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => {
            const inCart = cart.find(e => e.product.id === product.id)
            return (
              <ProductButton
                key={product.id}
                product={product}
                cartQty={inCart?.cantidad || 0}
                onClick={() => addToCart(product)}
              />
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Coffee className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hay productos disponibles</p>
        </div>
      )}

      {/* Cart Side Panel */}
      <CartPanel
        isOpen={showCart}
        cart={cart}
        onClose={() => setShowCart(false)}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onClear={clearCart}
        onSuccess={handleSaleSuccess}
      />
    </div>
  )
}
