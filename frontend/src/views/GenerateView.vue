<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GeneratorSidebar from '@/components/GeneratorSidebar.vue'
import GeneratorOutput from '@/components/GeneratorOutput.vue'
import { useGenerationsStore } from '@/stores/generations'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { startSession, sendMessage } from '@/api/iterate'
import { getById as getJobById } from '@/api/jobs'
import type { CreateGenerationRequest, JobStatus } from '@/api/generations'

const route = useRoute()
const router = useRouter()
const generationsStore = useGenerationsStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

// Form state
const preselectedStyle = route.query.style as string | undefined
const isGenerating = ref(false)

// Job tracking — supports multiple jobs per generation
interface TrackedJob {
  id: string
  styleKey: string
  styleName: string
  status: JobStatus
  statusMessage?: string
}

const jobs = ref<TrackedJob[]>([])
const activeJobIndex = ref(0)
const currentSessionId = ref<string | undefined>()
const revision = ref(0)
const latestRevision = ref(0)

const activeJob = computed(() => jobs.value[activeJobIndex.value])
const currentJobId = computed(() => activeJob.value?.id)
const jobStatus = computed(() => activeJob.value?.status)
const statusMessage = computed(() => activeJob.value?.statusMessage)

// SSE connections — one per job
const eventSources = ref<Map<string, EventSource>>(new Map())

function connectSSE(jobId: string) {
  if (eventSources.value.has(jobId)) return

  const es = new EventSource(`/api/jobs/${jobId}/events`)

  es.onmessage = (e) => {
    try {
      const event = JSON.parse(e.data)
      const job = jobs.value.find(j => j.id === jobId)
      if (!job) return

      if (event.type === 'status' || event.type === 'running') {
        job.status = 'running'
      }
      if (event.message) {
        job.statusMessage = event.message
      }

      if (event.type === 'done') {
        job.status = 'done'
        job.statusMessage = 'Complete'
        disconnectSSE(jobId)
        checkAllDone()
      } else if (event.type === 'error') {
        job.status = 'failed'
        job.statusMessage = event.message || 'Job failed'
        disconnectSSE(jobId)
        checkAllDone()
      }
    } catch (err) {
      console.error('Failed to parse SSE event:', err)
    }
  }

  es.onerror = () => {
    if (es.readyState === EventSource.CLOSED) {
      const job = jobs.value.find(j => j.id === jobId)
      if (job && job.status !== 'done' && job.status !== 'failed') {
        job.status = 'failed'
        job.statusMessage = 'Connection lost'
      }
      disconnectSSE(jobId)
      checkAllDone()
    }
  }

  eventSources.value.set(jobId, es)
}

function disconnectSSE(jobId?: string) {
  if (jobId) {
    const es = eventSources.value.get(jobId)
    if (es) {
      es.close()
      eventSources.value.delete(jobId)
    }
  } else {
    // Disconnect all
    for (const es of eventSources.value.values()) {
      es.close()
    }
    eventSources.value.clear()
  }
}

function checkAllDone() {
  const allFinished = jobs.value.every(j => j.status === 'done' || j.status === 'failed')
  if (allFinished) {
    isGenerating.value = false
    const doneCount = jobs.value.filter(j => j.status === 'done').length
    if (doneCount === jobs.value.length) {
      toastStore.success(`All ${doneCount} generation${doneCount > 1 ? 's' : ''} complete!`)
    } else if (doneCount > 0) {
      toastStore.success(`${doneCount} of ${jobs.value.length} generations complete`)
    } else {
      toastStore.error('All generations failed')
    }
  }
}

// Load a previous job if ?jobId= is in the URL
onMounted(async () => {
  const jobId = route.query.jobId as string | undefined
  if (jobId) {
    try {
      const job = await getJobById(jobId)
      jobs.value = [{
        id: job.id,
        styleKey: '',
        styleName: '',
        status: job.status,
        statusMessage: job.status === 'done' ? 'Loaded from history' : job.errorMessage || undefined,
      }]
      activeJobIndex.value = 0
      revision.value = job.latestRevision
      latestRevision.value = job.latestRevision
      if (job.status === 'running' || job.status === 'queued') {
        isGenerating.value = true
        connectSSE(job.id)
      }
    } catch {
      toastStore.error('Failed to load previous generation')
    }
  }
})

// Cleanup on unmount
onUnmounted(() => {
  disconnectSSE()
})

