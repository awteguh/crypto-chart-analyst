// src/app/layout.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Crypto Chart Analyst',
  description: 'Analisis chart crypto berbasis AI — deteksi pattern & prediksi pump/dump',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-[#080B14] text-[#e2e8f0]`}>
        {/* Ambient glow background — fixed, tidak ikut scroll */}
        <div className="bg-canvas">
          {/* Orb amber — top right */}
          <div
            className="glow-orb"
            style={{ width: 400, height: 400, background: '#f59e0b', top: -100, right: -50 }}
          />
          {/* Orb cyan — bottom left */}
          <div
            className="glow-orb"
            style={{ width: 300, height: 300, background: '#06b6d4', bottom: 100, left: -80 }}
          />
          {/* Orb purple — center */}
          <div
            className="glow-orb"
            style={{ width: 200, height: 200, background: '#7c3aed', top: '40%', left: '40%' }}
          />
        </div>
        {/* Konten utama — z-index di atas orbs */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
