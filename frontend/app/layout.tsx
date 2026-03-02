import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProviderWrapper } from './auth-wrapper'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#d4a574',
}

export const metadata: Metadata = {
  title: 'ArteCafexa - Sistema POS',
  description: 'Sistema de gestión para cafetería ArteCafexa',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ArteCafexa',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <AuthProviderWrapper>
          <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
            {/* Navigation */}
            <NavBar />
            
            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
              {children}
            </main>
            
            {/* Footer */}
            <footer className="mt-auto py-4 text-center text-gray-600 text-sm">
              <p>© 2026 ArteCafexa - Sistema de Gestión</p>
            </footer>
          </div>
        </AuthProviderWrapper>
      </body>
    </html>
  )
}

import { NavBar } from './nav-bar'
