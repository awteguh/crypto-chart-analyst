// src/components/analysis/SupportResistance.tsx

import type { SRLevel } from '@/types/analysis'

export function SupportResistance({ levels }: { levels: SRLevel[] }) {
  if (levels.length === 0) return null

  return (
    <div>
      <h4 className="text-[9px] font-bold tracking-[1.5px] uppercase text-slate-600 mb-2">
        Support & Resistance
      </h4>
      <ul className="divide-y divide-white/[0.04]">
        {levels.map((level, i) => (
          <li key={i} className="flex items-center gap-2.5 py-1.5 text-xs">
            {/* Glow dot */}
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                level.type === 'Support'
                  ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.7)]'
                  : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.7)]'
              }`}
            />
            <span
              className={`font-semibold w-20 ${
                level.type === 'Support' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {level.type === 'Support' ? '▲' : '▼'} {level.type}
            </span>
            <span className="text-slate-600 text-[10px] bg-white/[0.04] px-1.5 py-0.5 rounded">
              {level.strength}
            </span>
            <span className="text-slate-400 flex-1">{level.description}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
