<script setup lang="ts">
import { computed } from 'vue'
import { useToastStore } from '@/stores/toast'
import Toast from './Toast.vue'

const toastStore = useToastStore()

const toasts = computed(() => toastStore.toasts)

function handleDismiss(id: string) {
  toastStore.remove(id)
}
</script>

<template>
  <div class="toast-container" aria-live="polite" aria-atomic="true">
    <TransitionGroup name="toast-list">
      <Toast
        v-for="toast in toasts"
        :key="toast.id"
        :id="toast.id"
        :message="toast.message"
        :type="toast.type"
        :duration="toast.duration"
        @dismiss="handleDismiss"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
}

.toast-container > * {
  pointer-events: auto;
}

.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateX(2rem);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateX(2rem);
}

@media (max-width: 640px) {
  .toast-container {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
  }
}
</style>
