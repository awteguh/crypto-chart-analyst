// src/lib/mtf/synthesizer.ts

import type { AnalysisResult, MtfSynthesis } from '@/types/analysis'
import { synthesizeMtfWithClaude } from '@/lib/engines/claude-vision'
import { synthesizeMtfRuleBased } from '@/lib/engines/rule-based'

export async function synthesizeMtf(
  results: Partial<Record<string, AnalysisResult>>
): Promise<MtfSynthesis> {
  const hasAnyRuleBased = Object.values(results).some(
    (r) => r?.engine_used === 'rule-based'
  )

  if (!process.env.ANTHROPIC_API_KEY || hasAnyRuleBased) {
    return synthesizeMtfRuleBased(results)
  }

  try {
    return await synthesizeMtfWithClaude(results)
  } catch (err) {
    console.warn('[synthesizer] Claude MTF synthesis gagal, fallback:', err)
    return synthesizeMtfRuleBased(results)
  }
}
