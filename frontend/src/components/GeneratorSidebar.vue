<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const API_BASE = import.meta.env.VITE_API_URL || ''
import { uploadFile, deleteUpload, listUploads, getThumbnailUrl, updateUploadPurpose } from '@/api/uploads'
import type { Upload } from '@/api/uploads'

type Model = 'claude' | 'gemini'
type Mode = 'landing' | 'webapp'

interface StyleOption {
  key: string
  name: string
  preview: string
}

const props = defineProps<{
  preselectedStyle?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  submit: [{
    prompt: string
    models: Model[]
    mode: Mode
    versions: number
    themeMode: 'auto' | 'explicit'
    styles?: string[]
    uploadIds?: string[]
  }]
}>()

const authStore = useAuthStore()

const CREDIT_COSTS: Record<Model, number> = { claude: 10, gemini: 1 }

const prompt = ref('')
const selectedModel = ref<Model>('gemini')
const selectedMode = ref<Mode>('landing')
const selectedVersions = ref(1)
const aiPick = ref(false)
const selectedStyles = ref<Set<string>>(new Set(props.preselectedStyle ? [props.preselectedStyle] : []))
const showAllStyles = ref(false)

// Thumbnail hover preview
const hoveredStyle = ref<string | null>(null)
const hoverTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })
const tooltipError = ref(false)

const TOOLTIP_WIDTH = 320
const TOOLTIP_HEIGHT = 200 // approximate based on 16:10 ratio

function onStyleMouseEnter(styleKey: string, event: MouseEvent) {
  if (hoverTimer.value) clearTimeout(hoverTimer.value)
  tooltipError.value = false

  hoverTimer.value = setTimeout(() => {
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Position to the right by default, but flip to left if not enough space
    let x = rect.right + 12
    if (x + TOOLTIP_WIDTH > viewportWidth - 20) {
      x = rect.left - TOOLTIP_WIDTH - 12
    }

    // Adjust vertical position to stay in viewport
    let y = rect.top
    if (y + TOOLTIP_HEIGHT > viewportHeight - 20) {
      y = viewportHeight - TOOLTIP_HEIGHT - 20
    }
    if (y < 20) y = 20

    tooltipPosition.value = { x, y }
    hoveredStyle.value = styleKey
  }, 200)
}

function onStyleMouseLeave() {
  if (hoverTimer.value) {
    clearTimeout(hoverTimer.value)
    hoverTimer.value = null
  }
  hoveredStyle.value = null
}

function onTooltipImageError() {
  tooltipError.value = true
  hoveredStyle.value = null
}

const maxChars = 2000
const charCount = computed(() => prompt.value.length)

// ── Uploads state ────────────────────────────────────────────────────
const uploads = ref<Upload[]>([])
const uploadBytesUsed = ref(0)
const isUploading = ref(false)
const uploadError = ref('')

const MAX_UPLOAD_BYTES: number = 10_485_760 // 10 MB — matches plan

const uploadStoragePct = computed(() => {
  if (MAX_UPLOAD_BYTES <= 0) return 0
  return Math.min(100, Math.round((uploadBytesUsed.value / MAX_UPLOAD_BYTES) * 100))
})

const allUploadIds = computed(() => uploads.value.map(u => u.id))

async function loadUploads() {
  if (!isPro.value) return
  try {
    const res = await listUploads()
    uploadBytesUsed.value = res.bytesUsed
    uploads.value = res.uploads
  } catch { /* ignore — non-critical */ }
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return

  uploadError.value = ''
  isUploading.value = true

  try {
    for (const file of files) {
      // Default: screenshots/large images → reference, small images → asset.
      // User can toggle after upload.
      const result = await uploadFile(file, 'reference')
      uploadBytesUsed.value += result.sizeBytes
      uploads.value.push(result)
    }
  } catch (err: unknown) {
    uploadError.value = err instanceof Error ? err.message : 'Upload failed'
  } finally {
    isUploading.value = false
    input.value = ''
  }
}

async function toggleUploadPurpose(upload: Upload) {
  const newPurpose = upload.purpose === 'reference' ? 'asset' : 'reference'
  try {
    // Update on server
    await updateUploadPurpose(upload.id, newPurpose)
    // Update locally
    upload.purpose = newPurpose
  } catch { /* ignore */ }
}

