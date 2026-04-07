import { get, del, patch } from './client'

const API_BASE = import.meta.env.VITE_API_URL || ''

export interface Upload {
  id: string
  filename: string
  originalName: string
  contentType: string
  sizeBytes: number
  width: number | null
  height: number | null
  purpose: 'reference' | 'asset'
  createdAt: string
}

export interface UploadResponse extends Upload {}

export interface UploadsListResponse {
  uploads: Upload[]
  bytesUsed: number
}

/**
 * Upload an image file. Uses native fetch for multipart/form-data
 * (our api client helper doesn't handle FormData).
 */
export async function uploadFile(
  file: File,
  purpose: 'reference' | 'asset' = 'asset'
): Promise<UploadResponse> {
  const form = new FormData()
  form.append('file', file)
  form.append('purpose', purpose)

  const res = await fetch(`${API_BASE}/api/uploads`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Upload failed (${res.status})`)
  }

  return res.json()
}

/**
 * List the current user's uploads.
 */
export async function listUploads(purpose?: 'reference' | 'asset'): Promise<UploadsListResponse> {
  const qs = purpose ? `?purpose=${purpose}` : ''
  return get<UploadsListResponse>(`/api/uploads${qs}`)
}

/**
 * Update the purpose of an upload (toggle between reference and asset).
 */
export async function updateUploadPurpose(
  id: string,
  purpose: 'reference' | 'asset'
): Promise<{ ok: boolean }> {
  return patch<{ ok: boolean }>(`/api/uploads/${id}`, { purpose })
}

/**
 * Delete an upload.
 */
export async function deleteUpload(id: string): Promise<{ ok: boolean }> {
  return del<{ ok: boolean }>(`/api/uploads/${id}`)
}

/**
 * Get the thumbnail URL for an upload.
 */
export function getThumbnailUrl(id: string): string {
  return `${API_BASE}/api/uploads/${id}/thumbnail`
}
