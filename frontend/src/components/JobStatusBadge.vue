<script setup lang="ts">
import { computed } from 'vue'

type JobStatus = 'queued' | 'running' | 'done' | 'failed'

const props = defineProps<{
  status: JobStatus
  message?: string
}>()

const statusConfig = computed(() => {
  switch (props.status) {
    case 'queued':
      return { label: 'Queued', color: 'status-queued', pulse: false }
    case 'running':
      return { label: props.message || 'Generating...', color: 'status-running', pulse: true }
    case 'done':
      return { label: 'Complete', color: 'status-done', pulse: false }
    case 'failed':
      return { label: props.message || 'Failed', color: 'status-failed', pulse: false }
    default:
      return { label: 'Ready', color: 'status-ready', pulse: false }
  }
})
</script>

<template>
  <div class="output-status" :class="statusConfig.color">
    <span class="status-dot" :class="{ pulse: statusConfig.pulse }"></span>
    <span>{{ statusConfig.label }}</span>
  </div>
</template>

<style scoped>
.output-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ink-light);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--ink-light);
}

.status-queued .status-dot {
  background-color: #f59e0b;
}

.status-running .status-dot {
  background-color: var(--accent);
}

.status-done .status-dot {
  background-color: #10b981;
}

.status-failed .status-dot {
  background-color: #ef4444;
}

.status-dot.pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}
</style>
