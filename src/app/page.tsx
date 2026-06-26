// src/app/page.tsx

'use client'

import { useState, useCallback } from 'react'
import type { Timeframe } from '@/types/chart'
import { DropZone } from '@/components/upload/DropZone'
import { ChartPreview } from '@/components/upload/ChartPreview'
import { MtfUploader } from '@/components/upload/MtfUploader'
import { ResultCard } from '@/components/analysis/ResultCard'
import { MtfSynthesisPanel } from '@/components/analysis/MtfSynthesis'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useAnalysis } from '@/hooks/useAnalysis'
import { useMtfAnalysis } from '@/hooks/useMtfAnalysis'

type Mode = 'single' | 'mtf'

export default function Home() {
  const [mode, setMode] = useState<Mode>('single')

  // Single mode state
  const [singleFile, setSingleFile] = useState<File | null>(null)
  const { result, error, isLoading, analyze, reset } = useAnalysis()

  // MTF mode state
  const [mtfFiles, setMtfFiles] = useState<Partial<Record<Timeframe, File>>>({})
  const {
    response: mtfResponse,
    error: mtfError,
    isLoading: mtfLoading,
    analyze: analyzeMtf,
    reset: resetMtf,
  } = useMtfAnalysis()

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode)
    setSingleFile(null)
    setMtfFiles({})
    reset()
    resetMtf()
  }

  const handleSingleAnalyze = useCallback(() => {
    if (singleFile) analyze(singleFile)
  }, [singleFile, analyze])

  const handleMtfAnalyze = useCallback(() => {
    if (Object.keys(mtfFiles).length > 0) analyzeMtf(mtfFiles)
  }, [mtfFiles, analyzeMtf])

  // Deteksi jika analisis jatuh ke rule-based (tidak ada API key vision yang valid)
  const usedFallback =
    result?.engine_used === 'rule-based' ||
    Object.values(mtfResponse?.results ?? {}).some((r) => r?.engine_used === 'rule-based')

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          📊 Crypto Chart Analyst
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Upload screenshot chart crypto — AI mendeteksi pattern & prediksi pump/dump
        </p>
      </div>

      {/* Fallback Warning */}
      {usedFallback && (
        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm">
          ⚠️ Menggunakan analisis sederhana (rule-based) — garis pattern tidak tersedia.
          Untuk deteksi pattern lengkap, set <code>GEMINI_API_KEY</code> (gratis) di{' '}
          <code>.env.local</code>. Dapatkan di{' '}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold"
          >
            aistudio.google.com/apikey
          </a>
          , lalu restart server.
        </div>
      )}

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => handleModeChange('single')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            mode === 'single'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          📊 Single Chart
        </button>
        <button
          onClick={() => handleModeChange('mtf')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            mode === 'mtf'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          📈 Multi-Timeframe (MTF)
        </button>
      </div>

      {/* Single Mode */}
      {mode === 'single' && (
        <div className="space-y-4">
          {singleFile ? (
            <ChartPreview file={singleFile} onRemove={() => { setSingleFile(null); reset() }} />
          ) : (
            <DropZone onFile={setSingleFile} />
          )}

          {singleFile && !result && (
            <Button onClick={handleSingleAnalyze} isLoading={isLoading} className="w-full">
              🔍 Analisis Chart
            </Button>
          )}

          {isLoading && (
            <div className="flex flex-col items-center gap-2 py-8">
              <Spinner size="lg" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">Sedang menganalisis chart...</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 rounded-lg text-red-700 dark:text-red-300 text-sm">
              ❌ {error}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <ResultCard
                result={result}
                imageUrl={singleFile ? URL.createObjectURL(singleFile) : undefined}
              />
              <Button variant="secondary" onClick={() => { setSingleFile(null); reset() }} className="w-full">
                🔄 Analisis Chart Baru
              </Button>
            </div>
          )}
        </div>
      )}

      {/* MTF Mode */}
      {mode === 'mtf' && (
        <div className="space-y-4">
          <MtfUploader
            files={mtfFiles}
            onFile={(tf, file) => setMtfFiles((prev) => ({ ...prev, [tf]: file }))}
            onRemove={(tf) => {
              setMtfFiles((prev) => { const next = { ...prev }; delete next[tf]; return next })
              resetMtf()
            }}
          />

          {Object.keys(mtfFiles).length > 0 && !mtfResponse && (
            <Button onClick={handleMtfAnalyze} isLoading={mtfLoading} className="w-full">
              🔍 Analisis Multi-Timeframe ({Object.keys(mtfFiles).length} chart)
            </Button>
          )}

          {mtfLoading && (
            <div className="flex flex-col items-center gap-2 py-8">
              <Spinner size="lg" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Menganalisis {Object.keys(mtfFiles).length} chart secara paralel...
              </p>
            </div>
          )}

          {mtfError && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 rounded-lg text-red-700 dark:text-red-300 text-sm">
              ❌ {mtfError}
            </div>
          )}

          {mtfResponse && (
            <div className="space-y-6">
              {/* Per-TF Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(mtfResponse.results).map(([tf, res]) =>
                  res ? (
                    <ResultCard
                      key={tf}
                      result={res}
                      imageUrl={
                        mtfFiles[tf as Timeframe]
                          ? URL.createObjectURL(mtfFiles[tf as Timeframe]!)
                          : undefined
                      }
                    />
                  ) : null
                )}
              </div>

              {/* MTF Synthesis */}
              <MtfSynthesisPanel synthesis={mtfResponse.synthesis} />

              <Button
                variant="secondary"
                onClick={() => { setMtfFiles({}); resetMtf() }}
                className="w-full"
              >
                🔄 Analisis MTF Baru
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
        ⚠️ Hanya untuk referensi teknikal. Bukan financial advice.
      </p>
    </main>
  )
}
