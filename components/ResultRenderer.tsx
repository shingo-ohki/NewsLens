import React from 'react'
import type { NewsLensResult } from '../lib/types/NewsLensResult'

type Props = {
  result: NewsLensResult
}

const getStanceBadgeColor = (stanceType: string) => {
  switch (stanceType) {
    case 'support':
      return 'bg-green-100 text-green-800'
    case 'oppose':
      return 'bg-red-100 text-red-800'
    case 'mixed':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const ResultRenderer: React.FC<Props> = ({ result }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summary */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Summary</h2>
          <div className="space-y-3 text-gray-700">
            <p className="text-sm leading-relaxed">{result.summary['100']}</p>
            <p className="text-sm leading-relaxed">{result.summary['300']}</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
                詳細を表示
              </summary>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{result.summary['600']}</p>
            </details>
          </div>
        </section>

        {/* Issues */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Issues</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
            {result.issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </section>

        {/* Stances */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Stances</h2>
          <div className="space-y-4">
            {result.stances.map((s, idx) => (
              <div key={idx} className="border-l-4 border-blue-400 pl-4 bg-blue-50 rounded py-2">
                <div className="flex items-center gap-2 mb-1">
                  <strong className="text-gray-800 text-sm">{s.actor}</strong>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStanceBadgeColor(s.stance_type)}`} aria-label={`stance type: ${s.stance_type}`}>
                    {s.stance_type}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">{s.stance}</p>
                <p className="text-xs text-gray-600">{s.evidence}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Causal Map */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Causal Map</h2>
          <div className="space-y-4">
            {result.causal_map.map((c, idx) => (
              <div key={idx} className="text-sm">
                <strong className="text-gray-800 block mb-2">{c.problem}</strong>
                <div className="border-l-2 border-gray-300 pl-3 ml-2 space-y-1 text-gray-700">
                  <div><span className="text-gray-500">→ Causes:</span> {c.causes.join(', ')}</div>
                  <div><span className="text-gray-500">→ Mechanisms:</span> {c.mechanisms.join(', ')}</div>
                  <div><span className="text-gray-500">→ Consequences:</span> {c.consequences.join(', ')}</div>
                  {c.notes && <div className="text-xs text-gray-600 mt-2">Note: {c.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key Points - full width */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Key Points</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
            {result.key_points.map((kp, i) => (
              <li key={i}>{kp}</li>
            ))}
          </ul>
        </section>

        {/* Actors - full width */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Actors</h2>
          <div className="space-y-3">
            {result.actors.map((a, idx) => (
              <div key={idx} className="border-l-4 border-blue-300 pl-4 bg-blue-50 rounded py-2">
                <div className="flex items-center gap-2">
                  <strong className="text-gray-800 text-sm">{a.name}</strong>
                  <span className="text-xs text-gray-500">({a.type})</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{a.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Underlying Values - full width */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Underlying Values</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
            {result.underlying_values.map((v, idx) => (
              <li key={idx}>{v}</li>
            ))}
          </ul>
        </section>

        {/* Uncertainties - full width */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Uncertainties</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
            {result.uncertainties.map((u, idx) => (
              <li key={idx}>{u}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default ResultRenderer
