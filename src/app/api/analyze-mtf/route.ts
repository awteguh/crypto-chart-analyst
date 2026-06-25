// src/app/api/analyze-mtf/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { analyzeChart } from '@/lib/engines/analyzer'
import { synthesizeMtf } from '@/lib/mtf/synthesizer'
import type { AnalysisResult } from '@/types/analysis'

export const maxDuration = 120

const TF_KEYS = ['15m', '1h', '4h', '1d'] as const

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const uploadedFiles: Array<{ key: string; displayTf: string; file: File }> = []

    for (const key of TF_KEYS) {
      const file = formData.get(`image_${key}`) as File | null
      if (file && file.size > 0) {
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: `File ${key} melebihi batas 10MB` },
            { status: 400 }
          )
        }
        uploadedFiles.push({
          key,
          displayTf: key === '1d' ? '1D' : key,
          file,
        })
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: 'Upload minimal 1 gambar chart' },
        { status: 400 }
      )
    }

    // Analisis semua TF secara paralel
    const analysisResults = await Promise.all(
      uploadedFiles.map(({ file, displayTf }) => analyzeChart(file, displayTf))
    )

    const results: Partial<Record<string, AnalysisResult>> = {}
    uploadedFiles.forEach(({ displayTf }, i) => {
      results[displayTf] = analysisResults[i]
    })

    const synthesis = await synthesizeMtf(results)

    return NextResponse.json({ results, synthesis })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analisis MTF gagal'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
