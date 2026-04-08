<script setup lang="ts">
import { computed, ref } from 'vue'
import { getPreviewUrl } from '@/api/jobs'

const props = defineProps<{
  jobId: string
  filename?: string
  revision?: number
}>()

const loading = ref(true)
const error = ref(false)
const iframeRef = ref<HTMLIFrameElement | null>(null)

const src = computed(() => getPreviewUrl(props.jobId, props.filename || 'index.html', props.revision))

function onLoad() {
  loading.value = false
  error.value = false
}

function onError() {
  loading.value = false
  error.value = true
}

function print() {
  if (iframeRef.value?.contentWindow) {
    iframeRef.value.contentWindow.print()
  }
}

defineExpose({ print })
</script>

<template>
  <div class="preview-wrapper">
    <div v-if="loading" class="preview-loading">
      <div class="preview-spinner"></div>
      <span>Loading preview...</span>
    </div>
    <div v-if="error && !loading" class="preview-error">
      <span>Failed to load preview</span>
    </div>
    <iframe
      ref="iframeRef"
      v-show="!loading && !error"
      :src="src"
      class="preview-iframe"
      sandbox="allow-scripts allow-same-origin allow-modals"
      @load="onLoad"
      @error="onError"
    ></iframe>
  </div>
</template>

<style scoped>
.preview-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: var(--white);
  border-radius: 4px;
  overflow: hidden;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.preview-loading,
.preview-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--ink-light);
}

.preview-spinner {
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

.preview-error {
  color: #ef4444;
}
</style>
