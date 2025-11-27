import { describe, it, expect, beforeAll } from 'vitest'
import { POST } from './route'

describe('/api/analyze route', () => {
  it('returns validated true for mock LLM', async () => {
    process.env.USE_MOCK_LLM = 'true'
    const body = { inputText: 'テスト' }
    const req = new Request('http://localhost/api/analyze', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })
    const res = await POST(req)
    // NextResponse.json returns a Response-derivative; extract JSON via .json
    const json = await res.json()
    expect(json.validated).toBe(true)
    expect(json.result).toBeDefined()
  })
})
