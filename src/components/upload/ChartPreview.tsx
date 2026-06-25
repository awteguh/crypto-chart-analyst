// src/components/upload/ChartPreview.tsx

'use client'

import Image from 'next/image'

interface ChartPreviewProps {
  file: File
  timeframe?: string
  onRemove: () => void
}

export function ChartPreview({ file, timeframe, onRemove }: ChartPreviewProps) {
  const url = URL.createObjectURL(file)
  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {timeframe && (
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded font-bold z-10">
          {timeframe}
        </div>
      )}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs z-10 hover:bg-red-600"
        aria-label="Hapus gambar"
      >
        ✕
      </button>
      <Image
        src={url}
        alt={`Chart ${timeframe || ''}`}
        width={400}
        height={250}
        className="w-full object-cover"
        unoptimized
      />
    </div>
  )
}
