'use client'

import Link from 'next/link'
import { Coffee, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export function NavBar() {
  const { isAuthenticated } = useAuth()

  return (
    <nav className="bg-white shadow-sm border-b border-orange-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Coffee className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-primary-700">ArteCafexa</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 bg-primary-100 hover:bg-primary-200 text-primary-800 px-4 py-2 rounded-lg transition-colors"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              href={isAuthenticated ? '/admin' : '/login'}
              className="flex items-center space-x-2 bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-lg transition-colors"
            >
              <ShieldCheck className="h-5 w-5" />
              <span className="hidden sm:inline">{isAuthenticated ? 'Admin' : 'Login'}</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