async function handleDeleteUpload(id: string) {
  try {
    const upload = uploads.value.find(u => u.id === id)
    await deleteUpload(id)
    uploads.value = uploads.value.filter(u => u.id !== id)
    if (upload) {
      uploadBytesUsed.value = Math.max(0, uploadBytesUsed.value - upload.sizeBytes)
    }
  } catch { /* ignore */ }
}

onMounted(() => {
  loadUploads()
})

// All style options
const styleOptions: StyleOption[] = [
  // Visual Styles
  { key: 'editorial', name: 'Editorial', preview: 'Edit' },
  { key: 'minimalist', name: 'Minimalist', preview: 'Min' },
  { key: 'brutalist', name: 'Brutalist', preview: 'BRUT' },
  { key: 'cyberpunk', name: 'Cyberpunk', preview: 'CYB' },
  { key: 'swiss', name: 'Swiss', preview: 'Swiss' },
  { key: 'darkLuxury', name: 'Dark Luxury', preview: 'Luxe' },
  { key: 'corporate', name: 'Corporate', preview: 'Corp' },
  { key: 'monochrome', name: 'Monochrome', preview: 'Mono' },
  { key: 'neobrutalism', name: 'Neobrutalism', preview: 'NEO' },
  { key: 'retro', name: 'Retro', preview: 'Retro' },
  { key: 'newspaper', name: 'Newspaper', preview: 'NEWS' },
  { key: 'playful', name: 'Playful', preview: 'Play' },
  { key: 'glassmorphism', name: 'Glassmorphism', preview: 'Glass' },
  { key: 'organic', name: 'Organic', preview: 'Org' },
  { key: 'artDeco', name: 'Art Deco', preview: 'Deco' },
  { key: 'neumorphism', name: 'Neumorphism', preview: 'Neu' },
  { key: 'y2k', name: 'Y2K', preview: 'Y2K' },
  { key: 'maximalist', name: 'Maximalist', preview: 'MAX' },
  { key: 'gradient', name: 'Gradient', preview: 'Grad' },
  { key: 'claymorphism', name: 'Claymorphism', preview: 'Clay' },
  { key: 'vaporwave', name: 'Vaporwave', preview: 'Vapor' },
  { key: 'darkTech', name: 'Dark Tech', preview: 'Dark' },
  { key: 'pastel', name: 'Pastel', preview: 'Soft' },
  { key: 'handDrawn', name: 'Hand-drawn', preview: 'Sketch' },
  { key: 'memphis', name: 'Memphis', preview: 'MEM' },
  { key: 'scandinavian', name: 'Scandinavian', preview: 'Nord' },
  // Industry Styles
  { key: 'cleanTech', name: 'Clean Tech', preview: 'Tech' },
  { key: 'warmCorporate', name: 'Warm Corp', preview: 'Warm' },
  { key: 'startupBold', name: 'Startup Bold', preview: 'Bold' },
  { key: 'saasMarketing', name: 'SaaS', preview: 'SaaS' },
  { key: 'dashboardUI', name: 'Dashboard', preview: 'Dash' },
  { key: 'ecommerce', name: 'E-commerce', preview: 'Shop' },
  { key: 'portfolio', name: 'Portfolio', preview: 'Folio' },
  { key: 'documentation', name: 'Docs', preview: 'Docs' },
  { key: 'healthcare', name: 'Healthcare', preview: 'Health' },
  { key: 'fintech', name: 'Fintech', preview: 'Fin' },
  { key: 'media', name: 'Media', preview: 'Media' },
  { key: 'government', name: 'Government', preview: 'Gov' },
  { key: 'education', name: 'Education', preview: 'Edu' },
  { key: 'restaurant', name: 'Restaurant', preview: 'Food' },
  { key: 'realEstate', name: 'Real Estate', preview: 'Home' },
  { key: 'travel', name: 'Travel', preview: 'Travel' },
  { key: 'fitness', name: 'Fitness', preview: 'Fit' },
  { key: 'nonprofit', name: 'Non-profit', preview: 'NGO' },
  { key: 'agency', name: 'Agency', preview: 'Agency' },
  { key: 'events', name: 'Events', preview: 'Event' },
  { key: 'gaming', name: 'Gaming', preview: 'Game' },
  { key: 'legal', name: 'Legal', preview: 'Legal' },
]

