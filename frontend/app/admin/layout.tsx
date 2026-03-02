'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Package, ShoppingCart, Receipt, Loader2, LogOut, LayoutDashboard } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div>
      {/* Admin sub-nav */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-1 overflow-x-auto">
              <Link href="/admin" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg whitespace-nowrap transition">
                <LayoutDashboard className="h-4 w-4" /> Resumen
              </Link>
              <Link href="/admin/inventario" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg whitespace-nowrap transition">
                <Package className="h-4 w-4" /> Inventario
              </Link>
              <Link href="/admin/productos" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg whitespace-nowrap transition">
                <ShoppingCart className="h-4 w-4" /> Productos
              </Link>
              <Link href="/admin/ventas" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg whitespace-nowrap transition">
                <Receipt className="h-4 w-4" /> Ventas
              </Link>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <span className="text-xs text-gray-500 hidden sm:inline">{user?.email}</span>
              <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition">
                <LogOut className="h-4 w-4" /> Salir
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  )
}
