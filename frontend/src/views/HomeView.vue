<script setup lang="ts">
import { useToastStore } from '@/stores/toast'
import BaseButton from '@/components/BaseButton.vue'
import StyleCard from '@/components/StyleCard.vue'
import ScrollReveal from '@/components/ScrollReveal.vue'
import TickerBand from '@/components/TickerBand.vue'

const toastStore = useToastStore()

const tickerItems = [
  '30 curated design styles',
  'Claude & Gemini support',
  'Multi-page webapp mode',
  'Instant generation',
  'Free tier available',
  'Download & own your code',
  'Iterate and refine',
  'AI theme auto-selection',
  'Multiple creative versions',
  'Built for engineers who ship'
]

const sampleStyles = [
  { key: 'minimalist', name: 'Minimalist', category: 'minimal', description: 'Whitespace as the hero. Nothing without purpose.', tags: ['Whitespace-led', 'High contrast'] },
  { key: 'brutalist', name: 'BRUTALIST', category: 'bold', description: 'Raw, confrontational. Makes you look twice.', tags: ['High impact', 'Grid-forward'] },
  { key: 'editorial', name: 'Editorial', category: 'editorial', description: 'Magazine-spread energy. Typography as layout.', tags: ['Serif display', 'Column grid'] },
  { key: 'cyberpunk', name: 'CYBERPUNK', category: 'dark', description: 'Terminal glow. Neon on dark. Earned edge.', tags: ['Dark bg', 'Neon accents'] }
]

function showSuccessToast() {
  toastStore.success('Generation complete! Your design is ready.')
}

function showErrorToast() {
  toastStore.error('Something went wrong. Please try again.')
}

function showInfoToast() {
  toastStore.info('Processing your request...')
}
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-top">
        <p class="hero-label">AI-powered design generation</p>
        <h1 class="hero-headline">
          You know<br />
          great&nbsp;<em class="accent-word">design</em><br />
          when you<br />
          see&nbsp;it.
        </h1>
      </div>

      <div class="hero-bottom">
        <p class="hero-subtext">
          You just&nbsp;<strong>can't make it from scratch.</strong>
          DesignFast fixes that - describe what you want,
          pick a style, and get production-quality HTML, CSS and JS
          in seconds.
        </p>
        <div class="hero-cta-group">
          <RouterLink to="/generate" class="btn-primary">
            Generate something <span class="arrow">-></span>
          </RouterLink>
          <RouterLink to="/styles" class="btn-ghost">See 30 styles</RouterLink>
        </div>
      </div>
    </section>

    <!-- Ticker Band -->
    <TickerBand :items="tickerItems" :speed="32" />

    <!-- Statement Band -->
    <section class="statement-band">
      <div class="statement-inner">
        <p class="statement-eyebrow">The reality</p>
        <p class="statement-text">
          You can <span class="struck">hire a designer</span> and wait two weeks,
          <span class="struck">buy a template</span> and look like everyone else,
          or describe exactly what you want<br />
          and get it <span class="hot">right now.</span>
        </p>
      </div>
    </section>

    <!-- Style Preview Section -->
    <section class="spectrum">
      <ScrollReveal>
        <div class="spectrum-header">
          <div>
            <p class="spectrum-label">Design style library</p>
            <h2 class="spectrum-title">
              Every aesthetic.<br />One prompt.
            </h2>
          </div>
          <div class="spectrum-count">
            30
            <span>Styles</span>
          </div>
        </div>
      </ScrollReveal>

      <div class="style-grid">
        <ScrollReveal v-for="(style, index) in sampleStyles" :key="style.key" :delay="index * 100">
          <StyleCard
            :style-key="style.key"
            :style-name="style.name"
            :category="style.category"
            :description="style.description"
            :tags="style.tags"
            :number="index + 1"
          />
        </ScrollReveal>
      </div>

      <ScrollReveal>
        <div class="spectrum-cta">
          <RouterLink to="/styles" class="btn-ghost">View all 30 styles</RouterLink>
        </div>
      </ScrollReveal>
    </section>

    <!-- Button Demo Section -->
    <section class="demo-section">
      <ScrollReveal>
        <h2 class="demo-title">Component Demo</h2>
      </ScrollReveal>

      <ScrollReveal :delay="100">
        <div class="button-demo">
          <h3 class="demo-subtitle">Button Variants</h3>
          <div class="button-row">
            <BaseButton variant="primary">Primary</BaseButton>
            <BaseButton variant="outline">Outline</BaseButton>
            <BaseButton variant="ghost">Ghost</BaseButton>
          </div>
          <div class="button-row dark-bg">
            <BaseButton variant="banner">Banner</BaseButton>
            <BaseButton variant="final">Final CTA</BaseButton>
            <BaseButton variant="ghost-light">Ghost Light</BaseButton>
          </div>
          <div class="button-row">
            <BaseButton variant="primary" :loading="true">Loading</BaseButton>
            <BaseButton variant="primary" :disabled="true">Disabled</BaseButton>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal :delay="200">
        <div class="toast-demo">
          <h3 class="demo-subtitle">Toast Notifications</h3>
          <div class="button-row">
            <BaseButton variant="primary" @click="showSuccessToast">Success Toast</BaseButton>
            <BaseButton variant="outline" @click="showErrorToast">Error Toast</BaseButton>
            <BaseButton variant="ghost" @click="showInfoToast">Info Toast</BaseButton>
          </div>
        </div>
      </ScrollReveal>
    </section>

    <!-- Final CTA -->
    <section class="final-cta">
      <ScrollReveal>
        <h2 class="final-headline">
          Stop staring<br />
          at blank files.
          <span class="accent-line">Start building.</span>
        </h2>
      </ScrollReveal>
      <ScrollReveal :delay="200">
        <div class="final-right">
          <p class="final-body">
            Free tier available. No credit card required.
            <strong>Most builders ship their first design in under five minutes.</strong>
          </p>
          <div class="final-actions">
            <RouterLink to="/generate" class="btn-final">
              Get started free <span>-></span>
            </RouterLink>
            <RouterLink to="/pricing" class="btn-ghost-light">See pricing</RouterLink>
          </div>
        </div>
      </ScrollReveal>
    </section>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
}