const visibleStyles = computed(() =>
  showAllStyles.value ? styleOptions : styleOptions.slice(0, 12)
)

// Initialize with preselected style
watch(() => props.preselectedStyle, (newStyle) => {
  if (newStyle) {
    selectedStyles.value = new Set([newStyle])
    aiPick.value = false
  }
}, { immediate: true })

const isValid = computed(() => {
  return prompt.value.trim().length > 0 && (aiPick.value || selectedStyles.value.size > 0)
})

const user = computed(() => authStore.user)

const isPro = computed(() => user.value?.plan === 'pro')
const isFreePlan = computed(() => !user.value || user.value.plan === 'free')

const maxStyles = computed(() => isPro.value ? 4 : 2)
const maxVersions = computed(() => isPro.value ? 4 : 2)

const creditsRemaining = computed(() => {
  if (!user.value) return 0
  return Math.max(0, user.value.creditsLimit - user.value.creditsUsed)
})

const generationsRemaining = computed(() => {
  if (!user.value) return 3
  return Math.max(0, user.value.generationsLimit - user.value.generationsUsed)
})

const estimatedCreditCost = computed(() => {
  const stylesCount = aiPick.value ? 1 : Math.max(selectedStyles.value.size, 1)
  return CREDIT_COSTS[selectedModel.value] * stylesCount * selectedVersions.value
})

const usageNote = computed(() => {
  if (!user.value) return '3 generations remaining this month'
  if (isPro.value) {
    if (creditsRemaining.value > 0) {
      return `${estimatedCreditCost.value} credits — ${creditsRemaining.value} remaining`
    }
    return `${generationsRemaining.value} free Gemini generation${generationsRemaining.value !== 1 ? 's' : ''} remaining`
  }
  return `${generationsRemaining.value} generation${generationsRemaining.value !== 1 ? 's' : ''} remaining this month`
})

function selectModel(model: Model) {
  if (model === 'claude' && isFreePlan.value) return
  selectedModel.value = model
}

function selectMode(mode: Mode) {
  selectedMode.value = mode
}

function selectVersions(count: number) {
  if (count > maxVersions.value) return
  selectedVersions.value = count
}

function toggleAiPick() {
  aiPick.value = !aiPick.value
  if (aiPick.value) {
    selectedStyles.value.clear()
  }
}

function toggleStyle(key: string) {
  aiPick.value = false
  const s = new Set(selectedStyles.value)
  if (s.has(key)) {
    s.delete(key)
  } else {
    if (s.size >= maxStyles.value) return
    s.add(key)
  }
  selectedStyles.value = s
}

function handleSubmit() {
  if (!isValid.value || props.disabled) return

  emit('submit', {
    prompt: prompt.value.trim(),
    models: [selectedModel.value],
    mode: selectedMode.value,
    versions: selectedVersions.value,
    themeMode: aiPick.value ? 'auto' : 'explicit',
    styles: aiPick.value ? undefined : [...selectedStyles.value],
    uploadIds: allUploadIds.value.length > 0 ? allUploadIds.value : undefined,
  })
}

function setExamplePrompt(text: string) {
  prompt.value = text
}

defineExpose({ setExamplePrompt })
</script>

