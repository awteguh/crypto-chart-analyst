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
          <img
            src="/icon.png"
            alt="logo"
            className="w-6 h-6 rounded-lg"
            style={{ boxShadow: '0 0 10px rgba(245,158,11,0.4)' }}
          />
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
          <img src="/icon.png" alt="" className="w-4 h-4 inline" /> Single Chart
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

      {/* Help Desk / Report */}
      <div className="mt-8 border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="bg-white/[0.03] px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold text-[#e2e8f0]">🛠️ Bantuan & Laporan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Temukan bug, error, atau punya ide fitur baru? Hubungi kami via WhatsApp.
          </p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Bug Report */}
          <a
            href={`https://wa.me/6282228305590?text=${encodeURIComponent('🐛 *BUG REPORT — Crypto Chart Analyst*\n\nDeskripsi bug:\n\nLangkah reproduksi:\n\nExpected:\n\nActual:')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-2 p-4 bg-red-500/[0.06] border border-red-500/20 rounded-xl hover:bg-red-500/[0.1] hover:border-red-500/35 transition-all duration-200 group"
          >
            <div className="text-xl">🐛</div>
            <div>
              <div className="text-sm font-semibold text-red-400 group-hover:text-red-300 transition-colors">
                Laporkan Bug
              </div>
              <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Ada error atau fitur yang tidak berjalan dengan benar
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-green-400 font-semibold mt-auto">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.557 4.121 1.529 5.849L0 24l6.335-1.652A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.645-.52-5.148-1.422l-.369-.219-3.763.981.998-3.662-.24-.378A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              WhatsApp
            </div>
          </a>

          {/* Feature Request */}
          <a
            href={`https://wa.me/6282228305590?text=${encodeURIComponent('✨ *FEATURE REQUEST — Crypto Chart Analyst*\n\nFitur yang diinginkan:\n\nAlasan / use case:\n\nContoh / referensi (opsional):')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-2 p-4 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl hover:bg-amber-500/[0.1] hover:border-amber-500/35 transition-all duration-200 group"
          >
            <div className="text-xl">✨</div>
            <div>
              <div className="text-sm font-semibold text-amber-400 group-hover:text-amber-300 transition-colors">
                Request Fitur
              </div>
              <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Punya ide fitur baru atau perbaikan yang ingin ditambahkan
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-green-400 font-semibold mt-auto">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.557 4.121 1.529 5.849L0 24l6.335-1.652A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.645-.52-5.148-1.422l-.369-.219-3.763.981.998-3.662-.24-.378A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              WhatsApp
            </div>
          </a>

          {/* General Help */}
          <a
            href={`https://wa.me/6282228305590?text=${encodeURIComponent('❓ *PERTANYAAN — Crypto Chart Analyst*\n\nPertanyaan saya:')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-2 p-4 bg-cyan-500/[0.06] border border-cyan-500/20 rounded-xl hover:bg-cyan-500/[0.1] hover:border-cyan-500/35 transition-all duration-200 group"
          >
            <div className="text-xl">❓</div>
            <div>
              <div className="text-sm font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors">
                Bantuan Umum
              </div>
              <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Ada pertanyaan tentang cara penggunaan atau hasil analisis
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-green-400 font-semibold mt-auto">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.557 4.121 1.529 5.849L0 24l6.335-1.652A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.645-.52-5.148-1.422l-.369-.219-3.763.981.998-3.662-.24-.378A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              WhatsApp
            </div>
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 space-y-1 border-t border-white/[0.04] pt-6">
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
