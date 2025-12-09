export class JSONExtractionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'JSONExtractionError'
  }
}

function removeCodeFences(s: string) {
  return s.replace(/```(?:json)?\n?/gi, '').replace(/```/g, '')
}

function tryParse(s: string) {
  try {
    return JSON.parse(s)
  } catch (_e) {
    return null
  }
}

/**
 * 末尾のカンマを削除（JSON修正）
 */
function fixTrailingCommas(s: string): string {
  // 配列の最後のアイテム後のカンマを削除
  s = s.replace(/,\s*\]/g, ']')
  // オブジェクトの最後のプロパティ後のカンマを削除
  s = s.replace(/,\s*\}/g, '}')
  return s
}

// Simple bracket-aware extraction: find first {...} block that parses
export function extractJSONFromRaw(raw: string): unknown {
  if (!raw || typeof raw !== 'string') {
    throw new JSONExtractionError('No raw string to parse')
  }

  let s = raw.trim()
  s = removeCodeFences(s)
  s = fixTrailingCommas(s)  // 末尾のカンマを修正

  // Try direct parse first
  const direct = tryParse(s)
  if (direct !== null) {
    // Ensure it's an object, not array
    if (typeof direct === 'object' && !Array.isArray(direct)) {
      return direct
    }
  }

  // Try to find first {...} block (prioritize objects over arrays)
  let depth = 0
  let startIdx = -1
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === '{') {
      if (startIdx === -1) startIdx = i
      depth++
    } else if (c === '}') {
      depth--
      if (startIdx !== -1 && depth === 0) {
        let candidate = s.slice(startIdx, i + 1)
        const parsed = tryParse(candidate)
        if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed
        } else {
          // パース失敗時はインデックスと深度をリセットして次のブロック探索へ
          startIdx = -1
          depth = 0
        }
      }
    }
  }

  throw new JSONExtractionError('Could not extract valid JSON object from raw LLM output')
}

export default extractJSONFromRaw
