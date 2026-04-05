import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
}

let toastId = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  function add(message: string, type: ToastType = 'info', duration = 4000) {
    const id = `toast-${++toastId}`
    toasts.value.push({ id, message, type, duration })
    return id
  }

  function success(message: string, duration = 4000) {
    return add(message, 'success', duration)
  }

  function error(message: string, duration = 5000) {
    return add(message, 'error', duration)
  }

  function info(message: string, duration = 4000) {
    return add(message, 'info', duration)
  }

  function remove(id: string) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  function clear() {
    toasts.value = []
  }

  return {
    toasts,
    add,
    success,
    error,
    info,
    remove,
    clear
  }
})
