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

  describe('fixTrailingCommas - 末尾カンマの処理', () => {
    it('配列の末尾カンマを削除する', () => {
      const input = '{"items": [1, 2,]}'
      const result = extractJSONFromRaw(input)
      expect(result).toEqual({ items: [1, 2] })
    })

    it('オブジェクトの末尾カンマを削除する', () => {
      const input = '{"name": "John",}'
      const result = extractJSONFromRaw(input)
      expect(result).toEqual({ name: 'John' })
    })

    it('ネストされた構造での末尾カンマを処理する', () => {
      const input = '{"person": {"name": "John",}, "items": [1, 2,]}'
      const result = extractJSONFromRaw(input)
      expect(result).toEqual({
        person: { name: 'John' },
        items: [1, 2],
      })
    })

    it('空白を含む末尾カンマを処理する', () => {
      const input = '{"a": 1 , }'
      const result = extractJSONFromRaw(input)
      expect(result).toEqual({ a: 1 })
    })

    it('複数の末尾カンマを処理する', () => {
      const input = '{"arr": [1, 2,], "nested": {"x": 1,},}'
      const result = extractJSONFromRaw(input)
      expect(result).toEqual({
        arr: [1, 2],
        nested: { x: 1 },
      })
    })
  })

  describe('複数ブロック検索とリセット', () => {
    it('複数のJSONブロックが存在する場合、最初の有効なオブジェクトを返す', () => {
      const input = '{"invalid": } some text {"valid": true}'
      const result = extractJSONFromRaw(input)
      expect(result).toEqual({ valid: true })
    })

    it('最初のブロックがパース失敗時にリセットして次を探す', () => {
      // 最初の { は閉じられず、2番目のブロックが正しい形式
      const input = 'prefix { invalid } {"correct": 1}'
      const result = extractJSONFromRaw(input)
      expect(result).toEqual({ correct: 1 })
    })
  })

  describe('型チェック', () => {
    it('配列ではなくオブジェクトのみを受け入れる', () => {
      const input = '[1, 2, 3]'
      expect(() => extractJSONFromRaw(input)).toThrow(JSONExtractionError)
    })

    it('nullを受け入れない', () => {
      const input = 'null'
      expect(() => extractJSONFromRaw(input)).toThrow(JSONExtractionError)
    })

    it('プリミティブ値を受け入れない', () => {
      const input = '42'
      expect(() => extractJSONFromRaw(input)).toThrow(JSONExtractionError)
    })
  })

  describe('複雑なシナリオ', () => {
    it('LLM出力から末尾カンマ付きJSONを抽出する', () => {
      const llmOutput = `{
        "summary": {"100": "a",},
        "key_points": ["x", "y",],
        "actors": [],
        "issues": [],
        "stances": [],
        "causal_map": [],
        "underlying_values": [],
        "uncertainties": [],
      }`
      const result = extractJSONFromRaw(llmOutput)
      expect(result).toHaveProperty('summary')
      expect((result as any).key_points).toEqual(['x', 'y'])
    })
  })
})
