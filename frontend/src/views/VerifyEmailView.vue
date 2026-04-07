<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const code = ref('')
const error = ref('')
const resendCooldown = ref(0)
const isSubmitting = computed(() => authStore.loading)

const isValid = computed(() => {
  return code.value.trim().length === 6 && /^\d{6}$/.test(code.value.trim())
})

let cooldownInterval: ReturnType<typeof setInterval> | null = null

async function handleSubmit() {
  if (!isValid.value || isSubmitting.value) return

  error.value = ''

  const result = await authStore.verifyEmail(code.value.trim())

  if (result.success) {
    toastStore.success('Email verified!')
    router.push('/generate')
  } else {
    error.value = result.error || 'Verification failed'
  }
}

async function handleResend() {
  if (resendCooldown.value > 0 || isSubmitting.value) return

  error.value = ''

  const result = await authStore.resendVerification()

  if (result.success) {
    toastStore.success('Verification code sent!')
    resendCooldown.value = 60

    cooldownInterval = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0 && cooldownInterval) {
        clearInterval(cooldownInterval)
        cooldownInterval = null
      }
    }, 1000)
  } else {
    error.value = result.error || 'Failed to resend code'
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1 class="auth-title">Verify your email</h1>
        <p class="auth-subtitle">
          We sent a 6-digit code to <strong>{{ authStore.user?.email }}</strong>
        </p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div v-if="error" class="auth-error">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="code" class="form-label">Verification code</label>
          <input
            id="code"
            v-model="code"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="6"
            class="form-input code-input"
            placeholder="000000"
            autocomplete="one-time-code"
          />
        </div>

        <button
          type="submit"
          class="auth-submit"
          :disabled="!isValid || isSubmitting"
        >
          <span v-if="isSubmitting" class="spinner"></span>
          {{ isSubmitting ? 'Verifying...' : 'Verify email' }}
        </button>

        <p class="resend-text">
          Didn't receive the code?
          <button
            type="button"
            class="resend-link"
            :disabled="resendCooldown > 0 || isSubmitting"
            @click="handleResend"
          >
            {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code' }}
          </button>
        </p>
      </form>
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

.auth-subtitle strong {
  color: var(--ink);
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

.code-input {
  font-family: monospace;
  font-size: 1.5rem;
  text-align: center;
  letter-spacing: 0.5em;
  padding: 1rem;
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

.resend-text {
  font-size: 0.875rem;
  color: var(--ink-light);
  text-align: center;
  margin-top: 1.5rem;
}

.resend-link {
  color: var(--accent);
  background: none;
  border: none;
  font-family: inherit;
  font-size: inherit;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.resend-link:hover:not(:disabled) {
  text-decoration: underline;
}

.resend-link:disabled {
  color: var(--ink-light);
  cursor: not-allowed;
}
</style>
