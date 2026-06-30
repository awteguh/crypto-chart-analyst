// src/components/upload/DropZone.tsx

'use client'

import { useRef, useCallback } from 'react'

interface DropZoneProps {
  onFile: (file: File) => void
  label?: string
}

export function DropZone({ onFile, label = 'Drop chart di sini atau klik untuk upload' }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      const valid = ['image/png', 'image/jpeg', 'image/webp']
      if (!valid.includes(file.type)) {
        alert('Hanya file PNG, JPG, atau WEBP yang didukung')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Ukuran file maksimal 10MB')
        return
      }
      onFile(file)
    },
    [onFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = Array.from(e.clipboardData.items)
      const imageItem = items.find((item) => item.type.startsWith('image/'))
      if (imageItem) {
        const file = imageItem.getAsFile()
        if (file) handleFile(file)
      }
    },
    [handleFile]
  )

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onPaste={handlePaste}
      onClick={() => inputRef.current?.click()}
      tabIndex={0}
      className="
        border-2 border-dashed border-amber-500/25
        rounded-2xl p-10 text-center cursor-pointer
        bg-amber-500/[0.03]
        hover:border-amber-500/50 hover:bg-amber-500/[0.06]
        hover:shadow-[0_0_24px_rgba(245,158,11,0.1)]
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-amber-500/40
      "
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      <p className="text-5xl mb-3" style={{ filter: 'drop-shadow(0 0 14px rgba(245,158,11,0.5))' }}>
        📊
      </p>
      <p className="text-[#e2e8f0] font-semibold mb-1">{label}</p>
      <p className="text-slate-500 text-xs">PNG, JPG, WEBP · Maks 10MB</p>
      <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full text-xs">
        <span>⌨️</span> Ctrl+V untuk paste langsung
      </div>
    </div>
  )
}
