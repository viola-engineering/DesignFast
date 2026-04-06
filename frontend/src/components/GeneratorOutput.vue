<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import JobStatusBadge from './JobStatusBadge.vue'
import PreviewFrame from './PreviewFrame.vue'
import { getDownloadUrl } from '@/api/jobs'
import { uploadFile, deleteUpload, getThumbnailUrl } from '@/api/uploads'
import type { Upload } from '@/api/uploads'

type JobStatus = 'queued' | 'running' | 'done' | 'failed'

interface TrackedJob {
  id: string
  styleKey: string
  styleName: string
  status: JobStatus
  statusMessage?: string
}

const props = defineProps<{
  jobId?: string
  status?: JobStatus
  statusMessage?: string
  jobs?: TrackedJob[]
  activeJobIndex?: number
  revision?: number
  latestRevision?: number
}>()

const emit = defineEmits<{
  iterate: [prompt: string, uploadIds?: string[]]
  exampleClick: [prompt: string]
  revisionChange: [revision: number]
  startNew: []
  jobChange: [index: number]
}>()

const authStore = useAuthStore()
const isPro = computed(() => authStore.user?.plan === 'pro')

const iteratePrompt = ref('')
const iterateAttachments = ref<Upload[]>([])
const isAttaching = ref(false)
const attachError = ref('')

const hasJob = computed(() => !!props.jobId)
const isComplete = computed(() => props.status === 'done')
const hasMultipleJobs = computed(() => (props.jobs?.length || 0) > 1)

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

async function handleAttach(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  attachError.value = ''
  isAttaching.value = true
  try {
    for (const file of input.files) {
      // Iterate attachments are typically reference images (vision input)
      const result = await uploadFile(file, 'reference')
      iterateAttachments.value.push(result)
    }
  } catch (err: unknown) {
    attachError.value = err instanceof Error ? err.message : 'Upload failed'
  } finally {
    isAttaching.value = false
    input.value = ''
  }
}

function removeAttachment(id: string) {
  iterateAttachments.value = iterateAttachments.value.filter(a => a.id !== id)
  deleteUpload(id).catch(() => {})
}

function handleIterate() {
  if (iteratePrompt.value.trim()) {
    const uploadIds = iterateAttachments.value.map(a => a.id)
    emit('iterate', iteratePrompt.value.trim(), uploadIds.length > 0 ? uploadIds : undefined)
    iteratePrompt.value = ''
    iterateAttachments.value = []
    attachError.value = ''
  }
}
</script>

<template>
  <div class="output-panel">
    <!-- Toolbar -->
    <div v-if="hasJob" class="output-toolbar">
      <div class="toolbar-left">
        <JobStatusBadge :status="status || 'queued'" :message="statusMessage" />

        <!-- Job tabs (when multiple styles/jobs) -->
        <div v-if="hasMultipleJobs" class="job-tabs">
          <button
            v-for="(job, i) in jobs"
            :key="job.id"
            class="job-tab"
            :class="{
              active: activeJobIndex === i,
              done: job.status === 'done',
              failed: job.status === 'failed',
              running: job.status === 'running',
            }"
            @click="emit('jobChange', i)"
          >
            <span class="job-tab-status">
              <span v-if="job.status === 'done'" class="dot dot-done"></span>
              <span v-else-if="job.status === 'failed'" class="dot dot-failed"></span>
              <span v-else-if="job.status === 'running'" class="dot dot-running"></span>
              <span v-else class="dot dot-queued"></span>
            </span>
            {{ job.styleName || `Job ${i + 1}` }}
          </button>
        </div>
      </div>

      <div v-if="(latestRevision || 0) > 0" class="revision-nav">
        <button
          class="rev-btn"
          :disabled="(revision || 0) <= 0"
          title="Previous revision"
          @click="emit('revisionChange', (revision || 0) - 1)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <span class="rev-label">v{{ (revision || 0) + 1 }} / {{ (latestRevision || 0) + 1 }}</span>
        <button
          class="rev-btn"
          :disabled="(revision || 0) >= (latestRevision || 0)"
          title="Next revision"
          @click="emit('revisionChange', (revision || 0) + 1)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 6 15 12 9 18"></polyline>
          </svg>
        </button>
      </div>

      <div class="toolbar-right">
        <button
          v-if="isComplete"
          class="toolbar-btn start-new-btn"
          title="Start new generation"
          @click="emit('startNew')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span class="start-new-label">New</span>
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

      <!-- Preview frame (only when job is done) -->
      <div v-else-if="status !== 'done'" class="preview-loading-state">
        <div class="preview-spinner"></div>
        <span>{{ status === 'running' ? 'Generating...' : 'Queued...' }}</span>
      </div>
      <PreviewFrame
        v-else
        :key="`${jobId}-${revision || 0}`"
        :job-id="jobId!"
        :filename="'index.html'"
        :revision="revision"
      />
    </div>

    <!-- Iterate bar -->
    <div v-if="isComplete" class="iterate-bar">
      <!-- Attachment thumbnails -->
      <div v-if="iterateAttachments.length > 0" class="iterate-attachments">
        <div v-for="att in iterateAttachments" :key="att.id" class="iterate-attach-thumb">
          <img :src="getThumbnailUrl(att.id)" :alt="att.filename" />
          <button class="iterate-attach-remove" @click="removeAttachment(att.id)">&times;</button>
        </div>
      </div>
      <p v-if="attachError" class="iterate-attach-error">{{ attachError }}</p>
      <div class="iterate-input-row">
        <!-- Attach button (Pro only) -->
        <label v-if="isPro" class="iterate-attach-btn" :class="{ disabled: isAttaching }" title="Attach image">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            multiple
            class="iterate-attach-input"
            :disabled="isAttaching"
            @change="handleAttach"
          />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"></path>
          </svg>
        </label>
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
  gap: 0.75rem;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
  flex: 1;
}

