<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import StyleCard from '@/components/StyleCard.vue'
import StylePreviewModal from '@/components/StylePreviewModal.vue'
import ScrollReveal from '@/components/ScrollReveal.vue'

type FilterCategory = 'all' | 'minimal' | 'bold' | 'editorial' | 'dark' | 'luxury' | 'technical' | 'retro'

interface StyleDefinition {
  key: string
  name: string
  description: string
  categories: FilterCategory[]
  tags: string[]
}

interface ExampleInfo {
  styleKey: string
  hasHtml: boolean
  hasThumbnail: boolean
}

const activeFilter = ref<FilterCategory>('all')
const availableExamples = ref<Map<string, ExampleInfo>>(new Map())
const previewModal = ref({
  visible: false,
  styleKey: '',
  styleName: '',
})

// Fetch available examples on mount
onMounted(async () => {
  try {
    const res = await fetch('/api/examples')
    if (res.ok) {
      const data = await res.json()
      for (const ex of data.examples) {
        availableExamples.value.set(ex.styleKey, ex)
      }
    }
  } catch (err) {
    console.warn('Failed to fetch examples:', err)
  }
})

function hasExampleThumbnail(styleKey: string): boolean {
  const ex = availableExamples.value.get(styleKey)
  return ex?.hasThumbnail ?? false
}

function openPreview(styleKey: string) {
  const style = allStyles.find(s => s.key === styleKey)
  if (style) {
    previewModal.value = {
      visible: true,
      styleKey,
      styleName: style.name,
    }
  }
}

function closePreview() {
  previewModal.value.visible = false
}

