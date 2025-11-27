import { z } from 'zod'
import type { NewsLensResult } from '../types/NewsLensResult'

const ActorType = z.enum(['individual', 'organization', 'region', 'institution', 'other'])
const StanceType = z.enum(['support', 'oppose', 'mixed', 'unclear', 'neutral', 'other'])

const summarySchema = z.object({ '100': z.string().min(1), '300': z.string().min(1), '600': z.string().min(1) })
const actorSchema = z.object({ name: z.string().min(1), type: ActorType, description: z.string() })
const stanceSchema = z.object({ actor: z.string().min(1), stance: z.string().min(1), stance_type: StanceType, evidence: z.string().min(1) })
const causalMapEntrySchema = z.object({ problem: z.string().min(1), causes: z.array(z.string()), mechanisms: z.array(z.string()), consequences: z.array(z.string()), notes: z.string() })

export const newsLensSchema = z.object({ summary: summarySchema, key_points: z.array(z.string().min(1)).min(3).max(15), actors: z.array(actorSchema), issues: z.array(z.string()), stances: z.array(stanceSchema), causal_map: z.array(causalMapEntrySchema), underlying_values: z.array(z.string()), uncertainties: z.array(z.string()) })

export type NewsLensResultFromZod = z.infer<typeof newsLensSchema>

export function safeParseNewsLensResult(input: unknown) { return newsLensSchema.safeParse(input) }
export function parseNewsLensResult(input: unknown): NewsLensResult { return newsLensSchema.parse(input) as NewsLensResult }
export function flattenZodErrors(err: z.ZodError) { return err.errors.map(e => ({ path: e.path, message: e.message })) }
export default newsLensSchema
