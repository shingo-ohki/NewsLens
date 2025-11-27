import type { NewsLensResult } from '../types/NewsLensResult'

export function mockLLMAnalyzeResponse(valid = true): string {
  if (valid) {
    const sample: NewsLensResult = {
      summary: {
        '100': '要点（短）',
        '300': '要点（中）: 記事の主なポイントを中程度の長さで説明します。',
        '600': '要点（長）: 記事の詳細な説明や背景、影響を600文字程度で十分に説明します。',
      },
      key_points: ['要点1', '要点2', '要点3'],
      actors: [
        { name: '政府', type: 'organization', description: '政府部門または機関' },
      ],
      issues: ['Issue A'],
      stances: [
        { actor: '政府', stance: '支援', stance_type: 'support', evidence: '記事の引用' },
      ],
      causal_map: [
        { problem: '課題', causes: ['原因A'], mechanisms: ['仕組みA'], consequences: ['結果A'], notes: '' },
      ],
      underlying_values: ['公平性'],
      uncertainties: ['一次情報が不足している'],
    }
    return JSON.stringify(sample, null, 2)
  }

  // invalid output: returns an object missing some fields or wrong types
  return JSON.stringify({
    summary: { '100': '', '300': '', /* missing 600 */ },
    key_points: ['a', 'b'], // too few
    // actors omitted
  })
}

export default mockLLMAnalyzeResponse
