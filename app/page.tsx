"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '../components/Logo'
import type { NewsLensResult } from '../lib/types/NewsLensResult'

export default function HomePage() {
  const router = useRouter()
  const [inputText, setInputText] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze() {
    setError(null)
    setIsLoading(true)

    try {
      const payload = inputMode === 'url' ? { url: urlInput } : { inputText }
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok || !data.validated) {
        setError(data.error ?? 'Analysis failed')
        setIsLoading(false)
        return
      }

      const result: NewsLensResult = data.result
      
      // Save result and redirect
      const saveRes = await fetch('/api/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
      })
      const saveData = await saveRes.json()

      if (saveRes.ok && saveData.result_id) {
        router.push(`/r/${saveData.result_id}`)
      } else {
        setError('Failed to save result')
        setIsLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Fixed Header - positioned at 25% from top */}
      <div className="flex flex-col items-center pt-[25vh]">
        <div className="w-full max-w-2xl px-4">
          {/* Logo */}
          <div className="flex justify-center items-center mb-6 h-[54px]">
            <Logo variant="horizontal" size="lg" className="scale-150" />
          </div>

          {/* Subtitle */}
          <div className="text-center text-gray-500 text-sm mb-12 h-6 flex items-center justify-center">
            ニュースを構造化して理解する
          </div>

          {/* Input Tabs */}
          <div className="flex justify-center border-b border-gray-200 mb-6 h-12">
            <button 
              onClick={() => { setInputMode('url'); setError(null); }} 
              className={`px-6 py-2 font-medium text-sm border-b-2 transition flex items-center ${
                inputMode === 'url' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              aria-pressed={inputMode === 'url'}
            >
              URLから抽出
            </button>
            <button 
              onClick={() => { setInputMode('text'); setError(null); }} 
              className={`px-6 py-2 font-medium text-sm border-b-2 transition flex items-center ${
                inputMode === 'text' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              aria-pressed={inputMode === 'text'}
            >
              テキスト直接入力
            </button>
          </div>
        </div>
      </div>

      {/* Content - expands based on input */}
      <div className="flex justify-center pb-8">
        <div className="w-full max-w-2xl px-4">
          {/* Input Field */}
          <div className="mb-6">
            {inputMode === 'url' ? (
              <input
                type="url"
                placeholder="https://example.com/article"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            ) : (
              <textarea
                rows={6}
                placeholder="記事のテキストをここに貼り付けてください"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            )}
          </div>

          {/* Analyze Button */}
          <div className="flex justify-center mb-4">
            <button 
              onClick={handleAnalyze} 
              disabled={isLoading || (inputMode === 'url' ? !urlInput.trim() : !inputText.trim())}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-12 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '分析中...' : '分析する'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
