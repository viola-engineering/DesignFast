import { get } from './client'
import type { JobStatus } from './generations'

export interface JobDetail {
  id: string
  generationId: string
  styleKey: string
  styleName: string
  model: string
  provider: string
  version: number
  status: JobStatus
  errorMessage: string | null
  tokensIn: number
  tokensOut: number
  costUsd: string
  durationMs: number
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  latestRevision: number
}

export interface JobFile {
  id: string
  filename: string
  sizeBytes: number
  createdAt: string
}

export interface JobFilesResponse {
  files: JobFile[]
}

export async function getById(id: string): Promise<JobDetail> {
  return get<JobDetail>(`/api/jobs/${id}`)
}

export async function getFiles(id: string): Promise<JobFilesResponse> {
  return get<JobFilesResponse>(`/api/jobs/${id}/files`)
}

export function getDownloadUrl(id: string): string {
  return `/api/jobs/${id}/download`
}

export function getPreviewUrl(jobId: string, filename = 'index.html', revision?: number): string {
  const base = `/preview/${jobId}/${filename}`
  return revision !== undefined ? `${base}?revision=${revision}` : base
}
