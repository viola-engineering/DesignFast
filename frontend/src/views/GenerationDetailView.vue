<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGenerationsStore } from '@/stores/generations'
import { useToastStore } from '@/stores/toast'
import { getDownloadUrl, getPreviewUrl } from '@/api/jobs'
import JobStatusBadge from '@/components/JobStatusBadge.vue'

const route = useRoute()
const router = useRouter()
const generationsStore = useGenerationsStore()
const toastStore = useToastStore()

const generationId = computed(() => route.params.id as string)
const isLoading = computed(() => generationsStore.loading)
const error = computed(() => generationsStore.error)
const generation = computed(() => generationsStore.currentGeneration)

const previewJobId = ref<string | null>(null)
const showDeleteConfirm = ref(false)
const isDeleting = ref(false)

onMounted(async () => {
  await generationsStore.fetchById(generationId.value)
})

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function getModeLabel(mode: string): string {
  return mode === 'cv' ? 'CV / Resume' : mode === 'landing' ? 'Single page' : 'Multi-page'
}

function getThemeModeLabel(themeMode: string): string {
  const labels: Record<string, string> = {
    auto: 'AI picked',
    explicit: 'Manual selection',
    synth: 'Synthesized',
    freestyle: 'Freestyle'
  }
  return labels[themeMode] || themeMode
}

function openPreview(jobId: string) {
  previewJobId.value = jobId
}

function closePreview() {
  previewJobId.value = null
}

async function confirmDelete() {
  if (isDeleting.value) return

  isDeleting.value = true
  try {
    await generationsStore.deleteById(generationId.value)
    toastStore.success('Generation deleted')
    router.push({ name: 'history' })
  } catch (err) {
    toastStore.error(err instanceof Error ? err.message : 'Failed to delete generation')
  } finally {
    isDeleting.value = false
    showDeleteConfirm.value = false
  }
}
</script>

<template>
  <div class="detail-page">
    <div class="detail-container">
      <!-- Back link -->
      <RouterLink to="/history" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Back to history
      </RouterLink>

      <!-- Loading state -->
      <div v-if="isLoading && !generation" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading generation...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <p class="error-message">{{ error }}</p>
        <RouterLink to="/history" class="btn-back">Back to history</RouterLink>
      </div>

      <!-- Generation detail -->
      <template v-else-if="generation">
        <!-- Header -->
        <header class="detail-header">
          <div class="header-main">
            <h1 class="detail-title">Generation</h1>
            <span class="gen-status" :class="`status-${generation.status}`">
              {{ generation.status }}
            </span>
          </div>
          <button class="btn-delete" @click="showDeleteConfirm = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete
          </button>
        </header>

        <!-- Prompt -->
        <section class="detail-section">
          <h2 class="section-label">Prompt</h2>
          <p class="prompt-text">{{ generation.prompt }}</p>
        </section>

        <!-- Metadata -->
        <section class="detail-section metadata-grid">
          <div class="meta-item">
            <span class="meta-label">Mode</span>
            <span class="meta-value">{{ getModeLabel(generation.mode) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Theme Mode</span>
            <span class="meta-value">{{ getThemeModeLabel(generation.themeMode) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Created</span>
            <span class="meta-value">{{ formatDate(generation.createdAt) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Completed</span>
            <span class="meta-value">{{ formatDate(generation.completedAt) }}</span>
          </div>
        </section>

        <!-- Auto-selected styles -->
        <section v-if="generation.autoSelected" class="detail-section">
          <h2 class="section-label">AI Selected Styles</h2>
          <div class="style-tags">
            <span v-for="style in generation.autoSelected" :key="style" class="style-tag">
              {{ style }}
            </span>
          </div>
        </section>

        <!-- Synth brief -->
        <section v-if="generation.synthBrief" class="detail-section">
          <h2 class="section-label">Synthesized Brief</h2>
          <p class="synth-brief">{{ generation.synthBrief }}</p>
        </section>

        <!-- Usage stats -->
        <section class="detail-section stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ generation.totalCredits }}</span>
            <span class="stat-label">Credits Used</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ generation.jobsDone }}/{{ generation.jobCount }}</span>
            <span class="stat-label">Jobs Done</span>
          </div>
        </section>

        <!-- Jobs list -->
        <section class="detail-section">
          <h2 class="section-label">Jobs</h2>
          <div class="jobs-list">
            <div v-for="job in generation.jobs" :key="job.id" class="job-item">
              <div class="job-main">
                <div class="job-header">
                  <span class="job-style">{{ job.styleName }}</span>
                  <span class="job-version">v{{ job.version }}</span>
                  <JobStatusBadge :status="job.status" />
                </div>
                <div class="job-meta">
                  <span>{{ job.model }}</span>
                  <span class="job-sep">·</span>
                  <span>{{ formatDuration(job.durationMs) }}</span>
                  <span class="job-sep">·</span>
                  <span>{{ job.creditCost }} credit{{ job.creditCost !== 1 ? 's' : '' }}</span>
                </div>
              </div>
              <div class="job-actions">
                <RouterLink
                  v-if="job.status === 'done'"
                  :to="{ name: 'generate', query: { jobId: job.id } }"
                  class="btn-action btn-continue"
                  title="Continue editing"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </RouterLink>
                <button
                  v-if="job.status === 'done'"
                  class="btn-action"
                  title="Preview"
                  @click="openPreview(job.id)"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
                <a
                  v-if="job.status === 'done'"
                  :href="getDownloadUrl(job.id)"
                  class="btn-action"
                  title="Download"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>

    <!-- Preview modal -->
    <div v-if="previewJobId" class="preview-modal" @click.self="closePreview">
      <div class="preview-container">
        <button class="preview-close" @click="closePreview">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <iframe
          :src="getPreviewUrl(previewJobId)"
          class="preview-iframe"
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </div>
    </div>

    <!-- Delete confirmation -->
    <div v-if="showDeleteConfirm" class="confirm-modal" @click.self="showDeleteConfirm = false">
      <div class="confirm-dialog">
        <h3 class="confirm-title">Delete generation?</h3>
        <p class="confirm-text">This will permanently delete this generation and all its jobs. This action cannot be undone.</p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="showDeleteConfirm = false">Cancel</button>
          <button class="btn-confirm-delete" :disabled="isDeleting" @click="confirmDelete">
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  min-height: calc(100vh - 62px);
  padding: 2rem var(--sp-page);
  background-color: var(--bg);
}

.detail-container {
  max-width: 900px;
  margin: 0 auto;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ink-light);
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition: color 0.15s ease;
}

.back-link:hover {
  color: var(--ink);
}

/* Loading state */
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

/* Error state */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  text-align: center;
}

.error-icon {
  color: #dc2626;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 0.9375rem;
  color: var(--ink-light);
  margin-bottom: 1.5rem;
}

.btn-back {
  padding: 0.625rem 1.25rem;
  font-family: var(--ff-body);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ink);
  background-color: transparent;
  border: 1px solid var(--ink);
  text-decoration: none;
  transition: all 0.15s ease;
}

