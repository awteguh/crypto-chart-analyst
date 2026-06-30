// src/components/analysis/ChartOverlay.tsx

'use client'

import type { ChartBounds, ChartOverlay, PatternLine, PriceLevel } from '@/types/analysis'

interface ChartOverlayProps {
  imageUrl: string
  overlay: ChartOverlay
  alt?: string
}

// Warna neon per bias
function lineColor(bias: 'Bullish' | 'Bearish' | 'Neutral'): string {
  if (bias === 'Bullish') return '#10b981'  // emerald
  if (bias === 'Bearish') return '#ef4444'  // red
  return '#f59e0b'                           // amber (neutral)
}

function levelColor(type: PriceLevel['type']): string {
  switch (type) {
    case 'Entry':      return '#06b6d4'  // cyan
    case 'TakeProfit': return '#10b981'  // emerald
    case 'StopLoss':   return '#ef4444'  // red
    case 'Resistance': return '#f97316'  // orange
    case 'Support':    return '#06b6d4'  // cyan
  }
}

function normalizeBounds(b?: ChartBounds | null): ChartBounds {
  const full = { x1: 0, y1: 0, x2: 100, y2: 100 }
  if (!b) return full
  const { x1, y1, x2, y2 } = b
  if (
    typeof x1 !== 'number' || typeof y1 !== 'number' ||
    typeof x2 !== 'number' || typeof y2 !== 'number' ||
    x1 >= x2 || y1 >= y2 ||
    x1 < 0 || y1 < 0 || x2 > 100 || y2 > 100 ||
    (x2 - x1) < 10 || (y2 - y1) < 10
  ) return full
  return b
}

/**
 * Deteksi apakah pattern ini tipe "area" (dua trendline yang membentuk shape tertutup).
 * Digunakan untuk shading area antara dua garis.
 */
function isAreaPattern(label: string): boolean {
  const lower = label.toLowerCase()
  return (
    lower.includes('triangle') ||
    lower.includes('wedge') ||
    lower.includes('channel') ||
    lower.includes('flag') ||
    lower.includes('pennant')
    // 'trendline' sengaja tidak termasuk — satu garis trendline bukan area tertutup
  )
}

/**
 * Bangun polygon path untuk shading area antara dua polyline.
 * line1 = upper trendline (kiri→kanan), line2 = lower trendline (kiri→kanan)
 * Path: ikuti line1 kiri→kanan, lalu line2 kanan→kiri.
 */
function buildAreaPath(line1: PatternLine, line2: PatternLine): string {
  if (line1.points.length < 2 || line2.points.length < 2) return ''
  const forward = line1.points.map(p => `${p.x},${p.y}`).join(' ')
  const backward = [...line2.points].reverse().map(p => `${p.x},${p.y}`).join(' ')
  return `M ${forward} L ${backward} Z`
}

