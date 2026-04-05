<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { saveApiKey, deleteApiKey, type ApiKeyProvider } from '@/api/account'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const user = computed(() => authStore.user)

// Profile form
const editName = ref('')
const isSavingProfile = ref(false)

// API Keys
const anthropicKey = ref('')
const googleKey = ref('')
const hasAnthropicKey = ref(false)
const hasGoogleKey = ref(false)
const isSavingKey = ref<ApiKeyProvider | null>(null)
const isDeletingKey = ref<ApiKeyProvider | null>(null)

// Initialize form
onMounted(() => {
  if (user.value) {
    editName.value = user.value.name || ''
  }
})

const planDisplayName = computed(() => {
  if (!user.value) return ''
  return user.value.plan === 'pro' ? 'Pro' : 'Free'
})

const isPro = computed(() => user.value?.plan === 'pro')

const creditsProgress = computed(() => {
  if (!user.value || !user.value.creditsLimit) return 0
  return Math.min((user.value.creditsUsed / user.value.creditsLimit) * 100, 100)
})

const generationsProgress = computed(() => {
  if (!user.value) return 0
  return Math.min((user.value.generationsUsed / user.value.generationsLimit) * 100, 100)
})

async function saveProfile() {
  if (isSavingProfile.value) return

  isSavingProfile.value = true
  const result = await authStore.updateProfile({ name: editName.value.trim() || undefined })
  isSavingProfile.value = false

  if (result.success) {
    toastStore.success('Profile updated')
  } else {
    toastStore.error(result.error || 'Failed to update profile')
  }
}

async function handleSaveApiKey(provider: ApiKeyProvider) {
  const key = provider === 'anthropic' ? anthropicKey.value : googleKey.value
  if (!key.trim()) {
    toastStore.error('Please enter an API key')
    return
  }

  isSavingKey.value = provider
  try {
    await saveApiKey(provider, key.trim())
    if (provider === 'anthropic') {
      hasAnthropicKey.value = true
      anthropicKey.value = ''
    } else {
      hasGoogleKey.value = true
      googleKey.value = ''
    }
    toastStore.success(`${provider === 'anthropic' ? 'Anthropic' : 'Google'} API key saved`)
  } catch (err) {
    toastStore.error(err instanceof Error ? err.message : 'Failed to save API key')
  } finally {
    isSavingKey.value = null
  }
}

async function handleDeleteApiKey(provider: ApiKeyProvider) {
  isDeletingKey.value = provider
  try {
    await deleteApiKey(provider)
    if (provider === 'anthropic') {
      hasAnthropicKey.value = false
    } else {
      hasGoogleKey.value = false
    }
    toastStore.success(`${provider === 'anthropic' ? 'Anthropic' : 'Google'} API key removed`)
  } catch (err) {
    toastStore.error(err instanceof Error ? err.message : 'Failed to delete API key')
  } finally {
    isDeletingKey.value = null
  }
}

function handleUpgrade() {
  toastStore.info('Billing not configured')
}

async function handleLogout() {
  await authStore.logout()
  toastStore.success('Logged out successfully')
  router.push('/')
}
</script>

