// src/app/api/detect-chart/route.ts

import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import type { CropBox } from '@/types/crop'

export const maxDuration = 10

const FULL: CropBox = { x1: 0, y1: 0, x2: 100, y2: 100 }

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File | null
    if (!image) return NextResponse.json(FULL)

    const buffer = Buffer.from(await image.arrayBuffer())
    const box = await detectChartArea(buffer)
    return NextResponse.json(box)
  } catch {
    return NextResponse.json(FULL)
  }
}

async function detectChartArea(buffer: Buffer): Promise<CropBox> {
  // Resize ke 400x400 untuk efisiensi — koordinat discale balik ke persen
  const SIZE = 400
  const { data, info } = await sharp(buffer)
    .resize(SIZE, SIZE, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const ch = info.channels // 3 atau 4
  const rowDensity = new Array<number>(SIZE).fill(0)
  const colDensity = new Array<number>(SIZE).fill(0)

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * ch
      const r = data[i], g = data[i + 1], b = data[i + 2]
      const isCandle =
        (r > 150 && g < 110 && b < 110) || // merah
        (g > 140 && r < 110 && b < 110)    // hijau
      if (isCandle) {
        rowDensity[y]++
        colDensity[x]++
      }
    }
  }

  const totalCandle = rowDensity.reduce((a, b) => a + b, 0)
  // Threshold: minimal 0.5% pixel adalah candle
  if (totalCandle < SIZE * SIZE * 0.005) return FULL

  // Cari range row menggunakan sliding window (window = 10% dari height)
  const WIN = Math.floor(SIZE * 0.1)
  let bestRowScore = 0, bestRowStart = 0
  for (let r = 0; r <= SIZE - WIN; r++) {
    let score = 0
    for (let i = r; i < r + WIN; i++) score += rowDensity[i]
    if (score > bestRowScore) { bestRowScore = score; bestRowStart = r }
  }

  // Expand dari window ke full dense area
  let rowTop = bestRowStart
  let rowBot = bestRowStart + WIN
  const rowThreshold = bestRowScore / WIN * 0.15
  while (rowTop > 0 && rowDensity[rowTop - 1] > rowThreshold) rowTop--
  while (rowBot < SIZE - 1 && rowDensity[rowBot + 1] > rowThreshold) rowBot++

  // Cari batas kolom dalam range row tersebut
  let colLeft = SIZE, colRight = 0
  for (let x = 0; x < SIZE; x++) {
    if (colDensity[x] > 0) {
      if (x < colLeft) colLeft = x
      if (x > colRight) colRight = x
    }
  }
  if (colLeft >= colRight) return FULL

  // Konversi ke persen + padding 2%
  const pad = 2
  const y1 = Math.max(0, Math.round(rowTop / SIZE * 100) - pad)
  const y2 = Math.min(100, Math.round(rowBot / SIZE * 100) + pad)
  const x1 = Math.max(0, Math.round(colLeft / SIZE * 100) - pad)
  const x2 = Math.min(100, Math.round(colRight / SIZE * 100) + pad)

  // Sanity check
  if (x2 - x1 < 15 || y2 - y1 < 10) return FULL
  return { x1, y1, x2, y2 }
}
