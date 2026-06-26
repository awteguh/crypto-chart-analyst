// src/components/upload/ChartPreview.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { CropOverlay } from './CropOverlay'
import type { CropBox } from '@/types/crop'

interface ChartPreviewProps {
  file: File
  timeframe?: string
  onRemove: () => void
  onCropChange: (box: CropBox | null) => void
}

const FULL_BOX: CropBox = { x1: 0, y1: 0, x2: 100, y2: 100 }

export function ChartPreview({ file, timeframe, onRemove, onCropChange }: ChartPreviewProps) {
  // Buat blob URL sekali per file, revoke saat unmount atau file berubah
  const [url, setUrl] = useState(() => URL.createObjectURL(file))
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])
  const [cropBox, setCropBox] = useState<CropBox>(FULL_BOX)
  const [autoBox, setAutoBox] = useState<CropBox>(FULL_BOX) // hasil detect
  const [detecting, setDetecting] = useState(true)
  const [isAutoDetected, setIsAutoDetected] = useState(false)
  const [isAdjusted, setIsAdjusted] = useState(false)

  // Auto-detect saat file berubah
  useEffect(() => {
    let cancelled = false
    setDetecting(true)
    setIsAdjusted(false)
    setIsAutoDetected(false)
    setCropBox(FULL_BOX)
    onCropChange(null) // null = belum siap, page.tsx akan disable tombol Analisis

    const detect = async () => {
      try {
        const fd = new FormData()
        fd.append('image', file)
        const res = await fetch('/api/detect-chart', { method: 'POST', body: fd })
        if (!res.ok) throw new Error()
        const box = await res.json() as CropBox
        if (!cancelled) {
          setAutoBox(box)
          setCropBox(box)
          setIsAutoDetected(true)
          onCropChange(box)
        }
      } catch {
        if (!cancelled) {
          setAutoBox(FULL_BOX)
          setCropBox(FULL_BOX)
          onCropChange(FULL_BOX)
        }
      } finally {
        if (!cancelled) setDetecting(false)
      }
    }

    detect()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  const handleCropChange = useCallback((box: CropBox) => {
    setCropBox(box)
    onCropChange(box)
    setIsAdjusted(true)
  }, [onCropChange])

  const handleReset = useCallback(() => {
    setCropBox(autoBox)
    onCropChange(autoBox)
    setIsAdjusted(false)
  }, [autoBox, onCropChange])

  return (
    <div className="space-y-2">
      <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Label timeframe */}
        {timeframe && (
          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded font-bold z-20">
            {timeframe}
          </div>
        )}

        {/* Tombol hapus */}
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs z-20 hover:bg-red-600"
          aria-label="Hapus gambar"
        >
          ✕
        </button>

        {/* Gambar — pakai img biasa karena src adalah blob URL */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={`Chart ${timeframe || ''}`}
          className="w-full object-cover"
        />

        {/* State: detecting */}
        {detecting && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="text-2xl animate-spin">⏳</div>
              <p className="text-white text-xs mt-1">mendeteksi area chart...</p>
            </div>
          </div>
        )}

        {/* Crop overlay — tampil setelah detect selesai */}
        {!detecting && (
          <CropOverlay
            cropBox={cropBox}
            onChange={handleCropChange}
            autoDetected={isAutoDetected && !isAdjusted}
          />
        )}
      </div>

      {/* Tombol Reset — hanya tampil jika sudah di-adjust */}
      {isAdjusted && !detecting && (
        <button
          onClick={handleReset}
          className="w-full text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 py-1"
        >
          ↺ Reset ke area yang terdeteksi otomatis
        </button>
      )}
    </div>
  )
}
