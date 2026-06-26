// src/app/api/analyze/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { analyzeChart } from '@/lib/engines/analyzer'
import type { CropBox } from '@/types/crop'
import { isMeaningfulCrop } from '@/types/crop'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File | null
    const timeframe = formData.get('timeframe') as string | undefined

    if (!image) {
      return NextResponse.json({ error: 'Gambar tidak ditemukan' }, { status: 400 })
    }

    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran file maksimal 10MB' }, { status: 400 })
    }

    // Baca crop coords jika ada
    const cropX1 = formData.get('cropX1')
    const cropY1 = formData.get('cropY1')
    const cropX2 = formData.get('cropX2')
    const cropY2 = formData.get('cropY2')

    let cropBox: CropBox | null = null
    if (cropX1 && cropY1 && cropX2 && cropY2) {
      cropBox = {
        x1: Number(cropX1),
        y1: Number(cropY1),
        x2: Number(cropX2),
        y2: Number(cropY2),
      }
      if (!isMeaningfulCrop(cropBox)) cropBox = null
    }

    const result = await analyzeChart(image, timeframe || undefined, cropBox)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analisis gagal'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
