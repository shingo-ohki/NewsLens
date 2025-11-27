import mockLLMAnalyzeResponse from './mock'
import { OpenAI } from 'openai'
import { buildAnalyzePrompt } from './prompt'

export type LLMResponse = { raw: string }

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
    max_tokens: 1200,
  })
  const raw = response.choices?.[0]?.message?.content ?? ''
  return { raw }
}

export default analyzeWithLLM
