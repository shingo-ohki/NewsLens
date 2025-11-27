import React from 'react'
import type { NewsLensResult } from '../lib/types/NewsLensResult'

type Props = {
  result: NewsLensResult
}

export const ResultRenderer: React.FC<Props> = ({ result }) => {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <section>
        <h2>Summary</h2>
        <p><strong>100:</strong> {result.summary['100']}</p>
        <p><strong>300:</strong> {result.summary['300']}</p>
        <details>
          <summary><strong>600 (details)</strong></summary>
          <p>{result.summary['600']}</p>
        </details>
      </section>

      <section>
        <h3>Key Points</h3>
        <ul>
          {result.key_points.map((kp, i) => (
            <li key={i}>{kp}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Actors</h3>
        <ul>
          {result.actors.map((a, idx) => (
            <li key={idx}><strong>{a.name}</strong> ({a.type}) — {a.description}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Issues</h3>
        <ul>
          {result.issues.map((i, idx) => <li key={idx}>{i}</li>)}
        </ul>
      </section>

      <section>
        <h3>Stances</h3>
        <ul>
          {result.stances.map((s, idx) => (
            <li key={idx}><strong>{s.actor}</strong>: {s.stance} ({s.stance_type}) — {s.evidence}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Causal Map</h3>
        <ul>
          {result.causal_map.map((c, idx) => (
            <li key={idx}>
              <strong>{c.problem}</strong>
              <div>Causes: {c.causes.join(', ')}</div>
              <div>Mechanisms: {c.mechanisms.join(', ')}</div>
              <div>Consequences: {c.consequences.join(', ')}</div>
              <div>Notes: {c.notes}</div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Underlying Values</h3>
        <ul>
          {result.underlying_values.map((v, idx) => <li key={idx}>{v}</li>)}
        </ul>
      </section>

      <section>
        <h3>Uncertainties</h3>
        <ul>
          {result.uncertainties.map((u, idx) => <li key={idx}>{u}</li>)}
        </ul>
      </section>
    </div>
  )
}

export default ResultRenderer
