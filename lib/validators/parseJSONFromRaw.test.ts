import { describe, it, expect } from 'vitest'
import { extractJSONFromRaw, JSONExtractionError } from './parseJSONFromRaw'

describe('extractJSONFromRaw', () => {
  it('parses direct JSON', () => {
    const raw = '{"a":1, "b":2}'
    expect(extractJSONFromRaw(raw)).toEqual({ a: 1, b: 2 })
  })

  it('parses JSON with code fences', () => {
    const raw = '```json\n{"a":1}```'
    expect(extractJSONFromRaw(raw)).toEqual({ a: 1 })
  })

  it('throws when no JSON present', () => {
    const raw = 'No JSON here'
    expect(() => extractJSONFromRaw(raw)).toThrow(JSONExtractionError)
  })
})
