// src/lib/engines/claude-vision.ts

import Anthropic from '@anthropic-ai/sdk'
import type { AnalysisResult, MtfSynthesis } from '@/types/analysis'
import { buildSingleChartPrompt } from '@/lib/prompts/single-chart'
import { buildMtfSynthesisPrompt } from '@/lib/prompts/mtf-chart'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function analyzeWithClaude(
  imageBase64: string,
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp',
  timeframe?: string
): Promise<AnalysisResult> {
  const message = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: buildSingleChartPrompt(timeframe),
          },
        ],
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const parsed = JSON.parse(text.trim())

  if (parsed.error) {
    throw new Error(parsed.error)
  }

  return parsed as AnalysisResult
}

export async function synthesizeMtfWithClaude(
  results: Partial<Record<string, AnalysisResult>>
): Promise<MtfSynthesis> {
  const message = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: buildMtfSynthesisPrompt(results),
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return JSON.parse(text.trim()) as MtfSynthesis
}
