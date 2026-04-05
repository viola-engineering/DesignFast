<script setup lang="ts">
import { ref, computed } from 'vue'
import JobStatusBadge from './JobStatusBadge.vue'
import PreviewFrame from './PreviewFrame.vue'
import { getDownloadUrl } from '@/api/jobs'

type JobStatus = 'queued' | 'running' | 'done' | 'failed'

const props = defineProps<{
  jobId?: string
  status?: JobStatus
  statusMessage?: string
  versions?: number
  files?: string[]
}>()

const emit = defineEmits<{
  iterate: [prompt: string]
  exampleClick: [prompt: string]
}>()

const activeVersion = ref(1)
const showCode = ref(false)
const iteratePrompt = ref('')

const hasJob = computed(() => !!props.jobId)
const isComplete = computed(() => props.status === 'done')
const versionCount = computed(() => props.versions || 1)

const currentFile = computed(() => {
  if (versionCount.value === 1) return 'index.html'
  return `v${activeVersion.value}/index.html`
})

const downloadUrl = computed(() => {
  if (!props.jobId) return ''
  return getDownloadUrl(props.jobId)
})

const examplePrompts = [
  'A modern SaaS landing page for a project management tool with dark mode',
  'Portfolio website for a photographer with full-screen image galleries',
  'Restaurant website with online menu and reservation form',
  'Startup landing page with animated hero and pricing table'
]

function copyCode() {
  // TODO: Implement code copy via API
  navigator.clipboard.writeText('Code copied!')
}

function handleIterate() {
  if (iteratePrompt.value.trim()) {
    emit('iterate', iteratePrompt.value.trim())
    iteratePrompt.value = ''
  }
}
</script>

<template>
  <div class="output-panel">
    <!-- Toolbar -->
    <div v-if="hasJob" class="output-toolbar">
      <div class="toolbar-left">
        <JobStatusBadge :status="status || 'queued'" :message="statusMessage" />

        <!-- Version tabs -->
        <div v-if="versionCount > 1" class="version-tabs">
          <button
            v-for="v in versionCount"
            :key="v"
            class="version-tab"
            :class="{ active: activeVersion === v }"
            @click="activeVersion = v"
          >
            V{{ v }}
          </button>
        </div>
      </div>

      <div class="toolbar-right">
        <button class="toolbar-btn" title="Copy code" @click="copyCode">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button
          class="toolbar-btn"
          :class="{ active: showCode }"
          title="View code"
          @click="showCode = !showCode"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        </button>
        <a
          v-if="isComplete"
          :href="downloadUrl"
          class="toolbar-btn download-btn"
          title="Download ZIP"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </a>
      </div>
    </div>

    <!-- Preview area -->
    <div class="output-content">
      <!-- Empty state -->
      <div v-if="!hasJob" class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
        </div>
        <h3 class="empty-title">Ready to generate</h3>
        <p class="empty-text">Enter a prompt to create your design, or try one of these:</p>
        <div class="example-prompts">
          <button
            v-for="(prompt, i) in examplePrompts"
            :key="i"
            class="example-prompt"
            @click="emit('exampleClick', prompt)"
          >
            {{ prompt }}
          </button>
        </div>
      </div>

      <!-- Preview frame -->
      <PreviewFrame
        v-else-if="!showCode"
        :job-id="jobId!"
        :filename="currentFile"
      />

      <!-- Code view placeholder -->
      <div v-else class="code-view">
        <div class="code-placeholder">
          <p>Code view coming soon</p>
        </div>
      </div>
    </div>

    <!-- Iterate bar -->
    <div v-if="isComplete" class="iterate-bar">
      <input
        v-model="iteratePrompt"
        type="text"
        class="iterate-input"
        placeholder="Describe changes to refine your design..."
        @keyup.enter="handleIterate"
      />
      <button
        class="iterate-btn"
        :disabled="!iteratePrompt.trim()"
        @click="handleIterate"
      >
        Refine
      </button>
    </div>
  </div>
</template>

<style scoped>
.output-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg);
  border-radius: 8px;
  border: 1px solid var(--rule);
  overflow: hidden;
}

.output-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--rule);
  background-color: var(--white);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.version-tabs {
  display: flex;
  gap: 0.25rem;
}

.version-tab {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ink-light);
  background: transparent;
  border: 1px solid var(--rule);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.version-tab:hover {
  border-color: var(--ink-light);
}

.version-tab.active {
  color: var(--white);
  background-color: var(--accent);
  border-color: var(--accent);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--ink-light);
  background: transparent;
  border: 1px solid var(--rule);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
}

.toolbar-btn:hover {
  color: var(--ink);
  border-color: var(--ink-light);
}

.toolbar-btn.active {
  color: var(--accent);
  border-color: var(--accent);
}

.download-btn {
  color: var(--white);
  background-color: var(--accent);
  border-color: var(--accent);
}

.download-btn:hover {
  background-color: var(--ink);
  border-color: var(--ink);
  color: var(--white);
}

.output-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
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

.example-prompts {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 500px;
}

.example-prompt {
  padding: 0.75rem 1rem;
  font-size: 0.8125rem;
  color: var(--ink);
  text-align: left;
  background-color: var(--white);
  border: 1px solid var(--rule);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.example-prompt:hover {
  border-color: var(--accent);
  background-color: rgba(99, 102, 241, 0.05);
}

.code-view {
  height: 100%;
  background-color: var(--dark);
  color: var(--white);
}

.code-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 0.875rem;
  color: var(--ink-light);
}

.iterate-bar {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--rule);
  background-color: var(--white);
}

.iterate-input {
  flex: 1;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  color: var(--ink);
  background-color: var(--bg);
  border: 1px solid var(--rule);
  border-radius: 6px;
  outline: none;
  transition: border-color 0.15s ease;
}

.iterate-input:focus {
  border-color: var(--accent);
}

.iterate-input::placeholder {
  color: var(--ink-light);
}

.iterate-btn {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--white);
  background-color: var(--accent);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.iterate-btn:hover:not(:disabled) {
  background-color: var(--ink);
}

.iterate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
