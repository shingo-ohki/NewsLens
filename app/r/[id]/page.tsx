import React from 'react'
import ResultRenderer from '../../../components/ResultRenderer'

type Props = { params: { id: string } }

export default async function ResultPage({ params }: Props) {
  // Nextjs params may be a Promise; unwrap before use
  const { id } = await params as { id: string }
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/result/${id}`, { cache: 'no-store' })
  if (!res.ok) {
    return <div>Result not found</div>
  }
  const data = await res.json()
  const result = data.result
  return (
    <main style={{ padding: 20 }}>
      <h1>NewsLens Result — {id}</h1>
      <ResultRenderer result={result} />
    </main>
  )
}
