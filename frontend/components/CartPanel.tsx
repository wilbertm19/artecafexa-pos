'use client'

import { useState } from 'react'
import {
  X, Minus, Plus, Trash2, ShoppingCart, Loader2, CheckCircle,
  AlertCircle, CreditCard, Coffee, CakeSlice, Banknote, Wallet
} from 'lucide-react'
import { registerCart, type CartResponse } from '@/lib/api'
import type { CartEntry } from '@/app/page'

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  coffee: Coffee,
  dessert: CakeSlice,
}

interface CartPanelProps {
  isOpen: boolean
  cart: CartEntry[]
  onClose: () => void
  onUpdateQuantity: (productId: string, cantidad: number) => void
  onRemove: (productId: string) => void
  onClear: () => void
  onSuccess: () => void
}

export default function CartPanel({
  isOpen, cart, onClose, onUpdateQuantity, onRemove, onClear, onSuccess
}: CartPanelProps) {
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<CartResponse | null>(null)
  const [error, setError] = useState('')
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta'>('efectivo')

  const total = cart.reduce((s, e) => s + e.product.precio * e.cantidad, 0)
  const itemCount = cart.reduce((s, e) => s + e.cantidad, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setProcessing(true)
    setError('')
    setResult(null)
    try {
      const items = cart.map(e => ({ producto_id: e.product.id, cantidad: e.cantidad }))
      const res = await registerCart(items, metodoPago)
      setResult(res)
      if (res.success) {
        setTimeout(() => {
          onSuccess()
          setResult(null)
          onClose()
        }, 2500)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleClose = () => {
    if (!processing) {
      setResult(null)
      setError('')
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={handleClose} />
      )}

      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <ShoppingCart className="h-6 w-6" />
              <h2 className="text-xl font-bold">Carrito</h2>
              {itemCount > 0 && (
                <span className="bg-white/20 text-sm px-2 py-0.5 rounded-full">
                  {itemCount} item{itemCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button onClick={handleClose} disabled={processing}
              className="text-white hover:bg-white/20 rounded-full p-1 transition disabled:opacity-50">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {cart.length === 0 && !result ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingCart className="h-16 w-16 mb-3" />
                <p className="font-medium">Carrito vacío</p>
                <p className="text-sm">Toca productos para agregarlos</p>
              </div>
            ) : result ? (
              /* Result view */
              <div className="space-y-3 py-4">
                <div className={`p-4 rounded-xl flex items-start gap-3 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  {result.success
                    ? <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    : <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />}
                  <div>
                    <p className="font-bold text-gray-800">{result.success ? '¡Venta completada!' : 'Resultado parcial'}</p>
                    <p className="text-sm text-gray-600">{result.message}</p>
                  </div>
                </div>
                {result.results.map((r, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${r.success ? 'bg-green-50' : 'bg-red-50'}`}>
                    {r.success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-red-500" />}
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{r.producto_nombre || r.producto_id}</p>
                      <p className="text-xs text-gray-500">{r.message}</p>
                    </div>
                    {r.total && <span className="font-bold text-green-700">${r.total.toFixed(2)}</span>}
                  </div>
                ))}
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-gray-500">Total cobrado</p>
                  <p className="text-3xl font-bold text-primary-700">${result.total_general.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              /* Items list */
              <div className="space-y-2">
                {cart.map(entry => {
                  const Icon = ICON_MAP[entry.product.icono || 'coffee'] || Coffee
                  return (
                    <div key={entry.product.id} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                      <div className="bg-primary-100 rounded-lg p-2 flex-shrink-0">
                        <Icon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{entry.product.nombre}</p>
                        <p className="text-xs text-gray-500">${entry.product.precio.toFixed(2)} c/u</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => onUpdateQuantity(entry.product.id, entry.cantidad - 1)}
                          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-gray-800">{entry.cantidad}</span>
                        <button onClick={() => onUpdateQuantity(entry.product.id, entry.cantidad + 1)}
                          className="p-1 rounded-full bg-primary-200 hover:bg-primary-300 transition">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-right w-20 flex-shrink-0">
                        <p className="font-bold text-gray-900">${(entry.product.precio * entry.cantidad).toFixed(2)}</p>
                      </div>
                      <button onClick={() => onRemove(entry.product.id)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertCircle className="h-4 w-4 inline mr-1" /> {error}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && !result && (
            <div className="border-t bg-gray-50 px-5 py-4 space-y-3">
              {/* Payment method */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Método de pago</p>
                <div className="flex gap-2">
                  <button onClick={() => setMetodoPago('efectivo')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition font-medium text-sm ${
                      metodoPago === 'efectivo'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}>
                    <Banknote className="h-5 w-5" /> Efectivo
                  </button>
                  <button onClick={() => setMetodoPago('tarjeta')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition font-medium text-sm ${
                      metodoPago === 'tarjeta'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}>
                    <CreditCard className="h-5 w-5" /> Tarjeta
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total</span>
                <span className="text-3xl font-bold text-primary-700">${total.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={onClear} disabled={processing}
                  className="flex-shrink-0 px-4 py-3 text-gray-600 hover:bg-gray-200 rounded-xl transition disabled:opacity-50">
                  Vaciar
                </button>
                <button onClick={handleCheckout} disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl transition text-lg shadow-lg">
                  {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
                  {processing ? 'Procesando...' : 'Cobrar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
