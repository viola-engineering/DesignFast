<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const API_BASE = import.meta.env.VITE_API_URL || ''

const props = defineProps<{
  visible: boolean
  styleKey: string
  styleName: string
}>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const iframeLoaded = ref(false)

watch(() => props.visible, (visible) => {
  if (visible) {
    iframeLoaded.value = false
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

function onIframeLoad() {
  iframeLoaded.value = true
}

function close() {
  emit('close')
}

function useStyle() {
  close()
  router.push({
    path: '/generate',
    query: { style: props.styleKey }
  })
}

function download() {
  window.open(`${API_BASE}/api/examples/${props.styleKey}/download`, '_blank')
}

function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    close()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    close()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="modal-backdrop"
        @click="handleBackdropClick"
        @keydown="handleKeydown"
        tabindex="0"
      >
        <div class="modal-container">
          <header class="modal-header">
            <div class="modal-title">
              <span class="modal-label">Preview</span>
              <h2>{{ styleName }}</h2>
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" @click="download">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download
              </button>
              <button class="btn-primary" @click="useStyle">
                Use this style
              </button>
              <button class="btn-close" @click="close" aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </header>
          <div class="modal-body">
            <div v-if="!iframeLoaded" class="iframe-loading">
              <div class="spinner"></div>
              <span>Loading preview...</span>
            </div>
            <iframe
              :src="`${API_BASE}/api/examples/${styleKey}/index.html`"
              :class="{ loaded: iframeLoaded }"
              sandbox="allow-scripts allow-same-origin"
              @load="onIframeLoad"
            ></iframe>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-container {
  background: var(--bg);
  border-radius: 8px;
  width: 100%;
  max-width: 1400px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--rule);
  flex-shrink: 0;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-light);
  background: rgba(16, 14, 11, 0.06);
  padding: 0.25rem 0.6rem;
  border-radius: 2px;
}

.modal-title h2 {
  font-family: var(--ff-display);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ink);
  margin: 0;
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--ff-body);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--ink);
  background: none;
  border: 1px solid var(--rule);
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.btn-secondary:hover {
  border-color: var(--ink);
  background: rgba(16, 14, 11, 0.04);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--ff-body);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--white);
  background: var(--accent);
  border: none;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.btn-primary:hover {
  background: var(--accent-warm);
}

.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  color: var(--ink-light);
  cursor: pointer;
  transition: color 0.2s ease;
  margin-left: 0.5rem;
}

.btn-close:hover {
  color: var(--ink);
}

.modal-body {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
}

.iframe-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--ink-light);
  font-size: 0.875rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 2px solid var(--rule);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

iframe {
  width: 100%;
  height: 100%;
  border: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

iframe.loaded {
  opacity: 1;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
  opacity: 0;
}

@media (max-width: 768px) {
  .modal-backdrop {
    padding: 0;
  }

  .modal-container {
    height: 100vh;
    border-radius: 0;
    max-width: 100%;
  }

  .modal-header {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .modal-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
