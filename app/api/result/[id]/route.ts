import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params for Next.js 16 compatibility
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase environment not configured' }, { status: 500 })
    }
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase.from('analysis_result').select('json_result').eq('result_id', id).single()
    if (error) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }
    return NextResponse.json({ result: data.json_result })
  } catch (err: any) {
    console.error('result GET error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Exported as named method only per Next.js App Router requirements
