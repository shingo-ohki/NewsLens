// Type definitions for NewsLens analysis result
export type ActorType = 'individual' | 'organization' | 'region' | 'institution' | 'other'

export type Actor = {
  name: string
  type: ActorType
  description: string
}

export type StanceType = 'support' | 'oppose' | 'mixed' | 'unclear' | 'neutral' | 'other'

export type Stance = {
  actor: string
  stance: string
  stance_type: StanceType
  evidence: string
}

export type CausalMapEntry = {
  problem: string
  causes: string[]
  mechanisms: string[]
  consequences: string[]
  notes: string
}

export type Summary = {
  '100': string
  '300': string
  '600': string
}

export type NewsLensResult = {
  summary: Summary
  key_points: string[]
  actors: Actor[]
  issues: string[]
  stances: Stance[]
  causal_map: CausalMapEntry[]
  underlying_values: string[]
  uncertainties: string[]
}

export default NewsLensResult
