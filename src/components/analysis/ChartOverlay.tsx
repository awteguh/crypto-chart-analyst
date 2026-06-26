// src/components/analysis/ChartOverlay.tsx

'use client'

import type { ChartBounds, ChartOverlay, PriceLevel } from '@/types/analysis'

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
    case 'Entry':      return '#2563eb' // biru
    case 'TakeProfit': return '#16a34a' // hijau
    case 'StopLoss':   return '#dc2626' // merah
    case 'Resistance': return '#f97316' // oranye
    case 'Support':    return '#0891b2' // cyan
  }
}

/**
 * Normalkan chart_bounds — pastikan semua nilai valid (0-100, x1<x2, y1<y2).
 * Fallback ke full-image jika tidak ada atau tidak masuk akal.
 */
function normalizeBounds(b?: ChartBounds | null): ChartBounds {
  const full = { x1: 0, y1: 0, x2: 100, y2: 100 }
  if (!b) return full
  const { x1, y1, x2, y2 } = b
  if (
    typeof x1 !== 'number' || typeof y1 !== 'number' ||
    typeof x2 !== 'number' || typeof y2 !== 'number' ||
    x1 >= x2 || y1 >= y2 ||
    x1 < 0 || y1 < 0 || x2 > 100 || y2 > 100 ||
    (x2 - x1) < 10 || (y2 - y1) < 10 // bounds terlalu kecil → abaikan
  ) return full
  return b
}

/**
 * Menggambar overlay (garis pattern, level harga, panah arah) di atas gambar chart.
 *
 * Jika gambar punya UI tambahan (header, tombol, dll), AI melaporkan chart_bounds
 * sehingga garis-garis di-clip dan hanya ditampilkan dalam area chart yang sebenarnya.
 *
 * SVG memakai viewBox 0-100 (koordinat persen dari seluruh gambar).
 * clipPath memastikan tidak ada garis yang keluar dari area chart.
 */
export function ChartOverlayView({ imageUrl, overlay, alt = 'Chart' }: ChartOverlayProps) {
  const { pattern_lines, price_levels, arrow } = overlay
  const bounds = normalizeBounds(overlay.chart_bounds)
  const { x1, y1, x2, y2 } = bounds
  const bw = x2 - x1 // lebar bounds dalam %
  const bh = y2 - y1 // tinggi bounds dalam %

  const clipId = 'chart-area-clip'

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Gambar chart asli */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={alt} className="w-full block" />

      {/* SVG overlay — viewBox 0-100 = koordinat persen dari seluruh gambar */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Clip path — pastikan garis tidak keluar dari area chart */}
          <clipPath id={clipId}>
            <rect x={x1} y={y1} width={bw} height={bh} />
          </clipPath>

          <marker id="arrow-up" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#16a34a" />
          </marker>
          <marker id="arrow-down" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
          </marker>
        </defs>

        {/* Semua elemen overlay di-clip ke area chart */}
        <g clipPath={`url(#${clipId})`}>
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

          {/* Garis level harga — horizontal dari x1 ke x2 (hanya dalam area chart) */}
          {price_levels.map((level, i) => (
            <line
              key={`level-${i}`}
              x1={x1}
              y1={level.y}
              x2={x2}
              y2={level.y}
              stroke={levelColor(level.type)}
              strokeWidth={0.5}
              strokeDasharray="2 1.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Panah arah prediksi */}
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
        </g>
      </svg>

      {/* Label level harga — posisi HTML (lebih tajam dari SVG text) */}
      {price_levels.map((level, i) => {
        // Hanya tampilkan label jika level.y berada dalam bounds
        if (level.y < y1 || level.y > y2) return null
        return (
          <div
            key={`label-${i}`}
            className="absolute -translate-y-1/2 text-[9px] font-bold px-1 rounded text-white pointer-events-none"
            style={{
              top: `${level.y}%`,
              right: `${100 - x2}%`,
              backgroundColor: levelColor(level.type),
            }}
          >
            {level.label}
          </div>
        )
      })}

      {/* Label garis pattern */}
      {pattern_lines.map((line, i) => {
        if (line.points.length === 0) return null
        const pt = line.points[0]
        // Hanya tampilkan jika titik pertama dalam bounds
        if (pt.x < x1 || pt.x > x2 || pt.y < y1 || pt.y > y2) return null
        return (
          <div
            key={`linelabel-${i}`}
            className="absolute text-[9px] font-semibold px-1 rounded text-white pointer-events-none whitespace-nowrap"
            style={{
              left: `${pt.x}%`,
              top: `${pt.y}%`,
              backgroundColor: lineColor(line.bias),
              transform: 'translate(-50%, -120%)',
            }}
          >
            {line.label}
          </div>
        )
      })}
    </div>
  )
}
