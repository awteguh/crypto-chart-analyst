// src/components/analysis/SupportResistance.tsx

import type { SRLevel } from '@/types/analysis'

export function SupportResistance({ levels }: { levels: SRLevel[] }) {
  if (levels.length === 0) return null

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
        Support & Resistance
      </h4>
      <ul className="space-y-1">
        {levels.map((level, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span
              className={`font-bold ${
                level.type === 'Support' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {level.type === 'Support' ? '▲' : '▼'} {level.type}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-xs">({level.strength})</span>
            <span className="text-gray-700 dark:text-gray-300 text-xs">{level.description}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
