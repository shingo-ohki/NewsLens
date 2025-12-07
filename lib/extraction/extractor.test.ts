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

  it('fails on HTTP 404 error', async () => {
    vi.useRealTimers()
    const fetchMock = vi.fn(async () => new Response('Not Found', { status: 404 }))
    global.fetch = fetchMock as any

    const res = await extractArticleContent('https://example.com/notfound')

    expect(res.status).toBe('fail')
    expect(res.warnings[0]).toContain('404')
  })

  it('fails on HTTP 500 error', async () => {
    vi.useRealTimers()
    const fetchMock = vi.fn(async () => new Response('Server Error', { status: 500 }))
    global.fetch = fetchMock as any

    const res = await extractArticleContent('https://example.com/error')

    expect(res.status).toBe('fail')
    expect(res.warnings[0]).toContain('500')
  })

  it('fails on network error', async () => {
    vi.useRealTimers()
    const fetchMock = vi.fn(async () => {
      throw new Error('Network error')
    })
    global.fetch = fetchMock as any

    const res = await extractArticleContent('https://example.com/network-fail')

    expect(res.status).toBe('fail')
    expect(res.warnings[0]).toContain('エラー')
  })

  it('fails on empty HTML', async () => {
    vi.useRealTimers()
    const fetchMock = vi.fn(async () => new Response('', { status: 200 }))
    global.fetch = fetchMock as any

    const res = await extractArticleContent('https://example.com/empty')

    expect(res.status).toBe('fail')
    expect(res.warnings[0]).toContain('HTML')
  })

  it('returns warning for long content over 5000 chars', async () => {
    vi.useRealTimers()
    const longContent = 'あ'.repeat(6000)
    const html = `<html><head><title>Long Article</title></head><body><article><p>${longContent}</p></article></body></html>`
    const fetchMock = vi.fn(async () => new Response(html, { status: 200, headers: { 'Content-Type': 'text/html' } }))
    global.fetch = fetchMock as any

    const res = await extractArticleContent('https://example.com/long-article')

    expect(res.status).toBe('success')
    expect(res.contentLength).toBeGreaterThan(5000)
    expect(res.warnings.some(w => w.includes('5000文字を超えています'))).toBe(true)
  })

  it('returns warning when metadata is missing', async () => {
    vi.useRealTimers()
    const html = '<html><body><article><p>' + 'コンテンツ。'.repeat(100) + '</p></article></body></html>'
    const fetchMock = vi.fn(async () => new Response(html, { status: 200, headers: { 'Content-Type': 'text/html' } }))
    global.fetch = fetchMock as any

    const res = await extractArticleContent('https://example.com/no-metadata')

    expect(res.status).toBe('success')
    expect(res.warnings.some(w => w.includes('ニュース記事ではない'))).toBe(true)
  })

  it('follows HTTP to HTTPS redirect successfully', async () => {
    vi.useRealTimers()
    const html = '<html><head><title>Test</title></head><body><article><p>' + 'テスト記事本文。'.repeat(100) + '</p></article></body></html>'
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('', { status: 301, headers: { 'Location': 'https://example.com/article' } }))
      .mockResolvedValueOnce(new Response(html, { status: 200, headers: { 'Content-Type': 'text/html' } }))
    global.fetch = fetchMock as any

    const res = await extractArticleContent('http://example.com/article')

    expect(res.status).toBe('success')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('rejects redirect to private IP', async () => {
    vi.useRealTimers()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('', { status: 301, headers: { 'Location': 'http://192.168.1.1/private' } }))
    global.fetch = fetchMock as any

    const res = await extractArticleContent('https://example.com/redirect')

    expect(res.status).toBe('fail')
    expect(res.warnings[0]).toContain('有効なURL')
  })

  it('rejects multiple redirects', async () => {
    vi.useRealTimers()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('', { status: 301, headers: { 'Location': 'https://www.example.com/article' } }))
      .mockResolvedValueOnce(new Response('', { status: 301, headers: { 'Location': 'https://www.example.com/final' } }))
    global.fetch = fetchMock as any

    const res = await extractArticleContent('https://example.com/article')

    expect(res.status).toBe('fail')
    expect(res.warnings[0]).toContain('複数回のリダイレクト')
  })

  it('rejects content exceeding 10MB limit', async () => {
    vi.useRealTimers()
    const fetchMock = vi.fn(async () => new Response('', { 
      status: 200, 
      headers: { 'Content-Length': '20000000' } // 20MB
    }))
    global.fetch = fetchMock as any

    const res = await extractArticleContent('https://example.com/huge')

    expect(res.status).toBe('fail')
    expect(res.warnings[0]).toContain('サイズが大きすぎます')
  })

  it('blocks localhost URL', async () => {
    const res = await extractArticleContent('http://localhost:8080/test')

    expect(res.status).toBe('fail')
    expect(res.warnings[0]).toContain('有効なURL')
  })

  it('blocks private IP 10.x.x.x', async () => {
    const res = await extractArticleContent('http://10.0.0.1/test')

    expect(res.status).toBe('fail')
    expect(res.warnings[0]).toContain('有効なURL')
  })

  it('blocks non-HTTP protocol', async () => {
    const res = await extractArticleContent('file:///etc/passwd')

    expect(res.status).toBe('fail')
    expect(res.warnings[0]).toContain('有効なURL')
  })
})
