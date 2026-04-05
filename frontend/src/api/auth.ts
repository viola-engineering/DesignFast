import { post, get } from './client'
import type { User } from '@/stores/auth'

interface AuthResponse {
  user: User
}

interface LogoutResponse {
  ok: boolean
}

export async function register(
  email: string,
  password: string,
  name?: string
): Promise<AuthResponse> {
  return post<AuthResponse>('/api/auth/register', { email, password, name })
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return post<AuthResponse>('/api/auth/login', { email, password })
}

export async function logout(): Promise<LogoutResponse> {
  return post<LogoutResponse>('/api/auth/logout')
}

export async function getMe(): Promise<AuthResponse> {
  return get<AuthResponse>('/api/auth/me')
}
