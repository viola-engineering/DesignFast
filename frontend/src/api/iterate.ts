import { get, post } from './client'

export type SessionStatus = 'active' | 'closed' | 'failed'

export interface StartSessionResponse {
  sessionId: string
  jobId: string
  model: string
  status: 'initializing'
}

export interface SendMessageResponse {
  messageId: string
  status: 'processing'
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
  createdAt: string
  messages: SessionMessage[]
}

export interface IterateEvent {
  type: 'status' | 'ready' | 'done' | 'error' | 'text'
  sessionId?: string
  status?: string
  message?: string
  text?: string
  revision?: number
  content?: string
  filesChanged?: string[]
}

/**
 * Start an iterate session on a completed job.
 * Optionally include the first refinement message so init + first edit
 * happen in a single queued task.
 *
 * No model parameter → backend defaults to the job's original model.
 */
export async function startSession(
  jobId: string,
  options?: { model?: 'claude' | 'gemini'; message?: string; uploadIds?: string[] }
): Promise<StartSessionResponse> {
  const body: Record<string, unknown> = {}
  if (options?.model) body.model = options.model
  if (options?.message) body.message = options.message
  if (options?.uploadIds?.length) body.uploadIds = options.uploadIds
  return post<StartSessionResponse>(`/api/iterate/${jobId}/start`, body)
}

/**
 * Send a refinement message to an active session.
 * Returns immediately — progress via SSE events.
 */
export async function sendMessage(
  sessionId: string,
  message: string,
  uploadIds?: string[]
): Promise<SendMessageResponse> {
  const body: Record<string, unknown> = { message }
  if (uploadIds?.length) body.uploadIds = uploadIds
  return post<SendMessageResponse>(`/api/iterate/${sessionId}/send`, body)
}

/**
 * Connect to SSE events for an iterate session.
 * Returns an EventSource. Caller should handle `onmessage` and cleanup.
 */
export function connectEvents(sessionId: string): EventSource {
  return new EventSource(`/api/iterate/${sessionId}/events`)
}

/**
 * Close an iterate session and clean up resources.
 */
export async function closeSession(
  sessionId: string
): Promise<{ ok: boolean }> {
  return post<{ ok: boolean }>(`/api/iterate/${sessionId}/close`)
}

/**
 * Get session with message history.
 */
export async function getSession(sessionId: string): Promise<SessionDetail> {
  return get<SessionDetail>(`/api/iterate/${sessionId}`)
}
