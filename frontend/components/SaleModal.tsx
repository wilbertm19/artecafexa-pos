'use client'

import { useState } from 'react'
import { X, ShoppingCart, Loader2, CheckCircle, AlertCircle, Minus, Plus } from 'lucide-react'
import { registerSale, type Product } from '@/lib/api'

interface SaleModalProps {
  isOpen: boolean
  product: Product | null
  onClose: () => void
  onSuccess: () => void
}

export default function SaleModal({ isOpen, product, onClose, onSuccess }: SaleModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  if (!isOpen || !product) return null

  const total = product.precio * quantity

  const handleQuantityChange = (increment: number) => {
    const newQuantity = quantity + increment
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  const handleConfirmSale = async () => {
    setIsLoading(true)
    setStatus('idle')
    setMessage('')

    try {
      const response = await registerSale({
        producto_id: product.id,
        cantidad: quantity,
      })

      setStatus('success')
      setMessage(response.message)
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onSuccess()
        onClose()
        resetModal()
      }, 2000)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const resetModal = () => {
    setQuantity(1)
    setStatus('idle')
    setMessage('')
  }

  const handleClose = () => {
    if (!isLoading && status !== 'success') {
      onClose()
      resetModal()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-pulse-once">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Confirmar Venta</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading || status === 'success'}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {product.nombre}
            </h3>
            <p className="text-3xl font-bold text-primary-600">
              ${product.precio.toFixed(2)}
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1 || isLoading || status === 'success'}
              className="bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-3 transition-colors"
            >
              <Minus className="h-6 w-6 text-gray-700" />
            </button>
            
            <div className="bg-gray-100 rounded-xl px-8 py-4 min-w-[100px] text-center">
              <p className="text-sm text-gray-600 mb-1">Cantidad</p>
              <p className="text-3xl font-bold text-gray-800">{quantity}</p>
            </div>
            
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={isLoading || status === 'success'}
              className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-3 transition-colors"
            >
              <Plus className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Total */}
          <div className="bg-primary-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Total a Pagar</p>
            <p className="text-4xl font-bold text-primary-700">
              ${total.toFixed(2)}
            </p>
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800">¡Venta registrada!</p>
                <p className="text-sm text-green-700">{message}</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Error</p>
                <p className="text-sm text-red-700">{message}</p>
              </div>
            </div>
          )}

          {/* Recipe Details */}
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Ingredientes:</p>
            <ul className="space-y-1">
              {product.receta.map((item, index) => (
                <li key={index} className="text-sm text-gray-600 flex justify-between">
                  <span>{item.insumo}</span>
                  <span className="font-medium">
                    {(item.cantidad * quantity).toFixed(3)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex space-x-3">
          <button
            onClick={handleClose}
            disabled={isLoading || status === 'success'}
            className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 font-semibold py-3 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmSale}
            disabled={isLoading || status === 'success'}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Procesando...
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                ¡Completado!
              </>
            ) : (
              'Confirmar Venta'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
