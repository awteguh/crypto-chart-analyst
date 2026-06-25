// src/hooks/useAnalysis.ts

'use client'

import { useState, useCallback } from 'react'
import type { AnalysisResult } from '@/types/analysis'

interface UseAnalysisReturn {
  result: AnalysisResult | null
  error: string | null
  isLoading: boolean
  analyze: (file: File, timeframe?: string) => Promise<void>
  reset: () => void
}

export function useAnalysis(): UseAnalysisReturn {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const analyze = useCallback(async (file: File, timeframe?: string) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('image', file)
      if (timeframe) formData.append('timeframe', timeframe)

      const res = await fetch('/api/analyze', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Analisis gagal')
      }

      setResult(data as AnalysisResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analisis gagal')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, error, isLoading, analyze, reset }
}
