"use client"
import React, { useState } from 'react'
import ResultRenderer from '../components/ResultRenderer'
import type { NewsLensResult } from '../lib/types/NewsLensResult'

export default function HomePage() {
  const [inputText, setInputText] = useState('')
  const [rawOutput, setRawOutput] = useState<string | null>(null)
  const [validated, setValidated] = useState(false)
  const [result, setResult] = useState<NewsLensResult | null>(null)
  const [errors, setErrors] = useState<any[]>([])

  async function handleAnalyze() {
    setRawOutput(null)
    setValidated(false)
    setResult(null)
    setErrors([])

    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputText }),
    })
    const data = await res.json()
    if (res.ok && data.validated) {
      setRawOutput(data.rawOutput ?? null)
      setValidated(true)
      setResult(data.result)
    } else {
      setRawOutput(data.rawOutput ?? null)
      setValidated(false)
      setErrors(data.errors ?? data.error ? [data.error] : [])
    }
  }

  async function handleSave() {
    if (!result) return
    const res = await fetch('/api/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result }),
    })
    const data = await res.json()
    if (res.ok && data.result_id) {
      alert(`Saved as result: ${data.result_id}`)
      // Optionally redirect to /r/:id
      window.location.href = `/r/${data.result_id}`
    } else {
      alert('Error saving result: ' + (data.error ?? 'unknown'))
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>NewsLens — Analyze</h1>
      <div>
        <textarea
          rows={10}
          cols={80}
          placeholder="Paste article text here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={handleAnalyze} disabled={!inputText.trim()}>Analyze</button>
      </div>

      {rawOutput && (
        <section style={{ marginTop: 20 }}>
          <h2>Raw LLM Output</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 12 }}>{rawOutput}</pre>
        </section>
      )}

      {validated && result && (
        <section style={{ marginTop: 20 }}>
          <h2>Validated Result</h2>
          <div style={{ marginBottom: 8 }}>
            <button onClick={handleSave}>Save result</button>
          </div>
          <ResultRenderer result={result} />
        </section>
      )}

      {!validated && errors.length > 0 && (
        <section style={{ marginTop: 20 }}>
          <h2>Errors</h2>
          <ul>
            {errors.map((e: any, i: number) => <li key={i}>{JSON.stringify(e)}</li>)}
          </ul>
        </section>
      )}
    </main>
  )
}