.btn-back:hover {
  background-color: var(--ink);
  color: var(--white);
}

/* Header */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.detail-title {
  font-family: var(--ff-display);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--ink);
}

.gen-status {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.75rem;
  border-radius: 2px;
}

.status-running {
  color: #2563eb;
  background-color: #dbeafe;
}

.status-done {
  color: #16a34a;
  background-color: #dcfce7;
}

.status-failed {
  color: #dc2626;
  background-color: #fef2f2;
}

.btn-delete {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-family: var(--ff-body);
  font-size: 0.8125rem;
  font-weight: 500;
  color: #dc2626;
  background-color: transparent;
  border: 1px solid #dc2626;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-delete:hover {
  background-color: #dc2626;
  color: white;
}

/* Sections */
.detail-section {
  background-color: var(--white);
  border: 1px solid var(--rule);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.section-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--ink-light);
  margin-bottom: 0.75rem;
}

.prompt-text {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--ink);
}

/* Metadata grid */
.metadata-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--ink-light);
}

.meta-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ink);
}

/* Style tags */
.style-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.style-tag {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--accent);
  background-color: rgba(204, 50, 9, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 2px;
}

.synth-brief {
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--ink);
  font-style: italic;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-family: var(--ff-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ink);
}

.stat-label {
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--ink-light);
}

/* Jobs list */
.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.job-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--rule);
}

.job-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.job-item:first-child {
  padding-top: 0;
}

.job-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.job-style {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink);
}

.job-version {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ink-light);
  background-color: var(--bg);
  padding: 0.125rem 0.5rem;
  border-radius: 2px;
}

.job-meta {
  font-size: 0.75rem;
  color: var(--ink-light);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.job-sep {
  opacity: 0.5;
}

.job-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--ink-light);
  background-color: transparent;
  border: 1px solid var(--rule);
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
}

.btn-action:hover {
  color: var(--ink);
  border-color: var(--ink);
}

.btn-continue {
  color: var(--accent);
  border-color: var(--accent);
}

.btn-continue:hover {
  color: var(--white);
  background-color: var(--accent);
  border-color: var(--accent);
}

/* Preview modal */
.preview-modal {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 2rem;
}

.preview-container {
  position: relative;
  width: 100%;
  max-width: 1200px;
  height: 80vh;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.preview-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.15s ease;
}

.preview-close:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* Delete confirmation modal */
.confirm-modal {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.confirm-dialog {
  background-color: var(--white);
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  border-radius: 4px;
}

.confirm-title {
  font-family: var(--ff-display);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 0.75rem;
}

.confirm-text {
  font-size: 0.875rem;
  color: var(--ink-light);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-cancel {
  padding: 0.625rem 1.25rem;
  font-family: var(--ff-body);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ink);
  background-color: transparent;
  border: 1px solid var(--rule);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-cancel:hover {
  border-color: var(--ink);
}

.btn-confirm-delete {
  padding: 0.625rem 1.25rem;
  font-family: var(--ff-body);
  font-size: 0.8125rem;
  font-weight: 600;
  color: white;
  background-color: #dc2626;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-confirm-delete:hover:not(:disabled) {
  background-color: #b91c1c;
}

.btn-confirm-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .metadata-grid,
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
