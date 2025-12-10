import { Readability } from '@mozilla/readability'
import type { ExtractionResult } from './types'

// Dynamically import JSDOM to avoid ESM compatibility issues
// Using a function to defer the import until runtime
async function getJSDOM() {
  try {
    // Try dynamic import first (works in most environments)
    const { JSDOM } = await import('jsdom')
    return JSDOM
  } catch (err: any) {
    const isDebug = process.env.DEBUG_LLM === 'true'
    if (isDebug) {
      console.error('[DEBUG] Failed to import jsdom:', err.message || err)
    }
    // Fallback: Try CommonJS require (for Vercel compatibility)
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const jsdom = require('jsdom')
      return jsdom.JSDOM
    } catch (requireErr: any) {
      if (isDebug) {
        console.error('[DEBUG] Failed to require jsdom:', requireErr.message || requireErr)
      }
      throw new Error('jsdomのインポートに失敗しました。')
    }
  }
}

const TIMEOUT_MS = 10_000
const USER_AGENT = 'NewsLensBot/1.0 (+https://newslens.example)' // polite UA
const MAX_CONTENT_LENGTH = 10_000_000 // 10MB

function toFail(message: string): ExtractionResult {
  return { status: 'fail', content: '', contentLength: 0, warnings: [message] }
}

function isValidAndSafeUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false
    }
    
    const hostname = url.hostname.toLowerCase()
    
    // Block localhost and loopback addresses
    if (['localhost', '127.0.0.1', '::1'].includes(hostname)) {
      return false
    }
    
    // Block private IP ranges using regex
    // 10.x.x.x, 172.16-31.x.x, 192.168.x.x, 169.254.x.x (link-local)
    const privateIpPattern = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|169\.254\.)/
    if (privateIpPattern.test(hostname)) {
      return false
    }
    
    return true
  } catch {
    return false
  }
}

function buildWarnings(contentLength: number, parsed: ReturnType<Readability['parse']>): string[] {
  const warnings: string[] = []
  if (contentLength < 500) warnings.push('本文が500文字未満です。内容が十分でない可能性があります。')
  if (contentLength > 5000) warnings.push('本文が5000文字を超えています。長文のため要約が必要な場合があります。')
  if (!parsed?.title && !parsed?.byline) warnings.push('ニュース記事ではない可能性があります。')
  return warnings
}

/**
 * Extracts the main readable content from a news article at the given URL.
 *
 * - Fetches the HTML from the provided URL and parses it using Readability.
 * - Aborts the request if it takes longer than 10 seconds.
 * - Blocks access to private IP ranges, localhost, and non-HTTP(S) protocols to prevent SSRF attacks.
 * - Handles the first redirect only (up to 1 redirect from the initial request):
 *   * HTTP → HTTPS upgrades on the same host with identical path, query, and fragment
 *   * www subdomain additions/removals with identical path, query, and fragment
 * - Limits response size to 10MB if Content-Length header is present.
 * - Returns warnings if the content is too short (<500 chars), too long (>5000 chars),
 *   or if metadata (title/byline) is missing, indicating it may not be a news article.
 *
 * @param {string} url - The URL of the article to extract content from.
 * @returns {Promise<ExtractionResult>} The extraction result, including content, metadata, and warnings.
 *
 * @example
 * const result = await extractArticleContent('https://example.com/news/123');
 * if (result.status === 'success') {
 *   console.log(result.content);
 *   console.log(result.metadata?.title);
 *   if (result.warnings.length) console.warn(result.warnings);
 * } else {
 *   console.error(result.warnings[0]);
 * }
 */
export async function extractArticleContent(url: string): Promise<ExtractionResult> {
  if (!url || typeof url !== 'string') return toFail('有効なURLを指定してください。')
  if (!isValidAndSafeUrl(url)) return toFail('有効なURLを指定してください。')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    let res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': USER_AGENT }, redirect: 'manual' })
    
    // Handle redirects safely
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('Location')
      if (!location) return toFail('リダイレクトが検出されましたが、リダイレクト先のURLが見つかりません。')
      
      let redirectUrl: URL
      try {
        redirectUrl = new URL(location, url)
      } catch {
        return toFail('有効なURLを指定してください。')
      }
      
      // Validate redirect URL for SSRF
      if (!isValidAndSafeUrl(redirectUrl.toString())) {
        return toFail('有効なURLを指定してください。')
      }
      
      const originalUrl = new URL(url)
      // HTTPSアップグレード判定時、パス・ホスト名・クエリ・フラグメントがすべて一致している場合のみ許可する
      // （クエリやフラグメントが異なる場合は別リソースとみなしてリダイレクトを拒否することで、意図しないリソースへの遷移やパラメータ改ざんを防止）
      const isSameHostHttpsUpgrade = 
        originalUrl.protocol === 'http:' &&
        redirectUrl.protocol === 'https:' &&
        originalUrl.hostname === redirectUrl.hostname &&
        originalUrl.pathname === redirectUrl.pathname &&
        originalUrl.search === redirectUrl.search &&
        originalUrl.hash === redirectUrl.hash
      
      // wwwサブドメインの追加/削除を許可する条件では、パス（pathname）とクエリパラメータ（search）が一致していることを確認する。
      // フラグメント（hash）はサーバーに送信されないため、比較しないのは意図的な設計です。
      const isWwwSubdomainAddition = 
        originalUrl.protocol === redirectUrl.protocol &&
        originalUrl.pathname === redirectUrl.pathname &&
        originalUrl.search === redirectUrl.search &&
        (redirectUrl.hostname === 'www.' + originalUrl.hostname ||
         originalUrl.hostname === 'www.' + redirectUrl.hostname)
      
      if (!isSameHostHttpsUpgrade && !isWwwSubdomainAddition) {
        return toFail('リダイレクトが検出されました。リダイレクト先のURLは許可されていません。')
      }
      
      // Follow the redirect (maximum 1 redirect)
      res = await fetch(redirectUrl.toString(), { signal: controller.signal, headers: { 'User-Agent': USER_AGENT }, redirect: 'manual' })
      // Check if 2nd fetch also resulted in a redirect (not allowed)
      if (res.status >= 300 && res.status < 400) {
        return toFail('複数回のリダイレクトは許可されていません。')
      }
    }
    
    if (!res.ok) return toFail(`URL取得に失敗しました (status: ${res.status}).`)
    
    // Check content length if header is present
    const contentLengthHeader = res.headers.get('Content-Length')
    if (contentLengthHeader) {
      const parsedContentLength = parseInt(contentLengthHeader, 10)
      if (!isNaN(parsedContentLength) && parsedContentLength > MAX_CONTENT_LENGTH) {
        return toFail('コンテンツのサイズが大きすぎます。')
      }
    }

    const html = await res.text()
    if (!html || html.trim().length === 0) return toFail('HTMLを取得できませんでした。')

    let JSdom: any
    try {
      JSdom = await getJSDOM()
    } catch (err: any) {
      return toFail('HTMLパーサーの初期化に失敗しました。テキストを直接入力してください。')
    }
    
    const dom = new JSdom(html, { url })
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
    const isDebug = process.env.DEBUG_LLM === 'true'
    if (isDebug) {
      console.error('[DEBUG] Extraction error:', err)
    }
    if (err?.name === 'AbortError') return toFail('10秒以内にコンテンツを取得できませんでした。')
    return toFail('本文取得中にエラーが発生しました。')
  } finally {
    clearTimeout(timeout)
  }
}

export default extractArticleContent
