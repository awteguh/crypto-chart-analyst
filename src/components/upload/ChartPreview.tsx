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
  // Blob URL — dibuat sekali per file, revoke saat file berubah / unmount
  const [url, setUrl] = useState(() => URL.createObjectURL(file))
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  // Mode crop — false = gambar tampil normal, true = overlay aktif
  const [cropMode, setCropMode] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [cropBox, setCropBox] = useState<CropBox>(FULL_BOX)
  const [autoBox, setAutoBox] = useState<CropBox>(FULL_BOX)
  const [isAdjusted, setIsAdjusted] = useState(false)

  // Reset saat file berubah
  useEffect(() => {
    setCropMode(false)
    setDetecting(false)
    setCropBox(FULL_BOX)
    setAutoBox(FULL_BOX)
    setIsAdjusted(false)
    onCropChange(null) // null = tidak crop, pakai full image
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  // Aktifkan crop mode: jalankan auto-detect lalu tampil overlay
  const handleOpenCrop = useCallback(async () => {
    setCropMode(true)
    setDetecting(true)
    setIsAdjusted(false)
    onCropChange(null)

    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch('/api/detect-chart', { method: 'POST', body: fd })
      const box: CropBox = res.ok ? await res.json() : FULL_BOX
      setCropBox(box)
      setAutoBox(box)
      onCropChange(box)
    } catch {
      setCropBox(FULL_BOX)
      setAutoBox(FULL_BOX)
      onCropChange(FULL_BOX)
    } finally {
      setDetecting(false)
    }
  }, [file, onCropChange])

  // Batalkan crop — kembali ke full image
  const handleCancelCrop = useCallback(() => {
    setCropMode(false)
    setDetecting(false)
    setCropBox(FULL_BOX)
    setAutoBox(FULL_BOX)
    setIsAdjusted(false)
    onCropChange(null) // null = tidak crop
  }, [onCropChange])

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

        {/* Gambar */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={`Chart ${timeframe || ''}`}
          className="w-full object-cover"
        />

        {/* Spinner saat auto-detect berjalan */}
        {detecting && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="text-2xl animate-spin">⏳</div>
              <p className="text-white text-xs mt-1">mendeteksi area chart...</p>
            </div>
          </div>
        )}

        {/* Crop overlay — hanya tampil saat crop mode aktif dan detect selesai */}
        {cropMode && !detecting && (
          <CropOverlay
            cropBox={cropBox}
            onChange={handleCropChange}
            autoDetected={!isAdjusted}
          />
        )}

        {/* Tombol Crop — pojok kiri bawah, hanya tampil saat tidak crop mode */}
        {!cropMode && (
          <button
            onClick={handleOpenCrop}
            className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1 z-20 transition-colors"
            aria-label="Crop area chart"
          >
            ✂️ Crop
          </button>
        )}

        {/* Tombol Batal Crop — saat crop mode aktif */}
        {cropMode && !detecting && (
          <button
            onClick={handleCancelCrop}
            className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded z-30 transition-colors"
            aria-label="Batalkan crop"
          >
            ✕ Batal
          </button>
        )}
      </div>

      {/* Tombol Reset crop — hanya tampil jika sudah di-adjust */}
      {cropMode && isAdjusted && !detecting && (
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
