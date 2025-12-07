"use client"
import React, { useState } from 'react'
import ResultRenderer from '../components/ResultRenderer'
import type { NewsLensResult } from '../lib/types/NewsLensResult'

export default function HomePage() {
  const [inputText, setInputText] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url')
  const [rawOutput, setRawOutput] = useState<string | null>(null)
  const [validated, setValidated] = useState(false)
  const [result, setResult] = useState<NewsLensResult | null>(null)
  const [errors, setErrors] = useState<any[]>([])
  const [warnings, setWarnings] = useState<string[]>([])

  async function handleAnalyze() {
    setRawOutput(null)
    setValidated(false)
    setResult(null)
    setErrors([])
    setWarnings([])

    const payload = inputMode === 'url' ? { url: urlInput } : { inputText }
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setWarnings(data.warnings ?? [])
    if (res.ok && data.validated) {
      setRawOutput(data.rawOutput ?? null)
      setValidated(true)
      setResult(data.result)
    } else {
      setRawOutput(data.rawOutput ?? null)
      setValidated(false)
      setErrors(data.errors ?? (data.error ? [data.error] : []))
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
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <button onClick={() => setInputMode('url')} disabled={inputMode === 'url'}>URLから抽出</button>
        <button onClick={() => setInputMode('text')} disabled={inputMode === 'text'}>テキスト直接入力</button>
      </div>

      {inputMode === 'url' ? (
        <div style={{ marginBottom: 8 }}>
          <input
            type="url"
            placeholder="https://example.com/article"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          />
        </div>
      ) : (
        <div>
          <textarea
            rows={10}
            cols={80}
            placeholder="Paste article text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>
      )}
      <div style={{ marginTop: 8 }}>
        <button onClick={handleAnalyze} disabled={inputMode === 'url' ? !urlInput.trim() : !inputText.trim()}>Analyze</button>
      </div>

      {rawOutput && (
        <section style={{ marginTop: 20 }}>
          <h2>Raw LLM Output</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 12 }}>{rawOutput}</pre>
        </section>
      )}

      {warnings.length > 0 && (
        <section style={{ marginTop: 16, background: '#fff9e6', padding: 12, border: '1px solid #f0e0b2' }}>
          <h3>Warnings</h3>
          <ul>
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
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