/* Job tabs */
.job-tabs {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  min-width: 0;
}

.job-tab {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  font-family: var(--ff-body);
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--ink-light);
  background: transparent;
  border: 1px solid var(--rule);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.job-tab:hover {
  border-color: var(--ink-light);
}

.job-tab.active {
  color: var(--ink);
  border-color: var(--ink);
  background-color: rgba(16, 14, 11, 0.03);
}

.job-tab-status {
  display: flex;
  align-items: center;
}

.dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot-done { background-color: #22c55e; }
.dot-failed { background-color: #ef4444; }
.dot-running { background-color: #f59e0b; animation: pulse 1s ease-in-out infinite; }
.dot-queued { background-color: var(--ink-light); opacity: 0.4; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.revision-nav {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.rev-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  color: var(--ink-light);
  background: transparent;
  border: 1px solid var(--rule);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.rev-btn:hover:not(:disabled) {
  color: var(--ink);
  border-color: var(--ink-light);
}

.rev-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.rev-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ink-light);
  min-width: 3rem;
  text-align: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
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

.start-new-btn {
  width: auto;
  gap: 0.375rem;
  padding: 0 0.625rem;
}

.start-new-label {
  font-size: 0.75rem;
  font-weight: 500;
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

.preview-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--ink-light);
}

.preview-loading-state .preview-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--rule);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
  flex-direction: column;
  gap: 0.5rem;
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

.iterate-input-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
}

.iterate-attachments {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.iterate-attach-thumb {
  position: relative;
  width: 40px;
  height: 40px;
}

.iterate-attach-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--rule);
}

.iterate-attach-remove {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 16px;
  height: 16px;
  font-size: 0.65rem;
  line-height: 16px;
  text-align: center;
  padding: 0;
  background: var(--white);
  border: 1px solid var(--rule);
  border-radius: 50%;
  cursor: pointer;
  color: var(--ink-light);
  display: none;
}
.iterate-attach-thumb:hover .iterate-attach-remove {
  display: block;
}

.iterate-attach-error {
  font-size: 0.7rem;
  color: var(--danger, #e53e3e);
  margin: 0;
}

.iterate-attach-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: 1px solid var(--rule);
  border-radius: 6px;
  cursor: pointer;
  color: var(--ink-light);
  transition: border-color 0.15s, color 0.15s;
}
.iterate-attach-btn:hover:not(.disabled) {
  border-color: var(--accent);
  color: var(--accent);
}
.iterate-attach-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.iterate-attach-input {
  display: none;
}
</style>
