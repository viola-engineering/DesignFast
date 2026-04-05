<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGenerationsStore } from '@/stores/generations'
import type { GenerationListItem } from '@/api/generations'

const router = useRouter()
const generationsStore = useGenerationsStore()

const currentPage = ref(1)
const pageSize = 20

const isLoading = computed(() => generationsStore.loading)
const error = computed(() => generationsStore.error)
const generations = computed(() => generationsStore.generations)
const total = computed(() => generationsStore.total)
const hasMore = computed(() => generationsStore.hasMore)
const totalPages = computed(() => Math.ceil(total.value / pageSize))

onMounted(() => {
  loadPage(1)
})

async function loadPage(page: number) {
  currentPage.value = page
  const offset = (page - 1) * pageSize
  await generationsStore.fetchList(pageSize, offset)
}

function navigateToDetail(id: string) {
  router.push({ name: 'generation-detail', params: { id } })
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function truncatePrompt(prompt: string, maxLength = 100): string {
  if (prompt.length <= maxLength) return prompt
  return prompt.slice(0, maxLength).trim() + '...'
}

function getStatusClass(status: GenerationListItem['status']): string {
  return `status-${status}`
}

function getModeLabel(mode: string): string {
  return mode === 'landing' ? 'Single page' : 'Multi-page'
}

function getThemeModeLabel(themeMode: string): string {
  const labels: Record<string, string> = {
    auto: 'AI picked',
    explicit: 'Manual',
    synth: 'Synthesized',
    freestyle: 'Freestyle'
  }
  return labels[themeMode] || themeMode
}
</script>

<template>
  <div class="history-page">
    <div class="history-container">
      <header class="history-header">
        <h1 class="history-title">Generation History</h1>
        <p class="history-subtitle">View and manage your past generations</p>
      </header>

      <!-- Loading state -->
      <div v-if="isLoading && generations.length === 0" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading generations...</p>
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
        <button class="btn-retry" @click="loadPage(currentPage)">Try again</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="generations.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
        </div>
        <h2 class="empty-title">No generations yet</h2>
        <p class="empty-text">Your generation history will appear here once you create your first design.</p>
        <RouterLink to="/generate" class="btn-primary">Create your first design</RouterLink>
      </div>

      <!-- Generation list -->
      <div v-else class="generation-list">
        <div
          v-for="gen in generations"
          :key="gen.id"
          class="generation-item"
          @click="navigateToDetail(gen.id)"
        >
          <div class="gen-main">
            <p class="gen-prompt">{{ truncatePrompt(gen.prompt) }}</p>
            <div class="gen-meta">
              <span class="gen-mode">{{ getModeLabel(gen.mode) }}</span>
              <span class="gen-separator">·</span>
              <span class="gen-theme">{{ getThemeModeLabel(gen.themeMode) }}</span>
              <span class="gen-separator">·</span>
              <span class="gen-date">{{ formatDate(gen.createdAt) }}</span>
            </div>
          </div>
          <div class="gen-stats">
            <span class="gen-status" :class="getStatusClass(gen.status)">
              {{ gen.status }}
            </span>
            <span class="gen-jobs">
              {{ gen.jobsDone }}/{{ gen.jobCount }} jobs
              <span v-if="gen.jobsFailed > 0" class="jobs-failed">({{ gen.jobsFailed }} failed)</span>
            </span>
          </div>
          <div class="gen-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>

        <!-- Loading more indicator -->
        <div v-if="isLoading" class="loading-more">
          <div class="loading-spinner small"></div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="loadPage(currentPage - 1)"
          >
            Previous
          </button>
          <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
          <button
            class="page-btn"
            :disabled="!hasMore"
            @click="loadPage(currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-page {
  min-height: calc(100vh - 62px);
  padding: 3rem var(--sp-page);
  background-color: var(--bg);
}

.history-container {
  max-width: 900px;
  margin: 0 auto;
}

.history-header {
  margin-bottom: 2.5rem;
}

.history-title {
  font-family: var(--ff-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 0.5rem;
}

.history-subtitle {
  font-size: 0.9375rem;
  color: var(--ink-light);
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

.loading-spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
  margin-bottom: 0;
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

.btn-retry {
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

.btn-retry:hover {
  background-color: var(--ink);
  color: var(--white);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  text-align: center;
}

.empty-icon {
  color: var(--rule);
  margin-bottom: 1.5rem;
}

.empty-title {
  font-family: var(--ff-display);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-text {
  font-size: 0.875rem;
  color: var(--ink-light);
  margin-bottom: 1.5rem;
  max-width: 400px;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  font-family: var(--ff-body);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--white);
  background-color: var(--accent);
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.btn-primary:hover {
  background-color: var(--accent-warm);
}

/* Generation list */
.generation-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.generation-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background-color: var(--white);
  border: 1px solid var(--rule);
  border-bottom: none;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.generation-item:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.generation-item:last-child {
  border-bottom: 1px solid var(--rule);
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.generation-item:hover {
  background-color: var(--bg);
}

.gen-main {
  min-width: 0;
}

.gen-prompt {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--ink);
  margin-bottom: 0.375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gen-meta {
  font-size: 0.75rem;
  color: var(--ink-light);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.gen-separator {
  opacity: 0.5;
}

.gen-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.gen-status {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.125rem 0.5rem;
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

.gen-jobs {
  font-size: 0.75rem;
  color: var(--ink-light);
}

.jobs-failed {
  color: #dc2626;
}

.gen-arrow {
  color: var(--ink-light);
  transition: transform 0.15s ease;
}

.generation-item:hover .gen-arrow {
  transform: translateX(4px);
}

/* Loading more */
.loading-more {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  font-family: var(--ff-body);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ink);
  background-color: var(--white);
  border: 1px solid var(--rule);
  cursor: pointer;
  transition: all 0.15s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--ink);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.8125rem;
  color: var(--ink-light);
}

@media (max-width: 640px) {
  .generation-item {
    grid-template-columns: 1fr auto;
    gap: 1rem;
  }

  .gen-stats {
    grid-row: 1;
    grid-column: 2;
  }

  .gen-arrow {
    display: none;
  }
}
</style>