/* Hero */
.hero {
  min-height: calc(100vh - 62px);
  padding: 5rem var(--sp-page);
  display: grid;
  grid-template-columns: 1fr;
  align-content: space-between;
}

.hero-label {
  font-size: var(--sz-micro);
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink-light);
  margin-bottom: 2.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.hero-label::before {
  content: '';
  display: inline-block;
  width: 2rem;
  height: 1px;
  background: var(--ink-light);
}

.hero-headline {
  font-family: var(--ff-display);
  font-size: var(--sz-monster);
  font-weight: 900;
  line-height: 0.92;
  letter-spacing: -0.03em;
  color: var(--ink);
  max-width: 16ch;
}

.hero-headline .accent-word {
  color: var(--accent);
  font-style: italic;
}

.hero-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: end;
  gap: 2rem;
  margin-top: 5rem;
}

.hero-subtext {
  font-size: var(--sz-lead);
  color: var(--ink-light);
  max-width: 40ch;
  line-height: 1.55;
}

.hero-subtext strong {
  color: var(--ink);
  font-weight: 600;
}

.hero-cta-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.5rem;
  flex-wrap: wrap;
}

/* Statement Band */
.statement-band {
  background-color: var(--dark);
  padding: 4rem var(--sp-page);
  overflow: hidden;
}

.statement-inner {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: clamp(2rem, 6vw, 7rem);
  align-items: center;
}

.statement-eyebrow {
  font-size: var(--sz-micro);
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(253, 251, 247, 0.35);
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
}

.statement-text {
  font-family: var(--ff-display);
  font-size: clamp(1.8rem, 4vw, 3.5rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
  color: var(--white);
}

.statement-text .struck {
  color: rgba(253, 251, 247, 0.25);
  text-decoration: line-through;
}

.statement-text .hot {
  color: var(--accent-warm);
}

/* Spectrum */
.spectrum {
  padding: var(--sp-section) var(--sp-page);
}

.spectrum-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3rem;
}

