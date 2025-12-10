import React from 'react'
import ResultRenderer from '../../../components/ResultRenderer'
import { Logo } from '../../../components/Logo'

type Props = { params: { id: string } }

export default async function ResultPage({ params }: Props) {
  // Nextjs params may be a Promise; unwrap before use
  const { id } = await params as { id: string }
  
  // Construct absolute URL for Server Component fetch
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  
  const res = await fetch(`${baseUrl}/api/result/${id}`, { cache: 'no-store' })
  if (!res.ok) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Result not found</h1>
          <p className="text-gray-600">指定された結果が見つかりませんでした</p>
        </div>
      </div>
    )
  }
  const data = await res.json()
  const result = data.result
  
  // Generate share URL (use NEXT_PUBLIC_BASE_URL for client-side access)
  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || baseUrl}/r/${id}`
  
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Logo variant="icon" size="sm" opacity={0.6} />
            <h1 className="text-3xl font-bold text-gray-900">解析結果</h1>
          </div>
          
          {/* Share buttons */}
          <div className="flex gap-3 mb-6">
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('NewsLensで記事を分析しました')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition text-sm font-medium text-gray-700"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X (Twitter)
            </a>
            <a
              href={`https://www.facebook.com/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition text-sm font-medium text-gray-700"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
              Facebook
            </a>
            <a
              href={`https://line.me/R/msg/text/?${encodeURIComponent(`NewsLensで記事を分析しました ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition text-sm font-medium text-gray-700"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              LINE
            </a>
          </div>
        </div>
        
        <ResultRenderer result={result} />
        
        {/* Footer signature */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col items-center gap-2 text-center">
            <Logo variant="horizontal" size="sm" opacity={0.4} />
            <p className="text-xs text-gray-400">ニュースを、考えられる形に。</p>
          </div>
        </footer>
      </div>
    </main>
  )
}
