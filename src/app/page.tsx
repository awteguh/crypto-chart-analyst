// src/app/page.tsx

'use client'

import { useState, useCallback, useEffect } from 'react'
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
import type { CropBox } from '@/types/crop'
import { isMeaningfulCrop } from '@/types/crop'

type Mode = 'single' | 'mtf'

/**
 * Crop gambar di client-side menggunakan Canvas.
 * Returns blob URL dari area yang di-crop, atau URL original jika tidak ada crop.
 */
async function cropImageUrl(file: File, crop: CropBox | null): Promise<string> {
  const originalUrl = URL.createObjectURL(file)
  if (!crop || !isMeaningfulCrop(crop)) return originalUrl

  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const left   = Math.round(crop.x1 / 100 * img.naturalWidth)
      const top    = Math.round(crop.y1 / 100 * img.naturalHeight)
      const width  = Math.round((crop.x2 - crop.x1) / 100 * img.naturalWidth)
      const height = Math.round((crop.y2 - crop.y1) / 100 * img.naturalHeight)
      canvas.width  = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, left, top, width, height, 0, 0, width, height)
      URL.revokeObjectURL(originalUrl)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => resolve(originalUrl)
    img.src = originalUrl
  })
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('single')

  // Single mode state
  const [singleFile, setSingleFile] = useState<File | null>(null)
  const { result, error, isLoading, analyze, reset } = useAnalysis()
  const [cropBox, setCropBox] = useState<CropBox | null>(null)
  // URL gambar yang sudah di-crop — ini yang ditampilkan di ResultCard
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null)

  // Saat result muncul, generate cropped image URL untuk ResultCard
  useEffect(() => {
    if (!result || !singleFile) { setCroppedImageUrl(null); return }
    cropImageUrl(singleFile, cropBox).then(setCroppedImageUrl)
  }, [result, singleFile, cropBox])

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
    setCropBox(null)
    reset()
    resetMtf()
  }

  const handleSingleAnalyze = useCallback(() => {
    if (singleFile) analyze(singleFile, undefined, cropBox)
  }, [singleFile, analyze, cropBox])

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
      <div className="text-center mb-8 pt-2">
        {/* Logo pill */}
        <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-1.5 mb-4 backdrop-blur-sm">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', boxShadow: '0 0 10px rgba(245,158,11,0.4)' }}>
            📊
          </div>
          <span className="text-xs font-semibold text-[#e2e8f0]">Crypto Chart Analyst</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live"
            style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
        </div>

        {/* Judul gradient */}
        <h1 className="text-4xl font-black tracking-tight mb-2"
          style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #f97316 45%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          AI Chart Analyst
        </h1>

        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mb-1">
          <span>Deteksi Pattern</span>
          <span className="text-slate-700">·</span>
          <span>Pump/Dump Prediction</span>
          <span className="text-slate-700">·</span>
          <span>Multi-Timeframe</span>
        </div>
        <p className="text-xs text-slate-700">
          by <span className="text-amber-500 font-semibold">AwTeguh</span>
        </p>
      </div>

      {/* Fallback Warning */}
      {usedFallback && (
        <div className="mb-4 p-3 bg-amber-500/[0.08] border border-amber-500/20 rounded-xl text-amber-400 text-sm">
          ⚠️ Menggunakan analisis sederhana (rule-based) — garis pattern tidak tersedia.
          Set <code className="bg-white/10 px-1 rounded text-xs">GEMINI_API_KEY</code> di{' '}
          <code className="bg-white/10 px-1 rounded text-xs">.env.local</code> untuk analisis AI lengkap.{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
            className="underline font-semibold text-amber-300">
            Dapatkan gratis
          </a>
        </div>
      )}

      {/* Mode Tabs */}
      <div className="flex gap-1 mb-6 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
        <button
          onClick={() => handleModeChange('single')}
          className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
            mode === 'single'
              ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          📊 Single Chart
        </button>
        <button
          onClick={() => handleModeChange('mtf')}
          className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
            mode === 'mtf'
              ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          📈 Multi-Timeframe (MTF)
        </button>
      </div>

      {/* Single Mode */}
      {mode === 'single' && (
        <div className="space-y-4">
          {singleFile ? (
            <ChartPreview
              file={singleFile}
              onRemove={() => { setSingleFile(null); setCropBox(null); reset() }}
              onCropChange={setCropBox}
            />
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
                imageUrl={croppedImageUrl ?? undefined}
              />
              <Button variant="secondary" onClick={() => { setSingleFile(null); setCropBox(null); setCroppedImageUrl(null); reset() }} className="w-full">
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

      {/* Footer */}
      <div className="text-center mt-8 space-y-1 border-t border-white/[0.04] pt-6">
        <p className="text-xs text-slate-700">
          ⚠️ Hanya untuk referensi teknikal. Bukan financial advice.
        </p>
        <p className="text-xs text-slate-700">
          Made with ❤️ by{' '}
          <a href="https://github.com/awteguh" target="_blank" rel="noopener noreferrer"
            className="text-amber-500 font-semibold hover:text-amber-400 transition-colors">
            AwTeguh
          </a>
        </p>
      </div>
    </main>
  )
}