.spectrum-label {
  font-size: var(--sz-micro);
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink-light);
  margin-bottom: 1rem;
}

.spectrum-title {
  font-family: var(--ff-display);
  font-size: var(--sz-display);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
}

.spectrum-count {
  font-family: var(--ff-display);
  font-size: 5rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--ink);
  text-align: right;
}

.spectrum-count span {
  display: block;
  font-size: var(--sz-micro);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-light);
  margin-top: 0.5rem;
}

.style-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border-top: 1px solid var(--rule);
  border-left: 1px solid var(--rule);
}

.spectrum-cta {
  margin-top: 2rem;
}

/* Demo Section */
.demo-section {
  padding: var(--sp-section) var(--sp-page);
  border-top: 1px solid var(--rule);
}

.demo-title {
  font-family: var(--ff-display);
  font-size: var(--sz-title);
  font-weight: 700;
  margin-bottom: 3rem;
}

.demo-subtitle {
  font-size: var(--sz-lead);
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--ink);
}

.button-demo,
.toast-demo {
  margin-bottom: 3rem;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
}

.button-row.dark-bg {
  background-color: var(--dark);
  margin-left: -1.5rem;
  margin-right: -1.5rem;
  padding-left: calc(var(--sp-page) + 1.5rem);
  padding-right: calc(var(--sp-page) + 1.5rem);
}

/* Final CTA */
.final-cta {
  background-color: var(--dark);
  padding: var(--sp-section) var(--sp-page);
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 4rem;
  align-items: center;
}

.final-headline {
  font-family: var(--ff-display);
  font-size: var(--sz-display);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--white);
}

.final-headline .accent-line {
  display: block;
  color: var(--accent-warm);
  margin-top: 0.5rem;
}

.final-body {
  font-size: var(--sz-lead);
  color: rgba(253, 251, 247, 0.65);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.final-body strong {
  color: var(--white);
}

.final-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

/* Button styles inline for RouterLink */
.btn-primary {
  font-family: var(--ff-body);
  font-size: var(--sz-small);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--white);
  background-color: var(--ink);
  text-decoration: none;
  padding: 1rem 2.2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  border: 2px solid var(--ink);
  cursor: pointer;
  transition: background-color 0.25s ease, color 0.25s ease, transform 0.2s ease, border-color 0.25s ease;
}

.btn-primary:hover {
  background-color: var(--accent);
  border-color: var(--accent);
  transform: translateY(-2px);
}

.btn-ghost {
  font-size: var(--sz-small);
  font-weight: 500;
  letter-spacing: 0.06em;
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

.btn-final {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--ff-body);
  font-size: var(--sz-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink);
  background-color: var(--white);
  text-decoration: none;
  padding: 1rem 2.2rem;
  border: 2px solid var(--white);
  transition: background-color 0.25s ease, color 0.25s ease, transform 0.2s ease;
}

.btn-final:hover {
  background-color: var(--accent-warm);
  border-color: var(--accent-warm);
  color: var(--white);
  transform: translateY(-2px);
}

.btn-ghost-light {
  font-size: var(--sz-small);
  font-weight: 500;
  letter-spacing: 0.06em;
  color: rgba(253, 251, 247, 0.45);
  text-decoration: none;
  border-bottom: 1px solid rgba(253, 251, 247, 0.2);
  padding-bottom: 2px;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.btn-ghost-light:hover {
  color: rgba(253, 251, 247, 0.85);
  border-color: rgba(253, 251, 247, 0.5);
}

@media (max-width: 768px) {
  .hero-bottom {
    grid-template-columns: 1fr;
  }

  .hero-cta-group {
    justify-content: flex-start;
  }

  .statement-inner {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .statement-eyebrow {
    writing-mode: horizontal-tb;
    transform: none;
  }

  .style-grid {
    grid-template-columns: 1fr;
  }

  .final-cta {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
