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

// Simple bracket-aware extraction: find first {...} or [...] block that parses
export function extractJSONFromRaw(raw: string): unknown {
  if (!raw || typeof raw !== 'string') {
    throw new JSONExtractionError('No raw string to parse')
  }

  let s = raw.trim()
  s = removeCodeFences(s)

  // Try direct parse
  const direct = tryParse(s)
  if (direct !== null) return direct

  // Try to find first JSON block
  // We will attempt to find balanced braces/brackets
  const startChars = ['{', '[']
  for (const startChar of startChars) {
    const start = s.indexOf(startChar)
    if (start === -1) continue
    let depth = 0
    for (let i = start; i < s.length; i++) {
      const c = s[i]
      if (c === startChar) depth++
      else if ((startChar === '{' && c === '}') || (startChar === '[' && c === ']')) depth--
      if (depth === 0) {
        const candidate = s.slice(start, i + 1)
        const parsed = tryParse(candidate)
        if (parsed !== null) return parsed
        break
      }
    }
  }

  // Fallback: use regex to match the first large { ... } block (naive)
  const regex = /\{(?:[^{}]|\{[^}]*\})+\}/g
  const matches = s.match(regex)
  if (matches && matches.length > 0) {
    for (const m of matches) {
      const parsed = tryParse(m)
      if (parsed !== null) return parsed
    }
  }

  throw new JSONExtractionError('Could not extract JSON from raw LLM output')
}

export default extractJSONFromRaw