<template>
  <aside class="generator-sidebar">
    <!-- Step 1: Describe -->
    <div class="gen-section">
      <p class="gen-section-label">
        <span class="num">01</span> Describe your project
      </p>
      <textarea
        v-model="prompt"
        class="gen-textarea"
        :maxlength="maxChars"
        placeholder="e.g. A landing page for a developer CLI tool. Technical but approachable. Dark theme with a hint of green. Clean layout, monospace font, strong CTA."
        :disabled="disabled"
      ></textarea>
      <p class="gen-char-count">{{ charCount }} / {{ maxChars }}</p>
    </div>

    <!-- Step 1.5: Images (Pro only) -->
    <div class="gen-section">
      <p class="gen-section-label">
        <span class="num">&#128206;</span> Images
        <span v-if="!isPro" class="pro-badge-sm">Pro</span>
      </p>

      <!-- Free users: upgrade prompt -->
      <div v-if="!isPro" class="upload-locked">
        <p class="upload-locked-text">Upload reference designs and your own assets (logos, photos).</p>
      </div>

      <!-- Pro users: unified upload UI -->
      <template v-else>
        <!-- Uploaded images list -->
        <div v-if="uploads.length > 0" class="upload-list">
          <div v-for="u in uploads" :key="u.id" class="upload-item">
            <img :src="getThumbnailUrl(u.id)" :alt="u.filename" class="upload-item-thumb" />
            <div class="upload-item-info">
              <span class="upload-item-name">{{ u.filename }}</span>
              <button
                class="upload-purpose-toggle"
                :class="u.purpose"
                :disabled="disabled"
                @click="toggleUploadPurpose(u)"
              >
                {{ u.purpose === 'reference' ? 'Reference' : 'Asset' }}
              </button>
            </div>
            <button
              class="upload-delete-btn"
              title="Remove"
              :disabled="disabled"
              @click="handleDeleteUpload(u.id)"
            >&times;</button>
          </div>
        </div>

        <!-- Drop zone / add button -->
        <label class="upload-drop-zone" :class="{ disabled: disabled || isUploading }">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            multiple
            class="upload-file-input"
            :disabled="disabled || isUploading"
            @change="handleFileUpload($event)"
          />
          <span v-if="isUploading" class="upload-drop-label">Uploading…</span>
          <span v-else-if="uploads.length === 0" class="upload-drop-label">Drop images or click to browse</span>
          <span v-else class="upload-drop-label">+ Add more images</span>
        </label>

        <p v-if="uploads.length > 0" class="upload-hint">
          <strong>Reference</strong> = AI studies the design &nbsp;
          <strong>Asset</strong> = included in website. Click to toggle.
        </p>

        <!-- Error -->
        <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>

        <!-- Storage bar -->
        <div class="upload-storage">
          <div class="upload-storage-bar">
            <div class="upload-storage-fill" :style="{ width: uploadStoragePct + '%' }"></div>
          </div>
          <p class="upload-storage-text">
            {{ (uploadBytesUsed / 1024 / 1024).toFixed(1) }} MB / {{ (MAX_UPLOAD_BYTES / 1024 / 1024).toFixed(0) }} MB
          </p>
        </div>
      </template>
    </div>

    <!-- Step 2: AI Model -->
    <div class="gen-section">
      <p class="gen-section-label">
        <span class="num">02</span> AI model
      </p>
      <div class="model-toggle">
        <button
          class="model-btn"
          :class="{ active: selectedModel === 'claude', locked: isFreePlan }"
          :disabled="disabled || isFreePlan"
          @click="selectModel('claude')"
        >
          <span class="model-icon">&#10022;</span> Claude
          <span v-if="isFreePlan" class="model-badge">Pro</span>
          <span v-else-if="isPro" class="model-credit-hint">{{ CREDIT_COSTS.claude }} cr</span>
        </button>
        <button
          class="model-btn"
          :class="{ active: selectedModel === 'gemini' }"
          :disabled="disabled"
          @click="selectModel('gemini')"
        >
          <span class="model-icon">&#9670;</span> Gemini
          <span v-if="isPro" class="model-credit-hint">{{ CREDIT_COSTS.gemini }} cr</span>
        </button>
      </div>
    </div>

    <!-- Step 3: Mode -->
    <div class="gen-section">
      <p class="gen-section-label">
        <span class="num">03</span> Output mode
      </p>
      <div class="mode-options">
        <div
          class="mode-option"
          :class="{ selected: selectedMode === 'landing' }"
          @click="selectMode('landing')"
        >
          <div class="mode-radio"></div>
          <div>
            <span class="mode-label">Single page</span>
            <p class="mode-desc">Landing page, hero section, or one-page site.</p>
          </div>
        </div>
        <div
          class="mode-option"
          :class="{ selected: selectedMode === 'webapp' }"
          @click="selectMode('webapp')"
        >
          <div class="mode-radio"></div>
          <div>
            <span class="mode-label">Multi-page webapp</span>
            <p class="mode-desc">Full app with nav, dashboard, and linked pages.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 4: Versions -->
    <div class="gen-section">
      <p class="gen-section-label">
        <span class="num">04</span> How many versions?
      </p>
      <div class="version-count-group">
        <button
          v-for="n in 4"
          :key="n"
          class="version-btn"
          :class="{ active: selectedVersions === n, locked: n > maxVersions }"
          :disabled="disabled || n > maxVersions"
          @click="selectVersions(n)"
        >
          {{ n }}
        </button>
      </div>
      <p class="gen-hint">Multiple versions = more creative directions to choose from.</p>
    </div>

    <!-- Step 5: Style -->
    <div class="gen-section">
      <p class="gen-section-label">
        <span class="num">05</span> Design style
      </p>
      <button
        class="gen-ai-pick-btn"
        :class="{ active: aiPick }"
        :disabled="disabled"
        @click="toggleAiPick"
      >
        <span class="ai-icon">&#10022;</span> Let AI pick based on my prompt
      </button>
      <p v-if="selectedStyles.size > 0" class="gen-hint" style="margin-top: 0; margin-bottom: 0.75rem;">
        {{ selectedStyles.size }} / {{ maxStyles }} styles selected
      </p>
      <div class="gen-style-grid">
        <div
          v-for="style in visibleStyles"
          :key="style.key"
          class="gen-style-card"
          :class="{ selected: selectedStyles.has(style.key) && !aiPick }"
          @click="toggleStyle(style.key)"
          @mouseenter="onStyleMouseEnter(style.key, $event)"
          @mouseleave="onStyleMouseLeave"
        >
          <span class="gen-style-name">{{ style.name }}</span>
          <span class="gen-style-preview" :class="`sn-${style.key}`">{{ style.preview }}</span>
        </div>
      </div>

      <!-- Thumbnail tooltip -->
      <Teleport to="body">
        <Transition name="tooltip">
          <div
            v-if="hoveredStyle && !tooltipError"
            class="style-thumbnail-tooltip"
            :style="{ left: tooltipPosition.x + 'px', top: tooltipPosition.y + 'px' }"
          >
            <img
              :src="`${API_BASE}/api/examples/${hoveredStyle}/thumbnail.png`"
              :alt="hoveredStyle"
              @error="onTooltipImageError"
            />
          </div>
        </Transition>
      </Teleport>
      <div class="style-link">
        <button class="btn-ghost" @click="showAllStyles = !showAllStyles">
          {{ showAllStyles ? 'Show fewer styles' : `Show all ${styleOptions.length} styles` }}
        </button>
      </div>
    </div>

    <!-- Generate Button -->
    <div class="gen-submit-area">
      <button
        class="btn-generate"
        :disabled="!isValid || disabled"
        @click="handleSubmit"
      >
        <span v-if="!disabled" class="btn-generate-icon">&#9889;</span>
        <span v-else class="btn-generate-spinner"></span>
        {{ disabled ? 'Generating...' : 'Generate design' }}
      </button>
      <p class="gen-free-note">
        {{ usageNote }}
      </p>
    </div>
  </aside>