const allStyles: StyleDefinition[] = [
  { key: 'minimalist', name: 'Minimalist', description: 'Whitespace as the hero. Every element earns its place. Nothing decorative, everything intentional.', categories: ['minimal', 'luxury'], tags: ['Whitespace-led', 'High contrast', 'Serif or sans'] },
  { key: 'brutalist', name: 'BRUTALIST', description: 'Raw, confrontational, unapologetic. Makes you look twice. Borders everywhere, no padding wasted on niceness.', categories: ['bold', 'editorial'], tags: ['High impact', 'Grid-forward', 'Monospace'] },
  { key: 'glassmorphism', name: 'Glassmorphism', description: 'Frosted glass surfaces. Depth without weight. Blur, translucency, and soft shadows that feel touchable.', categories: ['minimal', 'dark'], tags: ['Blur effects', 'Translucent', 'Gradient bg'] },
  { key: 'corporate', name: 'Corporate', description: 'Professional done right. Trustworthy without being boring. For B2B products that need to close enterprise deals.', categories: ['technical', 'minimal'], tags: ['Navy palette', 'Trust signals', 'Clean grid'] },
  { key: 'playful', name: 'Playful', description: 'Soft colors, playful energy, rounded everything. Consumer-friendly and delightful. Optimized for likability.', categories: ['bold', 'minimal'], tags: ['Soft palette', 'Rounded UI', 'Playful'] },
  { key: 'darkLuxury', name: 'Dark Luxury', description: 'Quiet confidence on a dark canvas. Premium feel with restraint. For brands that dont need to shout.', categories: ['dark', 'luxury'], tags: ['Dark bg', 'Gold accents', 'Spaced type'] },
  { key: 'editorial', name: 'Editorial', description: 'Magazine-spread energy. Typography as the layout engine. Large serifs, column structures, intelligent white space.', categories: ['editorial', 'luxury'], tags: ['Serif display', 'Column grid', 'Print-inspired'] },
  { key: 'retro', name: 'Retro', description: 'Warm paper, wood type, honest craft vibes. The nostalgia of an era when every design was handmade.', categories: ['retro', 'bold', 'editorial'], tags: ['Warm yellows', 'Wood type', 'Textured'] },
  { key: 'neobrutalism', name: 'Neobrutalism', description: 'Bold colors, thick borders, intentional roughness. Brutalism with a friendlier, more playful attitude.', categories: ['bold', 'editorial'], tags: ['Thick borders', 'Bold colors', 'Shadow offset'] },
  { key: 'organic', name: 'Organic', description: 'Flowing, warm, alive. Anti-grid by nature. Perfect for wellness, food, sustainable brands, and human-first products.', categories: ['minimal', 'luxury', 'editorial'], tags: ['Fluid layout', 'Warm palette', 'Natural texture'] },
  { key: 'cyberpunk', name: 'CYBERPUNK', description: 'Terminal glow. Neon on dark. Earned edge without the cringe. For tools that mean business in the dark.', categories: ['dark', 'bold', 'technical'], tags: ['Dark bg', 'Neon accents', 'Monospace'] },
  { key: 'swiss', name: 'Swiss / International', description: 'Grid-strict. Helvetica-honest. Timeless by design. The backbone of corporate design for 70 years and counting.', categories: ['minimal', 'technical', 'editorial'], tags: ['Grid system', 'Neutral sans', 'Timeless'] },
  { key: 'artDeco', name: 'Art Deco', description: 'Gold, symmetry, geometric ornament. The glamour of the 1920s encoded into modern web components.', categories: ['luxury', 'editorial', 'retro'], tags: ['Gold palette', 'Symmetrical', 'Ornamental'] },
  { key: 'newspaper', name: 'NEWSPAPER', description: 'Ink on paper. Column grids. Front page gravity. The authority of print distilled into a web layout.', categories: ['editorial', 'bold', 'retro'], tags: ['Column grid', 'Display serif', 'Ink tones'] },
  { key: 'neumorphism', name: 'Neumorphism', description: 'Soft UI. Extruded shapes with subtle shadows. A gentler take on skeuomorphism that feels modern and tactile.', categories: ['minimal'], tags: ['Soft shadows', 'Extruded', 'Light bg'] },
  { key: 'monochrome', name: 'Monochrome', description: 'One color, many shades. The discipline of working with constraints. Elegant when you nail it.', categories: ['minimal'], tags: ['Single hue', 'High contrast', 'Type-forward'] },
  { key: 'y2k', name: 'Y2K / 2000s', description: 'Chrome, gradients, bubble fonts. The optimistic tech aesthetic from the turn of the millennium, revived.', categories: ['retro', 'bold'], tags: ['Chrome effects', 'Bubble type', 'Gradient fills'] },
  { key: 'maximalist', name: 'MAXIMALIST', description: 'More is more. Layers, patterns, colors colliding. For brands that refuse to blend into the background.', categories: ['bold'], tags: ['Pattern heavy', 'Color clash', 'Dense layout'] },
  { key: 'cleanTech', name: 'Clean Tech', description: 'The aesthetic of forward-thinking tech companies. Clean, modern, with subtle technological hints.', categories: ['technical', 'minimal'], tags: ['Blue accent', 'Clean lines', 'Modern'] },
  { key: 'warmCorporate', name: 'Warm Corporate', description: 'Corporate professionalism with human warmth. Trustworthy and approachable at the same time.', categories: ['technical'], tags: ['Warm tones', 'Friendly', 'Professional'] },
  { key: 'startupBold', name: 'Startup Bold', description: 'The confident look of funded startups. Bold headlines, vibrant colors, conversion-focused layouts.', categories: ['bold'], tags: ['Bold type', 'Vibrant', 'Conversion-focused'] },
  { key: 'saasMarketing', name: 'SaaS Marketing', description: 'Landing pages that convert. Feature sections, social proof, pricing tables done right.', categories: ['technical'], tags: ['Feature grids', 'Social proof', 'Pricing tables'] },
  { key: 'dashboardUI', name: 'Dashboard UI', description: 'Data-dense interfaces done right. Cards, metrics, tables with clear hierarchy and good information design.', categories: ['technical'], tags: ['Card-based', 'Data-forward', 'Clean hierarchy'] },
  { key: 'ecommerce', name: 'E-commerce', description: 'Product-focused layouts that sell. Category grids, product cards, and checkout flows that convert.', categories: ['technical'], tags: ['Product grids', 'Cart flows', 'Conversion-ready'] },
  { key: 'portfolio', name: 'Portfolio', description: 'Personal brand showcase. Clean, image-forward layouts that let the work speak for itself.', categories: ['minimal'], tags: ['Image-forward', 'Clean grid', 'Personal'] },
  { key: 'documentation', name: 'Documentation', description: 'Technical docs that developers actually want to read. Code blocks, navigation, search-ready.', categories: ['technical'], tags: ['Code blocks', 'Sidebar nav', 'Search-ready'] },
  { key: 'healthcare', name: 'Healthcare', description: 'Trust and professionalism for health-related products. Clean, calming, accessibility-first.', categories: ['technical'], tags: ['Calming colors', 'Accessible', 'Trust-forward'] },
  { key: 'fintech', name: 'Fintech', description: 'The look of modern financial services. Secure, sophisticated, with clear data presentation.', categories: ['technical'], tags: ['Navy/gold', 'Data tables', 'Secure feel'] },
  { key: 'media', name: 'Media', description: 'Content-first layouts for news, blogs, and media sites. Readable, scannable, engagement-focused.', categories: ['editorial'], tags: ['Content-first', 'Readable', 'Engagement'] },
  { key: 'government', name: 'Government', description: 'Accessible, trustworthy, compliant. Clean layouts that meet accessibility standards and inspire confidence.', categories: ['technical'], tags: ['WCAG compliant', 'Trustworthy', 'Clear nav'] }
]

