import { get } from './client'
import type { JobStatus } from './generations'

const API_BASE = import.meta.env.VITE_API_URL || ''

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
  return `${API_BASE}/api/jobs/${id}/download`
}

export function getPreviewUrl(jobId: string, filename = 'index.html', revision?: number): string {
  if (revision !== undefined && revision !== null) {
    return `/preview/${jobId}/r/${revision}/${filename}`
  }
  return `/preview/${jobId}/${filename}`
}