</template>

<style scoped>
.generator-sidebar {
  background-color: var(--bg);
  border-right: 1px solid var(--rule);
  padding: 2rem;
  overflow-y: auto;
  height: calc(100vh - 62px);
}

.gen-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--rule);
}

.gen-section:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.gen-section-label {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--ink);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.gen-section-label .num {
  font-family: var(--ff-display);
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--ink-light);
}

.gen-textarea {
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  font-family: var(--ff-body);
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--ink);
  background-color: var(--white);
  border: 1px solid var(--rule);
  resize: vertical;
  transition: border-color 0.2s ease;
}

.gen-textarea:focus {
  outline: none;
  border-color: var(--ink);
}

.gen-textarea::placeholder {
  color: var(--ink-light);
}

.gen-char-count {
  font-size: 0.6875rem;
  color: var(--ink-light);
  text-align: right;
  margin-top: 0.5rem;
}

/* Model Toggle */
.model-toggle {
  display: flex;
  gap: 0.5rem;
}

.model-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-family: var(--ff-body);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ink-light);
  background-color: transparent;
  border: 1px solid var(--rule);
  cursor: pointer;
  transition: all 0.2s ease;
}

.model-btn:hover {
  border-color: var(--ink);
  color: var(--ink);
}

.model-btn.active {
  background-color: var(--ink);
  border-color: var(--ink);
  color: var(--white);
}

