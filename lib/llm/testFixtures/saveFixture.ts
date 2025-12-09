import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export interface LLMFixture {
  timestamp: string
  inputHash: string
  rawOutput: string
  model: string
}

/**
 * LLM APIレスポンスをテスト用フィクスチャとして保存
 * 開発環境でのみ実行し、API費用削減に利用
 * 常に testFixture.json に上書き保存（最新のみ保持）
 */
export function saveLLMFixture(
  inputText: string,
  rawOutput: string,
  model: string = 'gpt-4o-mini'
): string {
  const fixtureFileName = 'testFixture.json'  // 常に同じファイル名に上書き

  const fixture: LLMFixture = {
    timestamp: new Date().toISOString(),
    inputHash: crypto
      .createHash('md5')
      .update(inputText)
      .digest('hex')
      .substring(0, 8),
    rawOutput,
    model,
  }

  // ファイルシステムが利用可能かチェック（サーバーサイドのみ）
  if (typeof window === 'undefined') {
    try {
      const fixtureDir = path.join(process.cwd(), 'lib', 'llm', 'testFixtures')
      if (!fs.existsSync(fixtureDir)) {
        fs.mkdirSync(fixtureDir, { recursive: true })
      }
      const filePath = path.join(fixtureDir, fixtureFileName)
      fs.writeFileSync(filePath, JSON.stringify(fixture, null, 2))
      console.log(`✅ Test fixture saved: ${fixtureFileName}`)
    } catch (err) {
      console.warn('⚠️ Could not save fixture:', err)
    }
  }

  return fixtureFileName
}

/**
 * テスト用フィクスチャから出力を読み込み
 */
export function loadLLMFixture(fixtureId: string = 'testFixture'): LLMFixture | null {
  if (typeof window !== 'undefined') {
    // クライアントサイドでは読み込まない
    return null
  }

  try {
    const fixtureDir = path.join(process.cwd(), 'lib', 'llm', 'testFixtures')
    const filePath = path.join(fixtureDir, `${fixtureId}.json`)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(content) as LLMFixture
    }
  } catch (err) {
    console.warn('⚠️ Could not load fixture:', err)
  }

  return null
}

export default { saveLLMFixture, loadLLMFixture }
