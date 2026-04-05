import { get, post } from './client'

export type SessionStatus = 'active' | 'closed'

export interface StartSessionResponse {
  sessionId: string
  jobId: string
  model: string
  status: SessionStatus
  files: string[]
}

export interface SendMessageResponse {
  role: 'assistant'
  content: string
  filesChanged: string[]
  revision: number
}

export interface SessionMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface SessionDetail {
  id: string
  jobId: string
  model: string
  status: SessionStatus
  tokensIn: number
  tokensOut: number
  costUsd: string
  createdAt: string
  messages: SessionMessage[]
}

/**
 * Start an iterate session on a completed job.
 * NOTE: Uses jobId in the URL, returns sessionId for subsequent calls.
 */
export async function startSession(
  jobId: string,
  model: 'claude' | 'gemini' = 'claude'
): Promise<StartSessionResponse> {
  return post<StartSessionResponse>(`/api/iterate/${jobId}/start`, { model })
}

/**
 * Send a refinement message to an active session.
 * NOTE: Uses sessionId (not jobId) from startSession response.
 */
export async function sendMessage(
  sessionId: string,
  message: string
): Promise<SendMessageResponse> {
  return post<SendMessageResponse>(`/api/iterate/${sessionId}/send`, { message })
}

/**
 * Close an iterate session and clean up resources.
 * NOTE: Uses sessionId (not jobId).
 */
export async function closeSession(
  sessionId: string
): Promise<{ ok: boolean }> {
  return post<{ ok: boolean }>(`/api/iterate/${sessionId}/close`)
}

/**
 * Get session with message history.
 * NOTE: Uses sessionId (not jobId).
 */
export async function getSession(sessionId: string): Promise<SessionDetail> {
  return get<SessionDetail>(`/api/iterate/${sessionId}`)
}
