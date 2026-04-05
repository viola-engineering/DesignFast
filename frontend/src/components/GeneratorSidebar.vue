<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

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
  }]
}>()

const authStore = useAuthStore()

const prompt = ref('')
const selectedModel = ref<Model>('claude')
const selectedMode = ref<Mode>('landing')
const selectedVersions = ref(1)
const aiPick = ref(false)
const selectedStyle = ref<string | null>(props.preselectedStyle || null)

const maxChars = 600
const charCount = computed(() => prompt.value.length)

// Style options (subset for quick selection - using correct backend keys)
const styleOptions: StyleOption[] = [
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
  { key: 'playful', name: 'Playful', preview: 'Play' }
]

// Initialize with preselected style
watch(() => props.preselectedStyle, (newStyle) => {
  if (newStyle) {
    selectedStyle.value = newStyle
    aiPick.value = false
  }
}, { immediate: true })

const isValid = computed(() => {
  return prompt.value.trim().length > 0 && (aiPick.value || selectedStyle.value)
})

const user = computed(() => authStore.user)
const generationsRemaining = computed(() => {
  if (!user.value) return 5
  return user.value.generationsLimit - user.value.generationsUsed
})

function selectModel(model: Model) {
  selectedModel.value = model
}

function selectMode(mode: Mode) {
  selectedMode.value = mode
}

function selectVersions(count: number) {
  selectedVersions.value = count
}

function toggleAiPick() {
  aiPick.value = !aiPick.value
  if (aiPick.value) {
    selectedStyle.value = null
  }
}

function selectStyle(key: string) {
  selectedStyle.value = key
  aiPick.value = false
}

function handleSubmit() {
  if (!isValid.value || props.disabled) return

  emit('submit', {
    prompt: prompt.value.trim(),
    models: [selectedModel.value],
    mode: selectedMode.value,
    versions: selectedVersions.value,
    themeMode: aiPick.value ? 'auto' : 'explicit',
    styles: aiPick.value ? undefined : [selectedStyle.value!]
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

    <!-- Step 2: AI Model -->
    <div class="gen-section">
      <p class="gen-section-label">
        <span class="num">02</span> AI model
      </p>
      <div class="model-toggle">
        <button
          class="model-btn"
          :class="{ active: selectedModel === 'claude' }"
          :disabled="disabled"
          @click="selectModel('claude')"
        >
          <span class="model-icon">&#10022;</span> Claude
        </button>
        <button
          class="model-btn"
          :class="{ active: selectedModel === 'gemini' }"
          :disabled="disabled"
          @click="selectModel('gemini')"
        >
          <span class="model-icon">&#9670;</span> Gemini
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
          :class="{ active: selectedVersions === n }"
          :disabled="disabled"
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
      <div class="gen-style-grid">
        <div
          v-for="style in styleOptions"
          :key="style.key"
          class="gen-style-card"
          :class="{ selected: selectedStyle === style.key && !aiPick }"
          @click="selectStyle(style.key)"
        >
          <span class="gen-style-name">{{ style.name }}</span>
          <span class="gen-style-preview" :class="`sn-${style.key}`">{{ style.preview }}</span>
        </div>
      </div>
      <div class="style-link">
        <RouterLink to="/styles" class="btn-ghost">Browse all 30 styles</RouterLink>
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
        {{ generationsRemaining }} generation{{ generationsRemaining !== 1 ? 's' : '' }} remaining this month
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

.version-btn:hover {
  border-color: var(--ink);
  color: var(--ink);
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

.style-link {
  margin-top: 1rem;
}

.btn-ghost {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ink-light);
  text-decoration: none;
  border-bottom: 1px solid var(--rule);
  padding-bottom: 2px;
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
</style>
