import { NextResponse } from 'next/server'
import analyzeWithLLM from '../../../lib/llm'
import extractJSONFromRaw from '../../../lib/validators/parseJSONFromRaw'
import { safeParseNewsLensResult, flattenZodErrors } from '../../../lib/validators/newsLensSchema'
import { buildCorrectionPrompt } from '../../../lib/llm/prompt'
import extractArticleContent from '../../../lib/extraction/extractor'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { inputText, url } = body
    if (inputText && url) {
      return NextResponse.json({ error: 'Specify either url or inputText, not both.' }, { status: 400 })
    }
    if (url !== undefined && (typeof url !== 'string' || url.trim().length === 0)) {
      return NextResponse.json({ error: 'url must be a non-empty string' }, { status: 400 })
    }
    if (inputText !== undefined && (typeof inputText !== 'string' || inputText.trim().length === 0)) {
      return NextResponse.json({ error: 'inputText must be a non-empty string' }, { status: 400 })
    }

    let textForAnalysis: string | undefined
    let warnings: string[] = []

    if (url) {
      const extraction = await extractArticleContent(url)
      if (extraction.status === 'fail') {
        return NextResponse.json({ error: 'Extraction failed. Please paste article text manually.', warnings: extraction.warnings }, { status: 400 })
      }
      textForAnalysis = extraction.content
      warnings = extraction.warnings ?? []
    } else if (inputText && typeof inputText === 'string' && inputText.trim().length > 0) {
      textForAnalysis = inputText
    } else {
      return NextResponse.json({ error: 'Either url or inputText is required' }, { status: 400 })
    }

    const llmResp = await analyzeWithLLM(textForAnalysis, { mock: process.env.USE_MOCK_LLM === 'true' })
    const rawOutput = llmResp.raw
    
    const isDebug = process.env.DEBUG_LLM === 'true'
    if (isDebug) {
      console.log('[DEBUG] LLM raw output length:', rawOutput.length)
      if (llmResp.fixtureId) {
        console.log('[DEBUG] Fixture saved:', llmResp.fixtureId)
      }
    }

    // Extract JSON
    let parsed: unknown
    try {
      parsed = extractJSONFromRaw(rawOutput)
      const parsedObj = parsed as any
      
      // 抽出されたオブジェクトが配列でないことを確認
      if (Array.isArray(parsedObj)) {
        throw new Error('抽出されたJSONはオブジェクトである必要があります（配列は不可）')
      }
      
      // 必要なキーが存在することを確認
      const requiredKeys = ['summary', 'key_points', 'actors', 'issues', 'stances', 'causal_map', 'underlying_values', 'uncertainties']
      const missingKeys = requiredKeys.filter(k => !(k in parsedObj))
      if (missingKeys.length > 0) {
        throw new Error(`必須キーが不足しています: ${missingKeys.join(', ')}`)
      }
      
      if (isDebug) {
        console.log('[DEBUG] Parsed JSON keys:', Object.keys(parsedObj).join(', '))
      }
    } catch (e: any) {
      if (isDebug) {
        console.error('[DEBUG] JSON extraction error:', e.message)
      }
      return NextResponse.json({ validated: false, errors: ['JSONを抽出できませんでした: ' + e.message], rawOutput, warnings }, { status: 400 })
    }

    // Validate using zod
    const safe = safeParseNewsLensResult(parsed)
    if (safe.success) {
      if (isDebug) {
        console.log('[DEBUG] Validation succeeded')
      }
      const isUsingMockLLM = process.env.USE_MOCK_LLM === 'true'
      return NextResponse.json({ validated: true, result: safe.data, rawOutput, model: 'gpt-4o-mini', isUsingMockLLM, warnings })
    }

    // Correction flow: attempt one retry with corrective instruction
    const errors = flattenZodErrors(safe.error)
    if (isDebug) {
      console.log('[DEBUG] Initial validation errors:', JSON.stringify(errors, null, 2))
    }
    try {
      const correctionPrompt = buildCorrectionPrompt(rawOutput, textForAnalysis)
      const retry = await analyzeWithLLM(textForAnalysis, { mock: process.env.USE_MOCK_LLM === 'true', promptOverride: correctionPrompt })
      const retryParsed = extractJSONFromRaw(retry.raw)
      const retrySafe = safeParseNewsLensResult(retryParsed)
      if (retrySafe.success) {
        if (isDebug) {
          console.log('[DEBUG] Retry validation succeeded')
        }
        const isUsingMockLLM = process.env.USE_MOCK_LLM === 'true'
        return NextResponse.json({ validated: true, result: retrySafe.data, rawOutput: retry.raw, model: 'gpt-4o-mini', isUsingMockLLM, warnings })
      }
      const retryErrors = flattenZodErrors(retrySafe.error)
      if (isDebug) {
        console.log('[DEBUG] Retry validation errors:', JSON.stringify(retryErrors, null, 2))
      }
      return NextResponse.json({ validated: false, errors: [...errors, ...retryErrors], rawOutput: retry.raw, warnings }, { status: 400 })
    } catch (e: any) {
      // If correction throws or fails, return original errors
      if (isDebug) {
        console.log('[DEBUG] Correction flow error:', e.message)
      }
      return NextResponse.json({ validated: false, errors, rawOutput, warnings }, { status: 400 })
    }
  } catch (err: any) {
    console.error('analyze error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Exported as named method only per Next.js App Router requirements