export function ChartOverlayView({ imageUrl, overlay, alt = 'Chart' }: ChartOverlayProps) {
  const { pattern_lines, price_levels, arrow } = overlay
  const bounds = normalizeBounds(overlay.chart_bounds)
  const { x1, y1, x2, y2 } = bounds
  const bw = x2 - x1
  const bh = y2 - y1
  const clipId = 'chart-area-clip'
  const glowFilterId = 'neon-glow'

  // Pisahkan pattern line menjadi pasangan untuk area shading
  // (asumsi: index 0 = upper line, index 1 = lower line, jika keduanya area pattern dengan bias sama)
  const areaShading: Array<{ line1: PatternLine; line2: PatternLine; color: string }> = []
  if (pattern_lines.length >= 2) {
    const upper = pattern_lines[0]
    const lower = pattern_lines[1]
    if (isAreaPattern(upper.label) || isAreaPattern(lower.label)) {
      areaShading.push({ line1: upper, line2: lower, color: lineColor(upper.bias) })
    }
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-white/[0.08]">
      {/* Gambar chart asli */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={alt} className="w-full block" />

      {/* SVG overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={x1} y={y1} width={bw} height={bh} />
          </clipPath>

          {/* Neon glow filter */}
          <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Arrow markers */}
          <marker id="arrow-up" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
          </marker>
          <marker id="arrow-down" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
          </marker>
        </defs>

        <g clipPath={`url(#${clipId})`} filter={`url(#${glowFilterId})`}>

          {/* Area shading antar dua trendline (triangle/wedge/channel) */}
          {areaShading.map((pair, i) => {
            const path = buildAreaPath(pair.line1, pair.line2)
            if (!path) return null
            return (
              <path
                key={`area-${i}`}
                d={path}
                fill={pair.color}
                fillOpacity={0.06}
                stroke="none"
              />
            )
          })}

          {/* Garis pattern trendline */}
          {pattern_lines.map((line, i) => {
            if (line.points.length < 2) return null
            const color = lineColor(line.bias)
            const pointsStr = line.points.map(p => `${p.x},${p.y}`).join(' ')
            return (
              <g key={`line-${i}`}>
                {/* Shadow glow (tebal, transparan) */}
                <polyline
                  points={pointsStr}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.8}
                  strokeOpacity={0.2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Garis utama */}
                <polyline
                  points={pointsStr}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.9}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Marker circle di setiap titik kunci (puncak/lembah) */}
                {line.points.map((p, j) => (
                  <circle
                    key={`pt-${i}-${j}`}
                    cx={p.x}
                    cy={p.y}
                    r={0.7}
                    fill={color}
                    stroke="#080B14"
                    strokeWidth={0.25}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </g>
            )
          })}

          {/* Garis level harga horizontal */}
          {price_levels.map((level, i) => {
            const color = levelColor(level.type)
            const isDashed = level.type === 'Resistance' || level.type === 'Support'
            return (
              <g key={`level-${i}`}>
                {/* Shadow glow */}
                <line
                  x1={x1} y1={level.y} x2={x2} y2={level.y}
                  stroke={color}
                  strokeWidth={1.5}
                  strokeOpacity={0.15}
                  vectorEffect="non-scaling-stroke"
                />
                {/* Garis utama */}
                <line
                  x1={x1} y1={level.y} x2={x2} y2={level.y}
                  stroke={color}
                  strokeWidth={0.6}
                  strokeDasharray={isDashed ? '2 1.5' : undefined}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            )
          })}

          {/* Panah arah prediksi */}
          {arrow && (arrow.direction === 'up' || arrow.direction === 'down') && (
            <g>
              {/* Shadow glow */}
              <line
                x1={arrow.from.x} y1={arrow.from.y}
                x2={arrow.to.x} y2={arrow.to.y}
                stroke={arrow.direction === 'up' ? '#10b981' : '#ef4444'}
                strokeWidth={2.5}
                strokeOpacity={0.2}
                vectorEffect="non-scaling-stroke"
              />
              {/* Panah utama */}
              <line
                x1={arrow.from.x} y1={arrow.from.y}
                x2={arrow.to.x} y2={arrow.to.y}
                stroke={arrow.direction === 'up' ? '#10b981' : '#ef4444'}
                strokeWidth={1.2}
                markerEnd={arrow.direction === 'up' ? 'url(#arrow-up)' : 'url(#arrow-down)'}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )}

        </g>
      </svg>

      {/* Label level harga — HTML overlay (lebih tajam dari SVG text) */}
      {price_levels.map((level, i) => {
        if (level.y < y1 || level.y > y2) return null
        const color = levelColor(level.type)
        return (
          <div
            key={`label-${i}`}
            className="absolute -translate-y-1/2 text-[8px] font-bold px-1.5 py-0.5 rounded text-white pointer-events-none whitespace-nowrap"
            style={{
              top: `${level.y}%`,
              right: `${100 - x2 + 0.5}%`,
              backgroundColor: color,
              boxShadow: `0 0 6px ${color}66`,
            }}
          >
            {level.label}
          </div>
        )
      })}

      {/* Label garis pattern — di titik pertama */}
      {pattern_lines.map((line, i) => {
        if (line.points.length === 0) return null
        const pt = line.points[0]
        if (pt.x < x1 || pt.x > x2 || pt.y < y1 || pt.y > y2) return null
        const color = lineColor(line.bias)
        return (
          <div
            key={`linelabel-${i}`}
            className="absolute text-[8px] font-semibold px-1.5 py-0.5 rounded text-white pointer-events-none whitespace-nowrap"
            style={{
              left: `${pt.x}%`,
              top: `${pt.y}%`,
              backgroundColor: `${color}cc`,
              border: `1px solid ${color}`,
              transform: 'translate(-50%, -140%)',
              boxShadow: `0 0 8px ${color}55`,
            }}
          >
            {line.label}
          </div>
        )
      })}

      {/* Pattern name badge — pojok kiri atas area chart */}
      {pattern_lines.length > 0 && (
        <div
          className="absolute text-[9px] font-bold px-2 py-0.5 rounded-br pointer-events-none"
          style={{
            top: `${y1}%`,
            left: `${x1}%`,
            background: 'rgba(8,11,20,0.75)',
            border: `1px solid ${lineColor(pattern_lines[0].bias)}55`,
            color: lineColor(pattern_lines[0].bias),
            backdropFilter: 'blur(4px)',
          }}
        >
          📐 {pattern_lines[0].label.replace(/ (Line|Trendline|Upper|Lower)/gi, '').trim() || 'Pattern'}
        </div>
      )}
    </div>
  )
}
