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
      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <p className="text-4xl mb-2">📊</p>
      <p className="text-gray-600 dark:text-gray-300 text-sm">{label}</p>
      <p className="text-gray-400 text-xs mt-1">PNG, JPG, WEBP · Maks 10MB · Ctrl+V untuk paste</p>
    </div>
  )
}
