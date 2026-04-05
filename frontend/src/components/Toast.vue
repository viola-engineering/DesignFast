<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

type ToastType = 'success' | 'error' | 'info'

const props = withDefaults(defineProps<{
  id: string
  message: string
  type?: ToastType
  duration?: number
}>(), {
  type: 'info',
  duration: 4000
})

const emit = defineEmits<{
  dismiss: [id: string]
}>()

const show = ref(false)
let timeout: ReturnType<typeof setTimeout> | null = null

const iconPath = computed(() => {
  switch (props.type) {
    case 'success':
      return 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    case 'error':
      return 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'
    default:
      return 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z'
  }
})

function dismiss() {
  show.value = false
  setTimeout(() => {
    emit('dismiss', props.id)
  }, 300)
}

onMounted(() => {
  requestAnimationFrame(() => {
    show.value = true
  })

  if (props.duration > 0) {
    timeout = setTimeout(dismiss, props.duration)
  }
})

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout)
  }
})
</script>

<template>
  <div class="toast" :class="[`toast-${type}`, { show }]">
    <svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" :d="iconPath" />
    </svg>
    <span class="toast-message">{{ message }}</span>
    <button class="toast-close" @click="dismiss" aria-label="Dismiss">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: var(--ink);
  color: var(--white);
  padding: 0.875rem 1.25rem;
  font-size: 0.875rem;
  line-height: 1.4;
  transform: translateY(1rem);
  opacity: 0;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
  box-shadow: 0 4px 24px rgba(16, 14, 11, 0.15);
  max-width: 24rem;
}

.toast.show {
  transform: translateY(0);
  opacity: 1;
}

.toast-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
}

.toast-close {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: rgba(253, 251, 247, 0.5);
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s ease;
}

.toast-close:hover {
  color: rgba(253, 251, 247, 0.9);
}

.toast-close svg {
  width: 1rem;
  height: 1rem;
}

/* Type variants */
.toast-success .toast-icon {
  color: #34d399;
}

.toast-error {
  background-color: #991b1b;
}

.toast-error .toast-icon {
  color: #fca5a5;
}

.toast-info .toast-icon {
  color: #60a5fa;
}
</style>
