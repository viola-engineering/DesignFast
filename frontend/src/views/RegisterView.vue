<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const email = ref('')
const password = ref('')
const name = ref('')
const error = ref('')
const isSubmitting = computed(() => authStore.loading)

const passwordError = computed(() => {
  if (!password.value) return ''
  if (password.value.length < 8) return 'Password must be at least 8 characters'
  return ''
})

const isValid = computed(() => {
  return (
    email.value.trim() &&
    password.value.length >= 8 &&
    isValidEmail(email.value)
  )
})

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function handleSubmit() {
  if (!isValid.value || isSubmitting.value) return

  error.value = ''

  const result = await authStore.register(
    email.value.trim(),
    password.value,
    name.value.trim() || undefined
  )

  if (result.success) {
    if (authStore.user?.emailVerified) {
      toastStore.success('Account created! Welcome to DesignFast.')
      router.push('/generate')
    } else {
      toastStore.success('Account created! Please check your email for the verification code.')
      router.push('/verify-email')
    }
  } else {
    error.value = result.error || 'Registration failed'
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1 class="auth-title">Create an account</h1>
        <p class="auth-subtitle">Start generating beautiful designs for free</p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div v-if="error" class="auth-error">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="name" class="form-label">Name <span class="optional">(optional)</span></label>
          <input
            id="name"
            v-model="name"
            type="text"
            class="form-input"
            placeholder="Your name"
            autocomplete="name"
          />
        </div>

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
            :class="{ 'input-error': passwordError }"
            placeholder="At least 8 characters"
            required
            autocomplete="new-password"
          />
          <p v-if="passwordError" class="field-error">{{ passwordError }}</p>
        </div>

        <button
          type="submit"
          class="auth-submit"
          :disabled="!isValid || isSubmitting"
        >
          <span v-if="isSubmitting" class="spinner"></span>
          {{ isSubmitting ? 'Creating account...' : 'Create account' }}
        </button>

        <p class="terms-note">
          By creating an account, you agree to our terms of service.
        </p>
      </form>

      <div class="auth-footer">
        <p class="auth-switch">
          Already have an account?
          <RouterLink to="/login" class="auth-link">Sign in</RouterLink>
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

.form-label .optional {
  font-weight: 400;
  color: var(--ink-light);
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

.form-input.input-error {
  border-color: #dc2626;
}

.field-error {
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 0.375rem;
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

.terms-note {
  font-size: 0.75rem;
  color: var(--ink-light);
  text-align: center;
  margin-top: 1rem;
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
</style>
