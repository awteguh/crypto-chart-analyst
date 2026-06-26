// src/components/analysis/PatternReference.tsx

import type { Pattern } from '@/types/analysis'

// Diagram referensi: polyline (0-100 koordinat) untuk tiap jenis pattern.
// Cocokkan berdasarkan kata kunci pada nama pattern.
interface Diagram {
  match: (name: string) => boolean
  // garis utama pattern
  path: string
  // panah arah (opsional)
  arrow?: { x1: number; y1: number; x2: number; y2: number; up: boolean }
}

const DIAGRAMS: Diagram[] = [
  {
    match: (n) => n.includes('double top') || n.includes('triple top'),
    path: '5,70 25,25 45,45 65,25 85,70',
    arrow: { x1: 85, y1: 60, x2: 95, y2: 90, up: false },
  },
  {
    match: (n) => n.includes('double bottom') || n.includes('triple bottom'),
    path: '5,30 25,75 45,55 65,75 85,30',
    arrow: { x1: 85, y1: 40, x2: 95, y2: 10, up: true },
  },
  {
    match: (n) => n.includes('inverse') && n.includes('head'),
    path: '5,40 20,60 35,50 50,80 65,50 80,60 95,40',
    arrow: { x1: 90, y1: 45, x2: 97, y2: 15, up: true },
  },
  {
    match: (n) => n.includes('head') && n.includes('shoulder'),
    path: '5,60 20,40 35,50 50,20 65,50 80,40 95,60',
    arrow: { x1: 90, y1: 55, x2: 97, y2: 85, up: false },
  },
  {
    match: (n) => n.includes('ascending triangle'),
    path: '5,25 95,25 5,25 90,75 50,25 80,38',
    arrow: { x1: 88, y1: 30, x2: 97, y2: 8, up: true },
  },
  {
    match: (n) => n.includes('descending triangle'),
    path: '5,75 95,75 5,25 90,75 50,75 80,55',
    arrow: { x1: 88, y1: 68, x2: 97, y2: 92, up: false },
  },
  {
    match: (n) => n.includes('symmetric') || n.includes('symmetrical'),
    path: '5,20 90,50 5,80 90,50',
    arrow: { x1: 90, y1: 50, x2: 97, y2: 25, up: true },
  },
  {
    match: (n) => n.includes('rising wedge'),
    path: '5,70 90,25 5,85 90,40',
    arrow: { x1: 88, y1: 32, x2: 97, y2: 80, up: false },
  },
  {
    match: (n) => n.includes('falling wedge'),
    path: '5,30 90,75 5,15 90,60',
    arrow: { x1: 88, y1: 68, x2: 97, y2: 20, up: true },
  },
  {
    match: (n) => n.includes('bull') && n.includes('flag'),
    path: '5,85 30,25 50,45 38,30 58,50 46,35',
    arrow: { x1: 55, y1: 45, x2: 95, y2: 10, up: true },
  },
  {
    match: (n) => n.includes('bear') && n.includes('flag'),
    path: '5,15 30,75 50,55 38,70 58,50 46,65',
    arrow: { x1: 55, y1: 55, x2: 95, y2: 90, up: false },
  },
  {
    match: (n) => n.includes('pennant'),
    path: '5,80 35,25 60,55 35,40 60,50 48,45',
    arrow: { x1: 58, y1: 50, x2: 95, y2: 15, up: true },
  },
  {
    match: (n) => n.includes('cup') && n.includes('handle'),
    path: '5,25 12,45 25,70 50,72 72,45 80,28 88,40 95,32',
    arrow: { x1: 90, y1: 35, x2: 97, y2: 12, up: true },
  },
]

function findDiagram(name: string): Diagram | null {
  const lower = name.toLowerCase()
  return DIAGRAMS.find((d) => d.match(lower)) ?? null
}

function PatternDiagram({ pattern }: { pattern: Pattern }) {
  const diagram = findDiagram(pattern.name)
  const stroke =
    pattern.bias === 'Bullish' ? '#16a34a' : pattern.bias === 'Bearish' ? '#dc2626' : '#eab308'

  return (
    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
      <svg viewBox="0 0 100 100" className="w-full h-20" preserveAspectRatio="xMidYMid meet">
        {diagram ? (
          <>
            <polyline
              points={diagram.path}
              fill="none"
              stroke={stroke}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {diagram.arrow && (
              <line
                x1={diagram.arrow.x1}
                y1={diagram.arrow.y1}
                x2={diagram.arrow.x2}
                y2={diagram.arrow.y2}
                stroke={diagram.arrow.up ? '#16a34a' : '#dc2626'}
                strokeWidth={2.5}
                markerEnd="url(#ref-arrow)"
              />
            )}
          </>
        ) : (
          // Pattern tidak punya diagram khusus → tampilkan garis netral
          <text x="50" y="55" textAnchor="middle" fontSize="10" fill="#9ca3af">
            {pattern.name}
          </text>
        )}
        <defs>
          <marker
            id="ref-arrow"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
          </marker>
        </defs>
      </svg>
      <span className="text-[10px] font-semibold text-center text-gray-700 dark:text-gray-300 leading-tight">
        {pattern.name}
      </span>
    </div>
  )
}

export function PatternReference({ patterns }: { patterns: Pattern[] }) {
  if (patterns.length === 0) return null

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
        Referensi Pattern
      </h4>
      <div className="grid grid-cols-3 gap-2">
        {patterns.map((p, i) => (
          <PatternDiagram key={i} pattern={p} />
        ))}
      </div>
    </div>
  )
}
