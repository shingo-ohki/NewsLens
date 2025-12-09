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
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">NewsLens — Analyze</h1>
        
        {/* Tab UI for input mode */}
        <div className="flex border-b border-gray-200 mb-6">
          <button 
            onClick={() => setInputMode('url')} 
            className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
              inputMode === 'url' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            aria-pressed={inputMode === 'url'}
          >
            URLから抽出
          </button>
          <button 
            onClick={() => setInputMode('text')} 
            className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
              inputMode === 'text' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            aria-pressed={inputMode === 'text'}
          >
            テキスト直接入力
          </button>
        </div>

        {/* Input fields */}
        {inputMode === 'url' ? (
          <div className="mb-4">
            <input
              type="url"
              placeholder="https://example.com/article"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ) : (
          <div className="mb-4">
            <textarea
              rows={10}
              placeholder="Paste article text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Analyze button */}
        <div className="mb-8">
          <button 
            onClick={handleAnalyze} 
            disabled={inputMode === 'url' ? !urlInput.trim() : !inputText.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analyze
          </button>
        </div>

        {/* Raw LLM Output */}
        {rawOutput && (
          <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Raw LLM Output</h2>
            <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded text-sm text-gray-700 overflow-x-auto">{rawOutput}</pre>
          </section>
        )}

        {/* Warnings */}
        {validated && warnings.length > 0 && (
          <section className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Warnings</h3>
            <ul className="list-disc pl-5 space-y-1 text-yellow-700">
              {warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </section>
        )}

        {/* Validated Result */}
        {validated && result && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Validated Result</h2>
              <button 
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-md transition"
              >
                Save result
              </button>
            </div>
            <ResultRenderer result={result} />
          </section>
        )}

        {/* Errors */}
        {!validated && errors.length > 0 && (
          <section className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Errors</h2>
            <ul className="list-disc pl-5 space-y-1 text-red-700">
              {errors.map((e: any, i: number) => <li key={i}>{JSON.stringify(e)}</li>)}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}
