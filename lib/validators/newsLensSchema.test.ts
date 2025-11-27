import { describe, it, expect } from 'vitest'
import { safeParseNewsLensResult, parseNewsLensResult, newsLensSchema } from './newsLensSchema'

const valid = {
  summary: { '100': '短', '300': '中', '600': '長' },
  key_points: ['A', 'B', 'C'],
  actors: [{ name: 'X', type: 'organization', description: 'desc' }],
  issues: ['I1'],
  stances: [{ actor: 'X', stance: 'Y', stance_type: 'support', evidence: 'E' }],
  causal_map: [{ problem: 'P', causes: ['C1'], mechanisms: ['M1'], consequences: ['R1'], notes: '' }],
  underlying_values: ['V1'],
  uncertainties: ['U1'],
}

describe('newsLensSchema', () => {
  it('parses valid schema', () => {
    const res = newsLensSchema.safeParse(valid)
    expect(res.success).toBe(true)
  })

  it('fails when key_points are too few', () => {
    const bad = { ...valid, key_points: ['A', 'B'] }
    const res = newsLensSchema.safeParse(bad)
    expect(res.success).toBe(false)
  })

  it('fails when summary missing 600', () => {
    const bad = { ...valid, summary: { '100': 'a', '300': 'b' } }
    const res = newsLensSchema.safeParse(bad)
    expect(res.success).toBe(false)
  })

  it('fails when actor type invalid', () => {
    const bad = { ...valid, actors: [{ name: 'X', type: 'person', description: 'desc' }] }
    const res = newsLensSchema.safeParse(bad)
    expect(res.success).toBe(false)
  })
})
