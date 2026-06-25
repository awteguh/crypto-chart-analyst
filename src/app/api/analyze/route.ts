// src/app/api/analyze/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { analyzeChart } from '@/lib/engines/analyzer'

export const maxDuration = 60 // 60 detik timeout untuk Vercel

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File | null
    const timeframe = formData.get('timeframe') as string | undefined

    if (!image) {
      return NextResponse.json({ error: 'Gambar tidak ditemukan' }, { status: 400 })
    }

    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 10MB' },
        { status: 400 }
      )
    }

    const result = await analyzeChart(image, timeframe || undefined)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analisis gagal'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
