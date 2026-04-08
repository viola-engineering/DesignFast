import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL || ''

export interface User {
  id: string
  email: string
  name: string | null
  plan: 'free' | 'pro'
  avatarUrl: string | null
  emailVerified: boolean
  generationsUsed: number
  generationsLimit: number
  creditsUsed: number
  creditsLimit: number
  byokGenerationsUsed: number
  byokGenerationCap: number
  billingPeriodStart: string | null
  createdAt: string
  oauthProviders: string[]
  hasPassword: boolean
}

export interface OAuthProviders {
  google: boolean
  github: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const initialized = ref(false)
  const oauthProviders = ref<OAuthProviders>({ google: false, github: false })

  const isAuthenticated = computed(() => !!user.value)

  async function fetchUser() {
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        user.value = data.user
      } else {
        user.value = null
      }
    } catch {
      user.value = null
    } finally {
      initialized.value = true
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      user.value = data.user
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' }
    } finally {
      loading.value = false
    }
  }

  async function register(email: string, password: string, name?: string) {
    loading.value = true
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      user.value = data.user
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } finally {
      user.value = null
    }
  }

  async function updateProfile(data: { name?: string }) {
    loading.value = true
    try {
      const response = await fetch(`${API_BASE}/api/account`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Update failed')
      }

      user.value = result.user
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Update failed' }
    } finally {
      loading.value = false
    }
  }

  async function verifyEmail(code: string) {
    loading.value = true
    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      user.value = data.user
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Verification failed' }
    } finally {
      loading.value = false
    }
  }

  async function resendVerification() {
    loading.value = true
    try {
      const response = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend')
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to resend' }
    } finally {
      loading.value = false
    }
  }

  async function fetchOAuthProviders() {
    try {
      const response = await fetch(`${API_BASE}/api/auth/oauth/providers`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        oauthProviders.value = data
      }
    } catch {
      // Silently fail - OAuth providers will remain disabled
    }
  }

  function loginWithGoogle() {
    window.location.href = `${API_BASE}/api/auth/oauth/google`
  }

  function loginWithGithub() {
    window.location.href = `${API_BASE}/api/auth/oauth/github`
  }

  return {
    user,
    loading,
    initialized,
    isAuthenticated,
    oauthProviders,
    fetchUser,
    login,
    register,
    logout,
    updateProfile,
    verifyEmail,
    resendVerification,
    fetchOAuthProviders,
    loginWithGoogle,
    loginWithGithub
  }
})