const filters: { label: string; value: FilterCategory }[] = [
  { label: 'All styles', value: 'all' },
  { label: 'Minimal', value: 'minimal' },
  { label: 'Bold', value: 'bold' },
  { label: 'Editorial', value: 'editorial' },
  { label: 'Dark', value: 'dark' },
  { label: 'Luxury', value: 'luxury' },
  { label: 'Technical', value: 'technical' },
  { label: 'Retro', value: 'retro' }
]

const filteredStyles = computed(() => {
  if (activeFilter.value === 'all') {
    return allStyles
  }
  return allStyles.filter(s => s.categories.includes(activeFilter.value))
})

const styleCount = computed(() => filteredStyles.value.length)

function setFilter(filter: FilterCategory) {
  activeFilter.value = filter
}
</script>

<template>
  <div class="styles-page">
    <!-- Page Hero -->
    <section class="page-hero">
      <p class="page-hero-label">Design system</p>
      <h1 class="page-hero-title">
        30 curated styles.<br /><em>Every aesthetic.</em>
      </h1>
      <p class="page-hero-sub">
        Each style is a complete design language - distinct typography,
        layout logic, color rules, and component patterns.
        Not just a color swap. Pick the one that fits, or let AI decide.
      </p>
    </section>

    <!-- Filter Controls -->
    <div class="styles-controls">
      <div class="filter-tabs" role="tablist">
        <button
          v-for="filter in filters"
          :key="filter.value"
          class="filter-tab"
          :class="{ active: activeFilter === filter.value }"
          role="tab"
          :aria-selected="activeFilter === filter.value"
          @click="setFilter(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>
      <span class="styles-count-badge">{{ styleCount }} styles</span>
    </div>

    <!-- Styles Grid -->
    <div class="styles-full-grid">
      <ScrollReveal
        v-for="(style, index) in filteredStyles"
        :key="style.key"
        :delay="(index % 3) * 100"
      >
        <StyleCard
          :style-key="style.key"
          :style-name="style.name"
          :category="style.categories[0]"
          :description="style.description"
          :tags="style.tags"
          :number="allStyles.findIndex(s => s.key === style.key) + 1"
          :has-thumbnail="hasExampleThumbnail(style.key)"
          @preview="openPreview"
        />
      </ScrollReveal>
    </div>

    <!-- Preview Modal -->
    <StylePreviewModal
      :visible="previewModal.visible"
      :style-key="previewModal.styleKey"
      :style-name="previewModal.styleName"
      @close="closePreview"
    />

    <!-- CTA Section -->
    <section class="styles-cta">
      <ScrollReveal>
        <div class="styles-cta-inner">
          <h2 class="styles-cta-title">Ready to generate?</h2>
          <p class="styles-cta-text">Pick a style and describe what you want to build.</p>
          <RouterLink to="/generate" class="btn-primary">
            Start generating <span class="arrow">-></span>
          </RouterLink>
        </div>
      </ScrollReveal>
    </section>
  </div>
