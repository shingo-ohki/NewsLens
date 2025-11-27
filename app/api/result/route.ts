import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { nanoid } from 'nanoid'
import type { NewsLensResult } from '../../../lib/types/NewsLensResult'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { result, version_id, schema_version } = body
    if (!result) return NextResponse.json({ error: 'result is required' }, { status: 400 })

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase environment not configured' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const result_id = nanoid(10)
    const payload = {
      result_id,
      json_result: result,
      version_id: version_id ?? null,
      schema_version: schema_version ?? null,
      model: 'gpt-4o-mini',
    }
    const { data, error } = await supabase.from('analysis_result').insert(payload).select().single()
    if (error) {
      console.error('Supabase insert error', error)
      return NextResponse.json({ error: 'DB insert failed' }, { status: 500 })
    }
    return NextResponse.json({ result_id })
  } catch (err: any) {
    console.error('result POST error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export default POST
