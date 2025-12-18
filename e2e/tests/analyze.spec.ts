import { test, expect } from '@playwright/test'

// Sample article text used by the mock LLM
const ARTICLE_TEXT = `これはテスト記事の見出しです。記事の本文の例として、ニュースを要約するための本文がここにあります。`;

const SAMPLE_RESULT = {
  summary: {
    '100': '要点（短）',
    '300': '要点（中）: 記事の主なポイントを中程度の長さで説明します。',
    '600': '要点（長）: 記事の詳細な説明や背景、影響を600文字程度で十分に説明します。',
  },
  key_points: ['要点1', '要点2', '要点3'],
  actors: [{ name: '政府', type: 'organization', description: '政府部門または機関' }],
  issues: ['Issue A'],
  stances: [{ actor: '政府', stance: '支援', stance_type: 'support', evidence: '記事の引用' }],
  causal_map: [
    { problem: '課題', causes: ['原因A'], mechanisms: ['仕組みA'], consequences: ['結果A'], notes: '' },
  ],
  underlying_values: ['公平性'],
  uncertainties: ['一次情報が不足している'],
}

test.describe('Analyze flow', () => {
  test('analyze -> save -> render result page', async ({ page }) => {
    // Intercept POST /api/analyze to return validated result
    await page.route('**/api/analyze', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          validated: true,
          result: SAMPLE_RESULT,
          rawOutput: '{"summary": {"100": "テスト", "300": "テスト中", "600": "テスト詳細"}}',
          warnings: [],
        }),
      })
    })

    // Intercept POST /api/result to return a deterministic id
    await page.route('**/api/result', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result_id: 'test-123' }),
      })
    })

    // Intercept navigation to /r/test-123.
    // App RouterのServer Componentはサーバー側で /api/result/:id をfetchするため、
    // Playwrightのpage.routeではそのサーバーfetchを直接モックできない。
    // Supabase無しで「遷移が発生した」ことを検証するため、/r/:id のHTMLをスタブする。
    await page.route('**/r/test-123**', (route) => {
      const html = `<html><head><meta charset="UTF-8" /><title>Result test-123</title></head><body><h1>解析結果</h1><p>stubbed result page (test-123)</p></body></html>`
      route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html })
    })

    // リクエスト検証用の待ち合わせ
    const analyzeRequestPromise = page.waitForRequest((req) => req.url().includes('/api/analyze') && req.method() === 'POST')
    const saveRequestPromise = page.waitForRequest((req) => req.url().includes('/api/result') && req.method() === 'POST')

    await page.goto('/')
    // Switch to text input mode
    await page.locator('button', { hasText: '文章を貼って分析する' }).click()
    // Ensure textarea is available
    const textarea = page.locator('textarea')
    await expect(textarea).toBeVisible()
    await textarea.fill(ARTICLE_TEXT)
    await page.getByRole('button', { name: '分析する', exact: true }).click()

    // /api/analyze のリクエストボディが inputText であること
    const analyzeReq = await analyzeRequestPromise
    const analyzeBody = analyzeReq.postDataJSON() as any
    expect(analyzeBody).toMatchObject({ inputText: ARTICLE_TEXT })

    // /api/result が呼ばれること（自動保存）
    const saveReq = await saveRequestPromise
    const saveBody = saveReq.postDataJSON() as any
    expect(saveBody).toHaveProperty('result')

    // Wait for redirect to /r/test-123
    await page.waitForURL('**/r/test-123')

    // 遷移先がロードされていること（スタブHTML）
    await expect(page.locator('h1')).toHaveText('解析結果')
  })
})
