import { ref, onUnmounted, type Ref } from 'vue'

export type SSEEventType = 'progress' | 'done' | 'error'

export interface SSEEvent {
  jobId: string
  type: SSEEventType
  message?: string
  timestamp: number
}

export interface UseSSEReturn {
  status: Ref<SSEEventType | 'connecting' | 'disconnected'>
  message: Ref<string>
  error: Ref<string | null>
  isComplete: Ref<boolean>
  connect: () => void
  disconnect: () => void
}

/**
 * Composable for connecting to job events SSE stream.
 *
 * @param jobId - The job ID to subscribe to
 * @param options.autoConnect - Whether to connect immediately (default: true)
 * @param options.onProgress - Callback for progress events
 * @param options.onDone - Callback when job completes
 * @param options.onError - Callback when job fails
 */
export function useSSE(
  jobId: string,
  options: {
    autoConnect?: boolean
    onProgress?: (event: SSEEvent) => void
    onDone?: (event: SSEEvent) => void
    onError?: (event: SSEEvent) => void
  } = {}
): UseSSEReturn {
  const { autoConnect = true, onProgress, onDone, onError } = options

  const status = ref<SSEEventType | 'connecting' | 'disconnected'>('disconnected')
  const message = ref('')
  const error = ref<string | null>(null)
  const isComplete = ref(false)

  let eventSource: EventSource | null = null

  function connect() {
    if (eventSource) {
      eventSource.close()
    }

    status.value = 'connecting'
    error.value = null

    eventSource = new EventSource(`/api/jobs/${jobId}/events`)

    eventSource.onopen = () => {
      // Status will be updated when we receive an event
    }

    eventSource.onmessage = (e) => {
      try {
        const event: SSEEvent = JSON.parse(e.data)

        status.value = event.type

        if (event.message) {
          message.value = event.message
        }

        switch (event.type) {
          case 'progress':
            onProgress?.(event)
            break
          case 'done':
            isComplete.value = true
            onDone?.(event)
            disconnect()
            break
          case 'error':
            error.value = event.message || 'Job failed'
            isComplete.value = true
            onError?.(event)
            disconnect()
            break
        }
      } catch (err) {
        console.error('Failed to parse SSE event:', err)
      }
    }

    eventSource.onerror = () => {
      // EventSource will automatically retry, but we track the disconnect
      if (eventSource?.readyState === EventSource.CLOSED) {
        status.value = 'disconnected'
        error.value = 'Connection closed unexpectedly'
      }
    }
  }

  function disconnect() {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    if (status.value === 'connecting' || status.value === 'progress') {
      status.value = 'disconnected'
    }
  }

  if (autoConnect) {
    connect()
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    status,
    message,
    error,
    isComplete,
    connect,
    disconnect
  }
}
