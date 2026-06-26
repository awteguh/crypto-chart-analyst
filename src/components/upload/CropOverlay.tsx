// src/components/upload/CropOverlay.tsx
'use client'

import { useCallback, useRef } from 'react'
import type { CropBox } from '@/types/crop'

interface CropOverlayProps {
  cropBox: CropBox
  onChange: (box: CropBox) => void
  autoDetected: boolean // true = tampil label "terdeteksi", false = "manual"
}

type Handle = 'tl' | 'tr' | 'bl' | 'br' | 'move'

/** Clamp nilai dalam range [min, max] */
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function CropOverlay({ cropBox, onChange, autoDetected }: CropOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    handle: Handle
    startX: number
    startY: number
    startBox: CropBox
  } | null>(null)

  const { x1, y1, x2, y2 } = cropBox

  const onPointerDown = useCallback(
    (handle: Handle) => (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      dragRef.current = {
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startBox: { ...cropBox },
      }
    },
    [cropBox]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return
      const { handle, startX, startY, startBox } = dragRef.current
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const dx = ((e.clientX - startX) / rect.width) * 100
      const dy = ((e.clientY - startY) / rect.height) * 100

      let { x1, y1, x2, y2 } = startBox
      const MIN_SIZE = 10

      if (handle === 'move') {
        const w = x2 - x1, h = y2 - y1
        x1 = clamp(x1 + dx, 0, 100 - w)
        y1 = clamp(y1 + dy, 0, 100 - h)
        x2 = x1 + w
        y2 = y1 + h
      } else {
        if (handle === 'tl' || handle === 'bl') x1 = clamp(x1 + dx, 0, x2 - MIN_SIZE)
        if (handle === 'tr' || handle === 'br') x2 = clamp(x2 + dx, x1 + MIN_SIZE, 100)
        if (handle === 'tl' || handle === 'tr') y1 = clamp(y1 + dy, 0, y2 - MIN_SIZE)
        if (handle === 'bl' || handle === 'br') y2 = clamp(y2 + dy, y1 + MIN_SIZE, 100)
      }

      onChange({ x1: Math.round(x1), y1: Math.round(y1), x2: Math.round(x2), y2: Math.round(y2) })
    },
    [onChange]
  )

  const onPointerUp = useCallback(() => {
    dragRef.current = null
  }, [])

  // Posisi handle
  const handles: { id: Handle; style: React.CSSProperties }[] = [
    { id: 'tl', style: { top: `${y1}%`, left: `${x1}%`, transform: 'translate(-50%,-50%)' } },
    { id: 'tr', style: { top: `${y1}%`, left: `${x2}%`, transform: 'translate(-50%,-50%)' } },
    { id: 'bl', style: { top: `${y2}%`, left: `${x1}%`, transform: 'translate(-50%,-50%)' } },
    { id: 'br', style: { top: `${y2}%`, left: `${x2}%`, transform: 'translate(-50%,-50%)' } },
  ]

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden z-10"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Dim overlay luar — 4 rect: atas, bawah, kiri, kanan */}
      <div className="absolute bg-black/45 pointer-events-none"
        style={{ top: 0, left: 0, right: 0, height: `${y1}%` }} />
      <div className="absolute bg-black/45 pointer-events-none"
        style={{ bottom: 0, left: 0, right: 0, top: `${y2}%` }} />
      <div className="absolute bg-black/45 pointer-events-none"
        style={{ top: `${y1}%`, left: 0, width: `${x1}%`, height: `${y2 - y1}%` }} />
      <div className="absolute bg-black/45 pointer-events-none"
        style={{ top: `${y1}%`, right: 0, left: `${x2}%`, height: `${y2 - y1}%` }} />

      {/* Kotak seleksi — draggable untuk move */}
      <div
        className="absolute border-2 border-green-500 bg-green-500/5 cursor-move"
        style={{ top: `${y1}%`, left: `${x1}%`, width: `${x2 - x1}%`, height: `${y2 - y1}%` }}
        onPointerDown={onPointerDown('move')}
      >
        {/* Label */}
        <div className="absolute -top-5 left-0 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap select-none">
          {autoDetected ? '✓ chart terdeteksi · drag untuk adjust' : '✂️ crop area'}
        </div>
      </div>

      {/* Corner handles */}
      {handles.map(({ id, style }) => (
        <div
          key={id}
          className="absolute w-3 h-3 md:w-2.5 md:h-2.5 bg-green-500 rounded-sm cursor-pointer z-30 touch-none"
          style={style}
          onPointerDown={onPointerDown(id)}
        />
      ))}
    </div>
  )
}
