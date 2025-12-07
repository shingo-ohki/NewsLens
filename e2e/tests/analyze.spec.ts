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
    // Intercept POST /api/result to return a deterministic id
    await page.route('**/api/result', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result_id: 'test-123' }),
      })
    })

    // Intercept GET /api/result/test-123 to return the sample result JSON
    await page.route('**/api/result/test-123', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: SAMPLE_RESULT }),
      })
    })

    // Intercept navigation to /r/test-123 (SSR would fetch from server). Return a small HTML page
    // to simulate the final user experience without requiring a Supabase instance.
    await page.route('**/r/test-123**', (route) => {
      const html = `<html><head><title>Result test-123</title></head><body><h1>NewsLens Result — test-123</h1><section><h2>Summary</h2><p><strong>100:</strong> 要点（短）</p></section></body></html>`
      route.fulfill({ status: 200, contentType: 'text/html', body: html })
    })

    // Handle alert dialog for saving
    const dialogs: string[] = []
    page.on('dialog', async (dialog) => {
      dialogs.push(dialog.message())
      await dialog.accept()
    })

    await page.goto('/')
    // Switch to text input mode
    await page.locator('button', { hasText: 'テキスト直接入力' }).click()
    // Ensure textarea is available
    const textarea = page.locator('textarea')
    await expect(textarea).toBeVisible()
    await textarea.fill(ARTICLE_TEXT)
    await page.locator('button', { hasText: 'Analyze' }).click()

    // Wait for validated result section (client side)
    const validatedSection = page.locator('section', { hasText: 'Validated Result' })
    await expect(validatedSection).toBeVisible()
    await expect(validatedSection.locator('text=要点（短）')).toBeVisible()

    // Click save which triggers POST /api/result; our route intercept returns result_id
    await page.locator('button', { hasText: 'Save result' }).click()

    // Wait for redirect to /r/test-123
    await page.waitForURL('**/r/test-123')

    // Now the page should fetch the mocked GET /api/result/test-123 and render the result
    await expect(page.locator('h1')).toContainText('test-123')
    const resultSummary = page.locator('section', { hasText: 'Summary' })
    await expect(resultSummary).toBeVisible()
    await expect(resultSummary.locator('text=100:')).toBeVisible()

    // Confirm that an alert dialog was shown with the test id
    expect(dialogs.some((d) => d.includes('test-123'))).toBeTruthy()
  })
})
