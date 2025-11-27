#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const id = process.argv[2]

if (!url || !key) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in env')
  process.exit(1)
}
if (!id) {
  console.error('Usage: node scripts/queryResult.js <result_id>')
  process.exit(1)
}

const supabase = createClient(url, key)

async function main() {
  const { data, error } = await supabase.from('analysis_result').select('*').eq('result_id', id).single()
  if (error) {
    console.error('DB query error', error)
    process.exit(1)
  }
  console.log('Row:', JSON.stringify(data, null, 2))
}

main()
