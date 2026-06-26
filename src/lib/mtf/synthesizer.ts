// src/lib/mtf/synthesizer.ts

import type { AnalysisResult, MtfSynthesis } from '@/types/analysis'
import { synthesizeMtfWithClaude } from '@/lib/engines/claude-vision'
import { synthesizeMtfWithGemini } from '@/lib/engines/gemini-vision'
import { synthesizeMtfRuleBased } from '@/lib/engines/rule-based'

export async function synthesizeMtf(
  results: Partial<Record<string, AnalysisResult>>
): Promise<MtfSynthesis> {
  const hasAnyRuleBased = Object.values(results).some(
    (r) => r?.engine_used === 'rule-based'
  )

  // Jika ada hasil rule-based, synthesis AI tidak berguna → pakai rule-based juga
  if (hasAnyRuleBased) {
    return synthesizeMtfRuleBased(results)
  }

  // Prioritas: Gemini → Claude → rule-based
  if (process.env.GEMINI_API_KEY) {
    try {
      return await synthesizeMtfWithGemini(results)
    } catch (err) {
      console.warn('[synthesizer] Gemini MTF synthesis gagal:', err)
    }
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await synthesizeMtfWithClaude(results)
    } catch (err) {
      console.warn('[synthesizer] Claude MTF synthesis gagal:', err)
    }
  }

  return synthesizeMtfRuleBased(results)
}