async function handleGenerate(formData: CreateGenerationRequest) {
  // Check auth
  if (!authStore.isAuthenticated) {
    toastStore.info('Please log in to generate designs')
    router.push({ name: 'login', query: { redirect: '/generate' } })
    return
  }

  isGenerating.value = true
  currentSessionId.value = undefined
  revision.value = 0
  latestRevision.value = 0

  try {
    const response = await generationsStore.create(formData)

    jobs.value = response.jobs.map(j => ({
      id: j.id,
      styleKey: j.styleKey,
      styleName: j.styleName,
      status: 'queued' as JobStatus,
      statusMessage: 'Queued...',
    }))
    activeJobIndex.value = 0

    // Connect SSE for each job
    for (const job of response.jobs) {
      connectSSE(job.id)
    }
  } catch (err: unknown) {
    isGenerating.value = false
    jobs.value = []
    const message = err instanceof Error ? err.message : 'Failed to start generation'
    toastStore.error(message)
  }
}

async function handleIterate(prompt: string) {
  if (!currentJobId.value) return

  isGenerating.value = true
  const job = activeJob.value
  if (job) {
    job.status = 'running'
    job.statusMessage = 'Refining design...'
  }

  try {
    // Start session if not already started
    if (!currentSessionId.value) {
      const session = await startSession(currentJobId.value)
      currentSessionId.value = session.sessionId
    }

    // Send iterate message — this is synchronous (no SSE needed)
    const result = await sendMessage(currentSessionId.value, prompt)

    // Update UI directly — files are already saved to DB
    isGenerating.value = false
    const newRevision = result.revision ?? revision.value + 1
    revision.value = newRevision
    latestRevision.value = newRevision
    if (job) {
      job.status = 'done'
      job.statusMessage = 'Design updated'
    }
    toastStore.success('Design refined!')
  } catch (err: unknown) {
    isGenerating.value = false
    if (job) {
      job.status = 'done' // Revert to done state
    }
    const message = err instanceof Error ? err.message : 'Failed to refine design'
    toastStore.error(message)
  }
}

function handleJobChange(index: number) {
  activeJobIndex.value = index
  // Reset session and revision when switching jobs
  currentSessionId.value = undefined
  revision.value = 0
  latestRevision.value = 0
  // TODO: load latestRevision from the job if needed
}

function handleRevisionChange(rev: number) {
  revision.value = rev
}

function handleStartNew() {
  jobs.value = []
  activeJobIndex.value = 0
  currentSessionId.value = undefined
  revision.value = 0
  latestRevision.value = 0
  isGenerating.value = false
  disconnectSSE()
  if (route.query.jobId) {
    router.replace({ query: {} })
  }
}

function handleExampleClick(prompt: string) {
  handleGenerate({
    prompt,
    mode: 'landing',
    themeMode: 'auto',
    models: ['claude'],
    versions: 1
  })
}
</script>

<template>
  <div class="generate-page">
    <div class="generate-container">
      <aside class="generate-sidebar">
        <GeneratorSidebar
          :preselected-style="preselectedStyle"
          :disabled="isGenerating"
          @submit="handleGenerate"
        />
      </aside>
      <main class="generate-output">
        <GeneratorOutput
          :job-id="currentJobId"
          :status="jobStatus"
          :status-message="statusMessage"
          :jobs="jobs"
          :active-job-index="activeJobIndex"
          :revision="revision"
          :latest-revision="latestRevision"
          @iterate="handleIterate"
          @example-click="handleExampleClick"
          @revision-change="handleRevisionChange"
          @start-new="handleStartNew"
          @job-change="handleJobChange"
        />
      </main>
    </div>
  </div>
</template>

<style scoped>
.generate-page {
  min-height: calc(100vh - 62px);
  background-color: var(--bg);
}

.generate-container {
  display: grid;
  grid-template-columns: 380px 1fr;
  min-height: calc(100vh - 62px);
}

.generate-sidebar {
  border-right: 1px solid var(--rule);
  background-color: var(--white);
  overflow-y: auto;
}

.generate-output {
  padding: 1.5rem;
  overflow: hidden;
}

/* Responsive */
@media (max-width: 1024px) {
  .generate-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .generate-sidebar {
    border-right: none;
    border-bottom: 1px solid var(--rule);
    max-height: 50vh;
  }

  .generate-output {
    min-height: 400px;
  }
}

@media (max-width: 640px) {
  .generate-output {
    padding: 1rem;
  }
}
</style>
