import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'
import type { ExtractionResult } from './types'

const TIMEOUT_MS = 10_000
const USER_AGENT = 'NewsLensBot/1.0 (+https://newslens.example)' // polite UA

function toFail(message: string): ExtractionResult {
  return { status: 'fail', content: '', contentLength: 0, warnings: [message] }
}

function buildWarnings(contentLength: number, parsed: ReturnType<Readability['parse']>): string[] {
  const warnings: string[] = []
  if (contentLength < 500) warnings.push('本文が500文字未満です。内容が十分でない可能性があります。')
  if (contentLength > 5000) warnings.push('本文が5000文字を超えています。長文のため要約が必要な場合があります。')
  if (!parsed?.title && !parsed?.byline) warnings.push('ニュース記事ではない可能性があります。')
  return warnings
}

export async function extractArticleContent(url: string): Promise<ExtractionResult> {
  if (!url || typeof url !== 'string') return toFail('有効なURLを指定してください。')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': USER_AGENT } })
    if (!res.ok) return toFail(`URL取得に失敗しました (status: ${res.status}).`)

    const html = await res.text()
    if (!html || html.trim().length === 0) return toFail('HTMLを取得できませんでした。')

    const dom = new JSDOM(html, { url })
    const reader = new Readability(dom.window.document)
    const parsed = reader.parse()
    if (!parsed || !parsed.textContent?.trim()) return toFail('本文抽出に失敗しました。記事テキストを直接貼り付けてください。')

    const content = parsed.textContent.trim()
    const contentLength = content.length
    const warnings = buildWarnings(contentLength, parsed)

    return {
      status: 'success',
      content,
      contentLength,
      warnings,
      metadata: {
        title: parsed.title ?? undefined,
        byline: parsed.byline ?? undefined,
        siteName: parsed.siteName ?? undefined,
        publishedTime: (parsed as any).publishedTime ?? undefined,
      },
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') return toFail('10秒以内に本文を取得できませんでした。URLの取得に失敗しました。')
    return toFail('本文取得中にエラーが発生しました。')
  } finally {
    clearTimeout(timeout)
  }
}

export default extractArticleContent
