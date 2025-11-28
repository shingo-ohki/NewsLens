import { NextResponse } from 'next/server'
import analyzeWithLLM from '../../../lib/llm'
import extractJSONFromRaw from '../../../lib/validators/parseJSONFromRaw'
import { safeParseNewsLensResult, flattenZodErrors } from '../../../lib/validators/newsLensSchema'
import { buildCorrectionPrompt } from '../../../lib/llm/prompt'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { inputText } = body
    if (!inputText || typeof inputText !== 'string' || inputText.trim().length === 0) {
      return NextResponse.json({ error: 'inputText is required' }, { status: 400 })
    }

    const llmResp = await analyzeWithLLM(inputText, { mock: process.env.USE_MOCK_LLM === 'true' })
    const rawOutput = llmResp.raw

    // Extract JSON
    let parsed: unknown
    try {
      parsed = extractJSONFromRaw(rawOutput)
    } catch (e: any) {
      return NextResponse.json({ validated: false, errors: ['Could not extract JSON from LLM output'], rawOutput }, { status: 400 })
    }

    // Validate using zod
    const safe = safeParseNewsLensResult(parsed)
    if (safe.success) {
      return NextResponse.json({ validated: true, result: safe.data, rawOutput, model: 'gpt-4o-mini' })
    }

    // Correction flow: attempt one retry with corrective instruction
    const errors = flattenZodErrors(safe.error)
    try {
      const correctionPrompt = buildCorrectionPrompt(rawOutput, inputText)
      const retry = await analyzeWithLLM(inputText, { mock: process.env.USE_MOCK_LLM === 'true', promptOverride: correctionPrompt })
      const retryParsed = extractJSONFromRaw(retry.raw)
      const retrySafe = safeParseNewsLensResult(retryParsed)
      if (retrySafe.success) {
        return NextResponse.json({ validated: true, result: retrySafe.data, rawOutput: retry.raw, model: 'gpt-4o-mini' })
      }
      const retryErrors = flattenZodErrors(retrySafe.error)
      return NextResponse.json({ validated: false, errors: [...errors, ...retryErrors], rawOutput: retry.raw }, { status: 400 })
    } catch (e: any) {
      // If correction throws or fails, return original errors
      return NextResponse.json({ validated: false, errors, rawOutput }, { status: 400 })
    }
  } catch (err: any) {
    console.error('analyze error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Exported as named method only per Next.js App Router requirements