<template>
  <div class="account-page">
    <div class="account-container">
      <h1 class="account-title">Account Settings</h1>

      <!-- Loading state -->
      <div v-if="!user" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading account...</p>
      </div>

      <template v-else>
        <!-- Profile Section -->
        <section class="account-section">
          <h2 class="section-title">Profile</h2>
          <div class="section-content">
            <div class="form-group">
              <label class="form-label">Email</label>
              <div class="form-value">{{ user.email }}</div>
            </div>

            <div class="form-group">
              <label for="name" class="form-label">Name</label>
              <div class="input-row">
                <input
                  id="name"
                  v-model="editName"
                  type="text"
                  class="form-input"
                  placeholder="Your name"
                />
                <button
                  class="btn-save"
                  :disabled="isSavingProfile"
                  @click="saveProfile"
                >
                  {{ isSavingProfile ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Plan Section -->
        <section class="account-section">
          <h2 class="section-title">Plan</h2>
          <div class="section-content">
            <div class="plan-header">
              <div class="plan-info">
                <span class="plan-name">{{ planDisplayName }}</span>
                <span class="plan-badge">Current Plan</span>
              </div>
              <button v-if="!isPro" class="btn-upgrade" @click="handleUpgrade">
                Upgrade
              </button>
            </div>

            <!-- Pro: credits usage -->
            <template v-if="isPro">
              <div class="usage-section">
                <div class="usage-header">
                  <span class="usage-label">Credits this month</span>
                  <span class="usage-count">{{ user.creditsUsed }} / {{ user.creditsLimit }}</span>
                </div>
                <div class="usage-bar">
                  <div class="usage-fill" :style="{ width: `${creditsProgress}%` }"></div>
                </div>
              </div>
              <p class="billing-note" style="margin-top: 0.5rem;">
                Gemini = 1 credit &middot; Claude = 20 credits
              </p>
            </template>

            <!-- Free: generations usage -->
            <template v-else>
              <div class="usage-section">
                <div class="usage-header">
                  <span class="usage-label">Generations this month</span>
                  <span class="usage-count">{{ user.generationsUsed }} / {{ user.generationsLimit }}</span>
                </div>
                <div class="usage-bar">
                  <div class="usage-fill" :style="{ width: `${generationsProgress}%` }"></div>
                </div>
              </div>
            </template>

            <p v-if="user.billingPeriodStart" class="billing-note">
              Billing period started {{ new Date(user.billingPeriodStart).toLocaleDateString() }}
            </p>
          </div>
        </section>

        <!-- API Keys Section -->
        <section class="account-section">
          <h2 class="section-title">API Keys (BYOK)</h2>
          <p class="section-description">
            Bring your own API keys to use your own rate limits and billing.
          </p>
          <div class="section-content">
            <!-- Anthropic Key -->
            <div class="api-key-row">
              <div class="api-key-header">
                <span class="api-key-label">Anthropic (Claude)</span>
                <span v-if="hasAnthropicKey" class="key-badge">Key saved</span>
              </div>
              <div class="input-row">
                <input
                  v-model="anthropicKey"
                  type="password"
                  class="form-input"
                  :placeholder="hasAnthropicKey ? '••••••••••••••••' : 'sk-ant-...'"
                />
                <button
                  v-if="!hasAnthropicKey"
                  class="btn-save"
                  :disabled="isSavingKey === 'anthropic'"
                  @click="handleSaveApiKey('anthropic')"
                >
                  {{ isSavingKey === 'anthropic' ? 'Saving...' : 'Save' }}
                </button>
                <template v-else>
                  <button
                    class="btn-save"
                    :disabled="isSavingKey === 'anthropic' || !anthropicKey"
                    @click="handleSaveApiKey('anthropic')"
                  >
                    {{ isSavingKey === 'anthropic' ? 'Saving...' : 'Update' }}
                  </button>
                  <button
                    class="btn-delete"
                    :disabled="isDeletingKey === 'anthropic'"
                    @click="handleDeleteApiKey('anthropic')"
                  >
                    {{ isDeletingKey === 'anthropic' ? '...' : 'Delete' }}
                  </button>
                </template>
              </div>
            </div>

            <!-- Google Key -->
            <div class="api-key-row">
              <div class="api-key-header">
                <span class="api-key-label">Google (Gemini)</span>
                <span v-if="hasGoogleKey" class="key-badge">Key saved</span>
              </div>
              <div class="input-row">
                <input
                  v-model="googleKey"
                  type="password"
                  class="form-input"
                  :placeholder="hasGoogleKey ? '••••••••••••••••' : 'AIza...'"
                />
                <button
                  v-if="!hasGoogleKey"
                  class="btn-save"
                  :disabled="isSavingKey === 'google'"
                  @click="handleSaveApiKey('google')"
                >
                  {{ isSavingKey === 'google' ? 'Saving...' : 'Save' }}
                </button>
                <template v-else>
                  <button
                    class="btn-save"
                    :disabled="isSavingKey === 'google' || !googleKey"
                    @click="handleSaveApiKey('google')"
                  >
                    {{ isSavingKey === 'google' ? 'Saving...' : 'Update' }}
                  </button>
                  <button
                    class="btn-delete"
                    :disabled="isDeletingKey === 'google'"
                    @click="handleDeleteApiKey('google')"
                  >
                    {{ isDeletingKey === 'google' ? '...' : 'Delete' }}
                  </button>
                </template>
              </div>
            </div>
          </div>
        </section>

        <!-- Logout Section -->
        <section class="account-section logout-section">
          <button class="btn-logout" @click="handleLogout">
            Sign out
          </button>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.account-page {
  min-height: calc(100vh - 62px);
  padding: 3rem var(--sp-page);
  background-color: var(--bg);
}

.account-container {
  max-width: 640px;
  margin: 0 auto;
}

.account-title {
  font-family: var(--ff-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 2.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: var(--ink-light);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--rule);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.account-section {
  background-color: var(--white);
  border: 1px solid var(--rule);
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-family: var(--ff-display);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 0.5rem;
}

.section-description {
  font-size: 0.875rem;
  color: var(--ink-light);
  margin-bottom: 1.25rem;
}

.section-content {
  margin-top: 1.25rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 0.5rem;
}

.form-value {
  font-size: 0.9375rem;
  color: var(--ink-light);
  padding: 0.75rem 1rem;
  background-color: var(--bg);
  border: 1px solid var(--rule);
}

.form-input {
  flex: 1;
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

.input-row {
  display: flex;
  gap: 0.75rem;
}

.btn-save {
  padding: 0.75rem 1.25rem;
  font-family: var(--ff-body);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--white);
  background-color: var(--accent);
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease;
  white-space: nowrap;
}

.btn-save:hover:not(:disabled) {
  background-color: var(--accent-warm);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-delete {
  padding: 0.75rem 1rem;
  font-family: var(--ff-body);
  font-size: 0.8125rem;
  font-weight: 500;
  color: #dc2626;
  background-color: transparent;
  border: 1px solid #dc2626;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-delete:hover:not(:disabled) {
  background-color: #dc2626;
  color: white;
}

.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Plan Section */
.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.plan-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.plan-name {
  font-family: var(--ff-display);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ink);
}

.plan-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent);
  background-color: rgba(204, 50, 9, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 2px;
}

.btn-upgrade {
  padding: 0.625rem 1.25rem;
  font-family: var(--ff-body);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ink);
  background-color: transparent;
  border: 1px solid var(--ink);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-upgrade:hover {
  background-color: var(--ink);
  color: var(--white);
}

.usage-section {
  margin-bottom: 1rem;
}

.usage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.usage-label {
  font-size: 0.8125rem;
  color: var(--ink-light);
}

.usage-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ink);
}

.usage-bar {
  height: 8px;
  background-color: var(--bg);
  border-radius: 4px;
  overflow: hidden;
}

.usage-fill {
  height: 100%;
  background-color: var(--accent);
  transition: width 0.3s ease;
}

.billing-note {
  font-size: 0.75rem;
  color: var(--ink-light);
}

/* API Keys */
.api-key-row {
  margin-bottom: 1.25rem;
}

.api-key-row:last-child {
  margin-bottom: 0;
}

.api-key-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.api-key-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ink);
}

.key-badge {
  font-size: 0.6875rem;
  font-weight: 500;
  color: #16a34a;
  background-color: #dcfce7;
  padding: 0.125rem 0.5rem;
  border-radius: 2px;
}

/* Logout */
.logout-section {
  text-align: center;
  background-color: transparent;
  border: none;
  padding: 0;
}

.btn-logout {
  padding: 0.75rem 2rem;
  font-family: var(--ff-body);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ink-light);
  background-color: transparent;
  border: 1px solid var(--rule);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-logout:hover {
  color: var(--ink);
  border-color: var(--ink);
}
</style>
