// src/components/analysis/ChartOverlay.tsx

'use client'

import type { ChartOverlay, PriceLevel } from '@/types/analysis'

interface ChartOverlayProps {
  imageUrl: string
  overlay: ChartOverlay
  alt?: string
}

// Warna garis pattern berdasarkan bias
function lineColor(bias: 'Bullish' | 'Bearish' | 'Neutral'): string {
  if (bias === 'Bullish') return '#16a34a' // hijau
  if (bias === 'Bearish') return '#dc2626' // merah
  return '#eab308' // kuning (netral)
}

// Warna garis level harga
function levelColor(type: PriceLevel['type']): string {
  switch (type) {
    case 'Entry':
      return '#2563eb' // biru
    case 'TakeProfit':
      return '#16a34a' // hijau
    case 'StopLoss':
      return '#dc2626' // merah
    case 'Resistance':
      return '#f97316' // oranye
    case 'Support':
      return '#0891b2' // cyan
  }
}

/**
 * Menggambar overlay (garis pattern, level harga, panah arah) di atas
 * gambar chart. SVG memakai viewBox 0-100 sehingga koordinat persen dari
 * AI langsung terpetakan ke posisi gambar, apa pun ukuran tampilannya.
 */
export function ChartOverlayView({ imageUrl, overlay, alt = 'Chart' }: ChartOverlayProps) {
  const { pattern_lines, price_levels, arrow } = overlay

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Gambar chart asli */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={alt} className="w-full block" />

      {/* SVG overlay menutupi seluruh gambar */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Definisi panah (marker) */}
        <defs>
          <marker
            id="arrow-up"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#16a34a" />
          </marker>
          <marker
            id="arrow-down"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
          </marker>
        </defs>

        {/* Garis pattern (trendline) */}
        {pattern_lines.map((line, i) =>
          line.points.length >= 2 ? (
            <polyline
              key={`line-${i}`}
              points={line.points.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={lineColor(line.bias)}
              strokeWidth={0.6}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ) : null
        )}

        {/* Garis level harga (horizontal, putus-putus) */}
        {price_levels.map((level, i) => (
          <line
            key={`level-${i}`}
            x1={0}
            y1={level.y}
            x2={100}
            y2={level.y}
            stroke={levelColor(level.type)}
            strokeWidth={0.4}
            strokeDasharray="2 1.5"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Panah arah prediksi — hanya render jika direction valid */}
        {arrow && (arrow.direction === 'up' || arrow.direction === 'down') && (
          <line
            x1={arrow.from.x}
            y1={arrow.from.y}
            x2={arrow.to.x}
            y2={arrow.to.y}
            stroke={arrow.direction === 'up' ? '#16a34a' : '#dc2626'}
            strokeWidth={1}
            markerEnd={arrow.direction === 'up' ? 'url(#arrow-up)' : 'url(#arrow-down)'}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {/* Label level harga (HTML, di luar SVG agar teks tajam) */}
      {price_levels.map((level, i) => (
        <div
          key={`label-${i}`}
          className="absolute right-1 -translate-y-1/2 text-[10px] font-bold px-1 rounded text-white pointer-events-none"
          style={{ top: `${level.y}%`, backgroundColor: levelColor(level.type) }}
        >
          {level.label}
        </div>
      ))}

      {/* Label garis pattern (di titik pertama tiap garis) */}
      {pattern_lines.map((line, i) =>
        line.points.length > 0 ? (
          <div
            key={`linelabel-${i}`}
            className="absolute text-[9px] font-semibold px-1 rounded text-white pointer-events-none whitespace-nowrap"
            style={{
              left: `${line.points[0].x}%`,
              top: `${line.points[0].y}%`,
              backgroundColor: lineColor(line.bias),
              transform: 'translate(-50%, -120%)',
            }}
          >
            {line.label}
          </div>
        ) : null
      )}
    </div>
  )
}
