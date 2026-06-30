// src/components/analysis/IndicatorsPanel.tsx

import type { IndicatorReadings, RsiZone, MacdSignal } from '@/types/analysis'

interface Props {
  readings: IndicatorReadings
}

// ── RSI Gauge ──────────────────────────────────────────────────────────────

function rsiColor(zone: RsiZone): string {
  if (zone === 'Oversold') return '#22c55e'   // green
  if (zone === 'Overbought') return '#ef4444'  // red
  return '#94a3b8'                              // neutral
}

function RsiGauge({ value, zone }: { value: number | null; zone: RsiZone }) {
  const pct = value !== null ? Math.min(100, Math.max(0, value)) : 50
  const color = rsiColor(zone)
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 h-2 rounded-full bg-white/[0.08] overflow-hidden">
        {/* zone bands */}
        <div className="absolute inset-y-0 left-0 w-[30%] bg-green-500/20 rounded-l-full" />
        <div className="absolute inset-y-0 right-0 w-[30%] bg-red-500/20 rounded-r-full" />
        {/* current value */}
        <div
          className="absolute top-0 bottom-0 w-2 h-2 rounded-full -translate-x-1/2 ring-2 ring-[#0f172a]"
          style={{ left: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono font-bold tabular-nums" style={{ color }}>
        {value !== null ? value.toFixed(1) : '—'}
      </span>
    </div>
  )
}

// ── MACD Badge ─────────────────────────────────────────────────────────────

const MACD_STYLE: Record<MacdSignal, { label: string; cls: string }> = {
  'Bullish Crossover': { label: 'Bullish Cross ▲', cls: 'text-green-400 bg-green-500/10 border-green-500/25' },
  'Bearish Crossover': { label: 'Bearish Cross ▼', cls: 'text-red-400 bg-red-500/10 border-red-500/25' },
  'Bullish':           { label: 'Bullish',          cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' },
  'Bearish':           { label: 'Bearish',           cls: 'text-rose-400 bg-rose-500/10 border-rose-500/25' },
  'Neutral':           { label: 'Neutral',           cls: 'text-slate-400 bg-slate-500/10 border-slate-500/25' },
}

// ── Bollinger label ─────────────────────────────────────────────────────────

const BB_COLOR: Record<string, string> = {
  'Above Upper Band':  'text-red-400',
  'Near Upper Band':   'text-orange-400',
  'Mid Band':          'text-slate-400',
  'Near Lower Band':   'text-emerald-400',
  'Below Lower Band':  'text-green-400',
}

// ── Volume label ────────────────────────────────────────────────────────────

const VOL_COLOR: Record<string, string> = {
  Spike:      'text-yellow-400',
  Increasing: 'text-emerald-400',
  Decreasing: 'text-rose-400',
  Low:        'text-slate-500',
  Normal:     'text-slate-400',
}

// ── Row wrapper ─────────────────────────────────────────────────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-600 shrink-0 pt-0.5">
        {label}
      </span>
      <div className="flex-1 min-w-0 text-right">{children}</div>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export function IndicatorsPanel({ readings }: Props) {
  // AI output bisa tidak lengkap — normalkan agar tidak crash.
  const rsi = readings.rsi ?? null
  const macd = readings.macd ?? null
  const bollinger = readings.bollinger ?? null
  const volume = readings.volume ?? null
  const ema = Array.isArray(readings.ema) ? readings.ema : []

  const hasAny =
    rsi !== null ||
    macd !== null ||
    bollinger !== null ||
    volume !== null ||
    ema.length > 0

  if (!hasAny) return null

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <h4 className="text-[9px] font-bold tracking-[1.5px] uppercase text-slate-600 mb-2">
        Indikator Teknikal
      </h4>

      {rsi !== null && (
        <Row label="RSI">
          <div className="space-y-1">
            <RsiGauge value={rsi.value} zone={rsi.zone} />
            <div className="flex items-center justify-end gap-2">
              <span
                className="text-[10px] font-semibold"
                style={{ color: rsiColor(rsi.zone) }}
              >
                {rsi.zone}
              </span>
              {rsi.divergence && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${
                    rsi.divergence === 'Bullish'
                      ? 'text-green-400 border-green-500/30 bg-green-500/10'
                      : 'text-red-400 border-red-500/30 bg-red-500/10'
                  }`}
                >
                  {rsi.divergence} Div
                </span>
              )}
            </div>
          </div>
        </Row>
      )}

      {macd !== null && (
        <Row label="MACD">
          <div className="flex flex-col items-end gap-1">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${(MACD_STYLE[macd.signal] ?? MACD_STYLE.Neutral).cls}`}
            >
              {(MACD_STYLE[macd.signal] ?? MACD_STYLE.Neutral).label}
            </span>
            <span className="text-[9px] text-slate-500">
              Hist {macd.histogram} · {macd.macd_line}
            </span>
          </div>
        </Row>
      )}

      {bollinger !== null && (
        <Row label="BB">
          <div className="flex flex-col items-end gap-0.5">
            <span className={`text-[10px] font-semibold ${BB_COLOR[bollinger.zone] ?? 'text-slate-400'}`}>
              {bollinger.zone}
            </span>
            {bollinger.squeeze && (
              <span className="text-[9px] text-yellow-400/80">Squeeze — siap breakout</span>
            )}
          </div>
        </Row>
      )}

      {volume !== null && (
        <Row label="Volume">
          <div className="flex flex-col items-end gap-0.5">
            <span className={`text-[10px] font-semibold ${VOL_COLOR[volume.trend] ?? 'text-slate-400'}`}>
              {volume.trend}
            </span>
            <span className="text-[9px] text-slate-500">
              {volume.confirms_price ? 'Konfirmasi pergerakan' : 'Divergensi volume'}
            </span>
          </div>
        </Row>
      )}

      {ema.length > 0 && (
        <Row label="EMA">
          <div className="flex flex-col items-end gap-0.5">
            {ema.map((e, i) => (
              <span
                key={i}
                className={`text-[10px] font-semibold ${
                  e.relation === 'Price Above'
                    ? 'text-emerald-400'
                    : e.relation === 'Price Below'
                    ? 'text-rose-400'
                    : 'text-yellow-400'
                }`}
              >
                EMA {e.period} — {e.relation}
              </span>
            ))}
          </div>
        </Row>
      )}
    </div>
  )
}
