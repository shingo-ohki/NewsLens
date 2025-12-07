import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { extractArticleContent } from './extractor'

const originalFetch = global.fetch

describe('extractArticleContent', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.useRealTimers()
  })

  it('fails on invalid url', async () => {
    const res = await extractArticleContent('')
    expect(res.status).toBe('fail')
    expect(res.warnings.length).toBeGreaterThan(0)
  })

  it('fails on timeout after 10s', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn((_input: RequestInfo, init?: RequestInit) => new Promise((_, reject) => {
      const signal = init?.signal as AbortSignal | undefined
      if (signal) {
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      }
    }))
    global.fetch = fetchMock as any

    const promise = extractArticleContent('https://example.com')
    vi.advanceTimersByTime(10_500)
    const res = await promise

    expect(res.status).toBe('fail')
    expect(res.warnings[0]).toContain('10秒以内')
  })

  it('extracts and returns warnings for short content', async () => {
    vi.useRealTimers()
    const html = '<html><head><title>Test</title></head><body><article><p>短い本文です。</p></article></body></html>'
    const fetchMock = vi.fn(async () => new Response(html, { status: 200, headers: { 'Content-Type': 'text/html' } }))
    global.fetch = fetchMock as any

    const res = await extractArticleContent('https://example.com/article')

    expect(res.status).toBe('success')
    expect(res.contentLength).toBeGreaterThan(0)
    expect(res.warnings.length).toBeGreaterThan(0)
  })
})