.model-icon {
  font-size: 1rem;
}

.model-btn.locked {
  opacity: 0.45;
  cursor: not-allowed;
}

.model-badge {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: var(--accent);
  color: var(--white);
  padding: 0.1rem 0.35rem;
  border-radius: 2px;
}

.model-credit-hint {
  font-size: 0.625rem;
  font-weight: 500;
  color: var(--ink-light);
  opacity: 0.7;
}

.model-btn.active .model-credit-hint {
  color: rgba(255, 255, 255, 0.6);
}

/* Mode Options */
.mode-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mode-option {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: transparent;
  border: 1px solid var(--rule);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-option:hover {
  border-color: var(--ink);
}

.mode-option.selected {
  background-color: rgba(16, 14, 11, 0.03);
  border-color: var(--ink);
}

.mode-radio {
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--ink-light);
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 2px;
  position: relative;
}

.mode-option.selected .mode-radio {
  border-color: var(--accent);
}

.mode-option.selected .mode-radio::after {
  content: '';
  position: absolute;
  inset: 3px;
  background-color: var(--accent);
  border-radius: 50%;
}

.mode-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ink);
  display: block;
  margin-bottom: 0.25rem;
}

.mode-desc {
  font-size: 0.75rem;
  color: var(--ink-light);
  line-height: 1.4;
}

/* Version Count */
.version-count-group {
  display: flex;
  gap: 0.5rem;
}

.version-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--ff-display);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ink-light);
  background-color: transparent;
  border: 1px solid var(--rule);
  cursor: pointer;
  transition: all 0.2s ease;
}

.version-btn:hover:not(:disabled) {
  border-color: var(--ink);
  color: var(--ink);
}

.version-btn.locked {
  opacity: 0.35;
  cursor: not-allowed;
}

.version-btn.active {
  background-color: var(--ink);
  border-color: var(--ink);
  color: var(--white);
}

.gen-hint {
  font-size: 0.6875rem;
  color: var(--ink-light);
  margin-top: 0.75rem;
}

/* Style Selection */
.gen-ai-pick-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  font-family: var(--ff-body);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ink);
  background-color: transparent;
  border: 1.5px dashed var(--rule);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}

.gen-ai-pick-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.gen-ai-pick-btn.active {
  background-color: var(--accent);
  border-style: solid;
  border-color: var(--accent);
  color: var(--white);
}

.ai-icon {
  font-size: 1rem;
}

.gen-style-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.gen-style-card {
  padding: 0.75rem;
  background-color: transparent;
  border: 1px solid var(--rule);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.gen-style-card:hover {
  border-color: var(--ink);
}

.gen-style-card.selected {
  background-color: rgba(204, 50, 9, 0.06);
  border-color: var(--accent);
}

.gen-style-name {
  display: block;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--ink-light);
  margin-bottom: 0.5rem;
}

.gen-style-preview {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1;
}

/* Style preview treatments */
.sn-editorial { font-family: var(--ff-display); font-style: italic; }
.sn-minimalist { font-weight: 300; letter-spacing: 0.1em; }
.sn-brutalist { font-weight: 900; text-transform: uppercase; }
.sn-cyberpunk { font-weight: 700; letter-spacing: 0.05em; }
.sn-swiss { font-weight: 500; }
.sn-darkLuxury { font-family: var(--ff-display); letter-spacing: 0.15em; }
.sn-corporate { font-weight: 600; }
.sn-monochrome { font-weight: 600; }
.sn-neobrutalism { font-weight: 900; text-transform: uppercase; }
.sn-retro { font-weight: 900; }
.sn-newspaper { font-family: var(--ff-display); font-weight: 900; }
.sn-playful { font-weight: 700; }
.sn-glassmorphism { font-weight: 300; font-style: italic; }
.sn-organic { font-weight: 500; font-style: italic; }
.sn-artDeco { font-family: var(--ff-display); letter-spacing: 0.1em; text-transform: uppercase; }
.sn-neumorphism { font-weight: 300; }
.sn-y2k { font-weight: 900; }
.sn-maximalist { font-weight: 900; text-transform: uppercase; }
.sn-cleanTech { font-weight: 400; letter-spacing: 0.05em; }
.sn-warmCorporate { font-weight: 500; }
.sn-startupBold { font-weight: 800; }
.sn-saasMarketing { font-weight: 600; }
.sn-dashboardUI { font-weight: 500; font-family: monospace; }
.sn-ecommerce { font-weight: 600; }
.sn-portfolio { font-family: var(--ff-display); font-weight: 400; }
.sn-documentation { font-family: monospace; font-weight: 500; }
.sn-healthcare { font-weight: 500; }
.sn-fintech { font-weight: 600; letter-spacing: 0.05em; }
.sn-media { font-weight: 700; }
.sn-government { font-weight: 600; text-transform: uppercase; }

