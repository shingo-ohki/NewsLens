import mockLLMAnalyzeResponse from './mock'
import { OpenAI } from 'openai'
import { buildAnalyzePrompt } from './prompt'
import { saveLLMFixture } from './testFixtures/saveFixture'

export type LLMResponse = { raw: string; fixtureId?: string }

export async function analyzeWithLLM(inputText: string, options?: { mock?: boolean, promptOverride?: string }): Promise<LLMResponse> {
  const useMock = options?.mock ?? process.env.USE_MOCK_LLM === 'true'
  if (useMock) {
    return { raw: mockLLMAnalyzeResponse(true) }
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')

  const client = new OpenAI({ apiKey })
  const prompt = options?.promptOverride ?? buildAnalyzePrompt(inputText)
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4000,  // 日本語は複数トークン必要なため大幅増加
  })
  const raw = response.choices?.[0]?.message?.content ?? ''
  
  // 実APIレスポンスをテスト用フィクスチャとして保存（開発環境のみ）
  const fixtureId = process.env.SAVE_LLM_FIXTURES === 'true' 
    ? saveLLMFixture(inputText, raw, 'gpt-4o-mini')
    : undefined

  return { raw, fixtureId }
}

export default analyzeWithLLM