</template>

<style scoped>
.styles-page {
  min-height: 100vh;
}

/* Page Hero */
.page-hero {
  padding: 4rem var(--sp-page) 3rem;
  border-bottom: 1px solid var(--rule);
}

.page-hero-label {
  font-size: var(--sz-micro);
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink-light);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-hero-label::before {
  content: '';
  display: inline-block;
  width: 2rem;
  height: 1px;
  background: var(--ink-light);
}

.page-hero-title {
  font-family: var(--ff-display);
  font-size: var(--sz-display);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--ink);
  margin-bottom: 1.5rem;
}

.page-hero-title em {
  color: var(--accent);
  font-style: italic;
}

.page-hero-sub {
  font-size: var(--sz-lead);
  color: var(--ink-light);
  max-width: 50ch;
  line-height: 1.55;
}

/* Filter Controls */
.styles-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem var(--sp-page);
  border-bottom: 1px solid var(--rule);
  position: sticky;
  top: 62px;
  background-color: var(--bg);
  z-index: 50;
}

.filter-tabs {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.filter-tab {
  font-size: var(--sz-small);
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--ink-light);
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;
  border-radius: 2px;
}

.filter-tab:hover {
  color: var(--ink);
  background-color: rgba(16, 14, 11, 0.04);
}

.filter-tab.active {
  color: var(--white);
  background-color: var(--ink);
}

.styles-count-badge {
  font-size: var(--sz-small);
  font-weight: 500;
  color: var(--ink-light);
}

/* Styles Grid */
.styles-full-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 1fr;
  border-left: 1px solid var(--rule);
}

.styles-full-grid :deep(.reveal) {
  height: 100%;
}

.styles-full-grid :deep(.style-card-full) {
  height: 100%;
}

/* CTA Section */
.styles-cta {
  padding: var(--sp-section) var(--sp-page);
  background-color: var(--dark);
}

.styles-cta-inner {
  text-align: center;
  max-width: 40ch;
  margin: 0 auto;
}

.styles-cta-title {
  font-family: var(--ff-display);
  font-size: var(--sz-title);
  font-weight: 700;
  color: var(--white);
  margin-bottom: 1rem;
}

.styles-cta-text {
  font-size: var(--sz-lead);
  color: rgba(253, 251, 247, 0.65);
  margin-bottom: 2rem;
}

.btn-primary {
  font-family: var(--ff-body);
  font-size: var(--sz-small);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink);
  background-color: var(--white);
  text-decoration: none;
  padding: 1rem 2.2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  border: 2px solid var(--white);
  cursor: pointer;
  transition: background-color 0.25s ease, color 0.25s ease, transform 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--accent-warm);
  border-color: var(--accent-warm);
  color: var(--white);
  transform: translateY(-2px);
}

@media (max-width: 1024px) {
  .styles-full-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .styles-full-grid {
    grid-template-columns: 1fr;
  }

  .styles-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .filter-tabs {
    overflow-x: auto;
    width: 100%;
    padding-bottom: 0.5rem;
  }
}
</style>
