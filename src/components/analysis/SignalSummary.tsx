// src/components/analysis/SignalSummary.tsx

import type { TradeSignal } from '@/types/analysis'

export function SignalSummary({ signal }: { signal: TradeSignal }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 space-y-1">
      <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
        Sinyal Trading
      </h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div>
          <span className="text-gray-500">Entry:</span>{' '}
          <span className="font-medium text-gray-800 dark:text-gray-100">{signal.entry}</span>
        </div>
        <div>
          <span className="text-gray-500">R:R:</span>{' '}
          <span className="font-bold text-blue-600 dark:text-blue-400">{signal.risk_reward}</span>
        </div>
        <div>
          <span className="text-red-500">SL:</span>{' '}
          <span className="font-medium text-gray-800 dark:text-gray-100">{signal.stop_loss}</span>
        </div>
        <div>
          <span className="text-green-500">TP:</span>{' '}
          <span className="font-medium text-gray-800 dark:text-gray-100">{signal.take_profit}</span>
        </div>
      </div>
    </div>
  )
}