.style-link {
  margin-top: 1rem;
}

.btn-ghost {
  font-family: var(--ff-body);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ink-light);
  text-decoration: none;
  background: none;
  border: none;
  border-bottom: 1px solid var(--rule);
  padding: 0 0 2px;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.btn-ghost:hover {
  color: var(--ink);
  border-color: var(--ink);
}

/* Submit Area */
.gen-submit-area {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--rule);
}

.btn-generate {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.25rem 2rem;
  font-family: var(--ff-body);
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--white);
  background-color: var(--accent);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.btn-generate:hover:not(:disabled) {
  background-color: var(--accent-warm);
  transform: translateY(-1px);
}

.btn-generate:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-generate-icon {
  font-size: 1.25rem;
}

.btn-generate-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.gen-free-note {
  font-size: 0.6875rem;
  color: var(--ink-light);
  text-align: center;
  margin-top: 0.75rem;
}

/* ── Upload section ──────────────────────────────────────────────── */

.pro-badge-sm {
  display: inline-block;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--accent);
  color: #fff;
  padding: 0.1em 0.45em;
  border-radius: 4px;
  vertical-align: middle;
  margin-left: 0.35em;
}

.upload-locked {
  padding: 0.75rem;
  border: 1px dashed var(--border);
  border-radius: 8px;
  text-align: center;
}

.upload-locked-text {
  font-size: 0.75rem;
  color: var(--ink-light);
  margin: 0;
}

.upload-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.upload-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  background: var(--surface, #f7f7f7);
  border-radius: 8px;
}

.upload-item-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.upload-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.upload-item-name {
  font-size: 0.7rem;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-purpose-toggle {
  display: inline-flex;
  align-items: center;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.15em 0.5em;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
  width: fit-content;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.upload-purpose-toggle.reference {
  background: #ede9fe;
  color: #6d28d9;
  border-color: #c4b5fd;
}
.upload-purpose-toggle.asset {
  background: #e0f2fe;
  color: #0369a1;
  border-color: #7dd3fc;
}
.upload-purpose-toggle:hover:not(:disabled) {
  opacity: 0.8;
}

.upload-delete-btn {
  background: none;
  border: none;
  color: var(--ink-light);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0 0.25rem;
  line-height: 1;
  flex-shrink: 0;
  transition: color 0.15s;
}
.upload-delete-btn:hover {
  color: var(--danger, #e53e3e);
}

.upload-drop-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  border: 1.5px dashed var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.upload-drop-zone:hover:not(.disabled) {
  border-color: var(--accent);
  background: var(--surface-hover, rgba(0,0,0,0.02));
}
.upload-drop-zone.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-drop-label {
  font-size: 0.75rem;
  color: var(--ink-light);
}

.upload-file-input {
  display: none;
}

.upload-hint {
  font-size: 0.65rem;
  color: var(--ink-light);
  margin: 0.35rem 0 0;
  line-height: 1.4;
}

.upload-error {
  font-size: 0.7rem;
  color: var(--danger, #e53e3e);
  margin: 0.25rem 0 0;
}

.upload-storage {
  margin-top: 0.5rem;
}

.upload-storage-bar {
  width: 100%;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
}

.upload-storage-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.upload-storage-text {
  font-size: 0.65rem;
  color: var(--ink-light);
  margin: 0.2rem 0 0;
}

/* Thumbnail Tooltip */
.style-thumbnail-tooltip {
  position: fixed;
  z-index: 9999;
  background: var(--bg);
  border: 1px solid var(--rule);
  border-radius: 6px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  pointer-events: none;
}

.style-thumbnail-tooltip img {
  display: block;
  width: 320px;
  height: auto;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  object-position: top left;
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
