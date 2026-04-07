/**
 * API client wrapper with credentials: 'include' for cookie auth
 */

const API_BASE = import.meta.env.VITE_API_URL || ''

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function api<T>(
  path: string,
  options?: RequestInit & { skipContentType?: boolean }
): Promise<T> {
  const { skipContentType, ...fetchOptions } = options || {}

  const headers: Record<string, string> = {}

  // Copy existing headers
  if (fetchOptions.headers) {
    if (fetchOptions.headers instanceof Headers) {
      fetchOptions.headers.forEach((value, key) => {
        headers[key] = value
      })
    } else if (Array.isArray(fetchOptions.headers)) {
      fetchOptions.headers.forEach(([key, value]) => {
        headers[key] = value
      })
    } else {
      Object.assign(headers, fetchOptions.headers)
    }
  }

  // Add Content-Type for non-GET requests that have a body
  if (!skipContentType && fetchOptions.method && fetchOptions.method !== 'GET' && fetchOptions.body) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    credentials: 'include',
    headers
  })

  // Handle non-JSON responses (like downloads)
  const contentType = response.headers.get('content-type')
  if (contentType && !contentType.includes('application/json')) {
    if (!response.ok) {
      throw new ApiError('Request failed', response.status)
    }
    return response as unknown as T
  }

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(data.error || 'Request failed', response.status, data)
  }

  return data as T
}

export function get<T>(path: string): Promise<T> {
  return api<T>(path, { method: 'GET' })
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return api<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined
  })
}

export function patch<T>(path: string, body?: unknown): Promise<T> {
  return api<T>(path, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined
  })
}

export function del<T>(path: string): Promise<T> {
  return api<T>(path, { method: 'DELETE' })
}
