import { get, post, patch, del } from './client'
import type { User } from '@/stores/auth'

interface AccountResponse {
  user: User
}

interface ApiKeyResponse {
  provider: string
  createdAt: string
}

export type ApiKeyProvider = 'anthropic' | 'google'

export async function getAccount(): Promise<AccountResponse> {
  return get<AccountResponse>('/api/account')
}

export async function updateAccount(data: {
  name?: string
}): Promise<AccountResponse> {
  return patch<AccountResponse>('/api/account', data)
}

export async function saveApiKey(
  provider: ApiKeyProvider,
  key: string
): Promise<ApiKeyResponse> {
  return post<ApiKeyResponse>('/api/account/api-keys', { provider, key })
}

export async function deleteApiKey(
  provider: ApiKeyProvider
): Promise<{ ok: boolean }> {
  return del<{ ok: boolean }>(`/api/account/api-keys/${provider}`)
}
