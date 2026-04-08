<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toastStore = useToastStore()

const email = ref('')
const password = ref('')
const error = ref('')
const isSubmitting = computed(() => authStore.loading)

const isValid = computed(() => {
  return email.value.trim() && password.value && isValidEmail(email.value)
})

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Check for OAuth error from redirect
onMounted(() => {
  authStore.fetchOAuthProviders()
  const oauthError = route.query.error as string
  if (oauthError) {
    error.value = decodeURIComponent(oauthError)
    // Clear the error from URL
    router.replace({ query: {} })
  }
})

async function handleSubmit() {
  if (!isValid.value || isSubmitting.value) return

  error.value = ''

  const result = await authStore.login(email.value.trim(), password.value)

  if (result.success) {
    toastStore.success('Welcome back!')
    const redirect = route.query.redirect as string || '/generate'
    router.push(redirect)
  } else {
    error.value = result.error || 'Invalid email or password'
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-subtitle">Sign in to continue generating designs</p>
      </div>

      <div v-if="error" class="auth-error-top">
        {{ error }}
      </div>

      <div v-if="authStore.oauthProviders.google || authStore.oauthProviders.github" class="oauth-buttons">
        <button
          v-if="authStore.oauthProviders.google"
          type="button"
          class="oauth-btn oauth-btn-google"
          @click="authStore.loginWithGoogle()"
        >
          <svg class="oauth-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
        <button
          v-if="authStore.oauthProviders.github"
          type="button"
          class="oauth-btn oauth-btn-github"
          @click="authStore.loginWithGithub()"
        >
          <svg class="oauth-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
          Continue with GitHub
        </button>
      </div>

      <div v-if="authStore.oauthProviders.google || authStore.oauthProviders.github" class="auth-divider">
        <span>or continue with email</span>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">

        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="you@example.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="Your password"
            required
            autocomplete="current-password"
          />
        </div>

        <button
          type="submit"
          class="auth-submit"
          :disabled="!isValid || isSubmitting"
        >
          <span v-if="isSubmitting" class="spinner"></span>
          {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <div class="auth-footer">
        <p class="auth-switch">
          Don't have an account?
          <RouterLink to="/register" class="auth-link">Create one</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - 62px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem var(--sp-page);
  background-color: var(--bg);
}

.auth-container {
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.auth-title {
  font-family: var(--ff-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  font-size: 0.9375rem;
  color: var(--ink-light);
}

.auth-form {
  background-color: var(--white);
  padding: 2rem;
  border: 1px solid var(--rule);
}

.auth-error {
  padding: 0.875rem 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: #b91c1c;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: var(--ff-body);
  font-size: 0.9375rem;
  color: var(--ink);
  background-color: var(--bg);
  border: 1px solid var(--rule);
  transition: border-color 0.15s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--ink);
}

.form-input::placeholder {
  color: var(--ink-light);
}

.auth-submit {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  margin-top: 1.5rem;
  font-family: var(--ff-body);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--white);
  background-color: var(--accent);
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.auth-submit:hover:not(:disabled) {
  background-color: var(--accent-warm);
}

.auth-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
}

.auth-switch {
  font-size: 0.875rem;
  color: var(--ink-light);
}

.auth-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
}

.auth-link:hover {
  text-decoration: underline;
}

.auth-error-top {
  padding: 0.875rem 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: #b91c1c;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.oauth-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  font-family: var(--ff-body);
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 0;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.oauth-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.oauth-btn-google {
  color: var(--ink);
  background-color: var(--white);
  border: 1px solid var(--rule);
}

.oauth-btn-google:hover {
  background-color: var(--bg);
  border-color: var(--ink-light);
}

.oauth-btn-github {
  color: var(--white);
  background-color: #24292f;
  border: 1px solid #24292f;
}

.oauth-btn-github:hover {
  background-color: #32383f;
  border-color: #32383f;
}

.auth-divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: var(--ink-light);
  font-size: 0.8125rem;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: var(--rule);
}

.auth-divider span {
  padding: 0 1rem;
}
</style>
