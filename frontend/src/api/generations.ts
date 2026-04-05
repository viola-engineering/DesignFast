import { get, post, del } from './client'

export type GenerationMode = 'landing' | 'webapp'
export type ThemeMode = 'explicit' | 'auto' | 'synth' | 'freestyle'
export type GenerationStatus = 'running' | 'done' | 'failed'
export type JobStatus = 'queued' | 'running' | 'done' | 'failed'

export interface CreateGenerationRequest {
  prompt: string
  mode?: GenerationMode
  themeMode?: ThemeMode
  styles?: string[]
  versions?: number
  models: ('claude' | 'gemini')[]
  fromJobId?: string
}

export interface JobSummary {
  id: string
  styleKey: string
  styleName: string
  model: string
  version: number
  status: JobStatus
}

export interface CreateGenerationResponse {
  id: string
  status: GenerationStatus
  jobs: JobSummary[]
}

export interface GenerationListItem {
  id: string
  prompt: string
  mode: GenerationMode
  themeMode: ThemeMode
  status: GenerationStatus
  jobCount: number
  jobsDone: number
  jobsFailed: number
  createdAt: string
  completedAt: string | null
}

export interface ListGenerationsResponse {
  generations: GenerationListItem[]
  total: number
}

export interface JobDetail {
  id: string
  styleKey: string
  styleName: string
  model: string
  provider: string
  version: number
  status: JobStatus
  tokensIn: number
  tokensOut: number
  costUsd: string
  durationMs: number
  createdAt: string
  completedAt: string | null
}

export interface GenerationDetail {
  id: string
  prompt: string
  mode: GenerationMode
  themeMode: ThemeMode
  autoSelected: string[] | null
  synthBrief: string | null
  status: GenerationStatus
  jobCount: number
  jobsDone: number
  jobsFailed: number
  totalTokensIn: number
  totalTokensOut: number
  totalCostUsd: string
  createdAt: string
  completedAt: string | null
  jobs: JobDetail[]
}

export async function create(
  data: CreateGenerationRequest
): Promise<CreateGenerationResponse> {
  return post<CreateGenerationResponse>('/api/generations', data)
}

export async function list(
  limit = 20,
  offset = 0
): Promise<ListGenerationsResponse> {
  return get<ListGenerationsResponse>(
    `/api/generations?limit=${limit}&offset=${offset}`
  )
}

export async function getById(id: string): Promise<GenerationDetail> {
  return get<GenerationDetail>(`/api/generations/${id}`)
}

export async function deleteById(id: string): Promise<{ ok: boolean }> {
  return del<{ ok: boolean }>(`/api/generations/${id}`)
}
