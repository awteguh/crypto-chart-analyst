// src/hooks/useMtfAnalysis.ts

'use client'

import { useState, useCallback } from 'react'
import type { Timeframe } from '@/types/chart'
import type { MtfAnalysisResponse } from '@/types/analysis'

interface UseMtfAnalysisReturn {
  response: MtfAnalysisResponse | null
  error: string | null
  isLoading: boolean
  analyze: (files: Partial<Record<Timeframe, File>>) => Promise<void>
  reset: () => void
}

export function useMtfAnalysis(): UseMtfAnalysisReturn {
  const [response, setResponse] = useState<MtfAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const analyze = useCallback(async (files: Partial<Record<Timeframe, File>>) => {
    setIsLoading(true)
    setError(null)
    setResponse(null)

    try {
      const formData = new FormData()
      const tfMap: Record<Timeframe, string> = {
        '15m': '15m',
        '1h': '1h',
        '4h': '4h',
        '1D': '1d',
      }

      Object.entries(files).forEach(([tf, file]) => {
        if (file) {
          const key = tfMap[tf as Timeframe] || tf.toLowerCase()
          formData.append(`image_${key}`, file)
        }
      })

      const res = await fetch('/api/analyze-mtf', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Analisis MTF gagal')
      }

      setResponse(data as MtfAnalysisResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analisis MTF gagal')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResponse(null)
    setError(null)
  }, [])

  return { response, error, isLoading, analyze, reset }
}
