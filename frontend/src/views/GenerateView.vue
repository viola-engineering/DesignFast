<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GeneratorSidebar from '@/components/GeneratorSidebar.vue'
import GeneratorOutput from '@/components/GeneratorOutput.vue'
import { useGenerationsStore } from '@/stores/generations'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { startSession, sendMessage } from '@/api/iterate'
import type { CreateGenerationRequest, JobStatus } from '@/api/generations'

const route = useRoute()
const router = useRouter()
const generationsStore = useGenerationsStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

// Form state
const preselectedStyle = route.query.style as string | undefined
const isGenerating = ref(false)

// Current job state
const currentJobId = ref<string | undefined>()
const currentSessionId = ref<string | undefined>()
const jobStatus = ref<JobStatus | undefined>()
const statusMessage = ref<string | undefined>()
const versions = ref(1)
const files = ref<string[]>([])

// SSE connection
let eventSource: EventSource | null = null

function connectSSE(jobId: string) {
  disconnectSSE()

  eventSource = new EventSource(`/api/jobs/${jobId}/events`)

  eventSource.onmessage = (e) => {
    try {
      const event = JSON.parse(e.data)
      jobStatus.value = event.type === 'progress' ? 'running' : event.type

      if (event.message) {
        statusMessage.value = event.message
      }

      if (event.type === 'done') {
        isGenerating.value = false
        toastStore.success('Generation complete!')
        disconnectSSE()
      } else if (event.type === 'error') {
        isGenerating.value = false
        jobStatus.value = 'failed'
        statusMessage.value = event.message || 'Job failed'
        toastStore.error('Generation failed: ' + (event.message || 'Unknown error'))
        disconnectSSE()
      }
    } catch (err) {
      console.error('Failed to parse SSE event:', err)
    }
  }

  eventSource.onerror = () => {
    if (eventSource?.readyState === EventSource.CLOSED) {
      if (jobStatus.value !== 'done' && jobStatus.value !== 'failed') {
        jobStatus.value = 'failed'
        statusMessage.value = 'Connection lost'
        isGenerating.value = false
      }
    }
  }
}

function disconnectSSE() {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
}

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
  jobStatus.value = 'queued'
  statusMessage.value = 'Starting generation...'
  versions.value = formData.versions || 1
  currentSessionId.value = undefined

  try {
    const response = await generationsStore.create(formData)

    // Use the first job ID for SSE updates
    if (response.jobs.length > 0) {
      currentJobId.value = response.jobs[0].id
      connectSSE(response.jobs[0].id)
    }
  } catch (err: unknown) {
    isGenerating.value = false
    jobStatus.value = 'failed'
    const message = err instanceof Error ? err.message : 'Failed to start generation'
    statusMessage.value = message
    toastStore.error(message)
  }
}

async function handleIterate(prompt: string) {
  if (!currentJobId.value) return

  isGenerating.value = true
  jobStatus.value = 'running'
  statusMessage.value = 'Refining design...'

  try {
    // Start session if not already started
    if (!currentSessionId.value) {
      const session = await startSession(currentJobId.value)
      currentSessionId.value = session.sessionId
    }

    // Send iterate message
    await sendMessage(currentSessionId.value, prompt)

    // Reconnect SSE for updates
    connectSSE(currentJobId.value)
  } catch (err: unknown) {
    isGenerating.value = false
    jobStatus.value = 'done' // Revert to done state
    const message = err instanceof Error ? err.message : 'Failed to refine design'
    statusMessage.value = message
    toastStore.error(message)
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
          :versions="versions"
          :files="files"
          @iterate="handleIterate"
          @example-click="handleExampleClick"
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
