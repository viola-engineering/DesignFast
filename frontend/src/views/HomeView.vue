<script setup lang="ts">
import StyleCard from '@/components/StyleCard.vue'
import ScrollReveal from '@/components/ScrollReveal.vue'
import TickerBand from '@/components/TickerBand.vue'

const tickerItems = [
  '48 curated design styles',
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
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-top">
        <p class="hero-label">AI-powered design generation <span class="beta-badge">BETA</span></p>
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
          <RouterLink to="/styles" class="btn-ghost">See 48 styles</RouterLink>
        </div>
        <p class="hero-opensource">
          <a href="https://github.com/viola-engineering/designfast" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Open source
          </a> — self-host with your own API keys
        </p>
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

    <!-- Why Section -->
    <section class="why">
      <ScrollReveal>
        <p class="why-label">Why we built this</p>
        <p class="why-prose">
          LLMs are wildly unpredictable — and <em class="accent">that's the point.</em>
          We turn their randomness into a superpower: generate dozens of designs,
          then pick the one that feels right. Because <em class="accent">you know great design
          when you see it</em> — you just can't always make it from scratch.
          DesignFast bridges that gap and <em class="accent">sets your imagination free.</em>
        </p>
      </ScrollReveal>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works">
      <ScrollReveal>
        <div class="hiw-header">
          <h2 class="hiw-title">
            How it<br />
            <em>works.</em>
          </h2>
          <p class="hiw-tagline">
            Three steps.<br />
            No design experience needed.<br />
            No subscriptions to wrestling with.
          </p>
        </div>
      </ScrollReveal>

      <div class="hiw-steps">
        <ScrollReveal>
          <div class="hiw-step">
            <span class="step-number">01</span>
            <h3 class="step-title">Describe it.</h3>
            <p class="step-desc">"A landing page for my CLI tool. Technical but not cold. Dark theme, monospace type, clean layout." Plain English. Specific or vague — DesignFast figures it out.</p>
          </div>
        </ScrollReveal>
        <ScrollReveal :delay="100">
          <div class="hiw-step">
            <span class="step-number">02</span>
            <h3 class="step-title">Choose a style.</h3>
            <p class="step-desc">Pick from 48 curated styles, or let AI choose based on your description. Minimalist, editorial, brutalist, luxe — there's a design vocabulary for what you're building.</p>
          </div>
        </ScrollReveal>
        <ScrollReveal :delay="200">
          <div class="hiw-step">
            <span class="step-number">03</span>
            <h3 class="step-title">Ship it.</h3>
            <p class="step-desc">Get production-quality HTML, CSS, and JS in seconds. Download it. Iterate on it. Drop it into your project or build on top of it with your own tools.</p>
          </div>
        </ScrollReveal>
      </div>
    </section>

    <!-- Alternative to Suffering Section -->
    <section class="suffering-alt">
      <ScrollReveal>
        <p class="suffering-eyebrow">The alternative to suffering</p>
        <h2 class="suffering-headline">
          Production code.<br />
          <em>Not a mockup.</em>
        </h2>
        <p class="suffering-body">
          Other tools give you pretty screenshots. DesignFast gives you clean, semantic HTML — ready to open in a browser, customize, and deploy. You own every line.
        </p>
        <RouterLink to="/generate" class="btn-suffering">
          Try it free <span>→</span>
        </RouterLink>
      </ScrollReveal>
    </section>

    <!-- Everything You Need Section -->
    <section class="features">
      <ScrollReveal>
        <div class="features-header">
          <h2 class="features-title">
            Everything<br />
            you<br />
            <em>actually need.</em>
          </h2>
        </div>
      </ScrollReveal>

      <ScrollReveal :delay="100">
        <div class="features-list">
          <div class="feature-item">
            <span class="feature-number">01</span>
            <div class="feature-content">
              <h3 class="feature-name">Instant generation</h3>
              <p class="feature-desc">Claude and Gemini models, your choice. Results in seconds, not minutes. Multiple creative versions per prompt so you can pick the direction that fits.</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-number">02</span>
            <div class="feature-content">
              <h3 class="feature-name">48 style presets</h3>
              <p class="feature-desc">Hand-curated aesthetics that span the full range — from razor-clean minimalism to opinionated brutalism. Each style has a distinct layout logic, not just a different color scheme.</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-number">03</span>
            <div class="feature-content">
              <h3 class="feature-name">AI theme selection</h3>
              <p class="feature-desc">Describe your project and let DesignFast recommend the right style. The AI reads intent — a security tool shouldn't look like a recipe blog.</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-number">04</span>
            <div class="feature-content">
              <h3 class="feature-name">Multi-page webapp mode</h3>
              <p class="feature-desc">Generate full webapps with multiple linked pages, consistent navigation, and shared design systems — not just single hero screens.</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-number">05</span>
            <div class="feature-content">
              <h3 class="feature-name">Iterate and refine</h3>
              <p class="feature-desc">"Make the headline bigger." "Try a dark version." "Add a pricing section." Describe changes in plain language and get updated code immediately.</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-number">06</span>
            <div class="feature-content">
              <h3 class="feature-name">Download and own it</h3>
              <p class="feature-desc">No lock-in. No proprietary editor. Download clean files and build with whatever tools you use — VS Code, your own deploy pipeline, or raw git. It's your code.</p>
            </div>
          </div>
        </div>
      </ScrollReveal>
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
            48
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
          <RouterLink to="/styles" class="btn-ghost">View all 48 styles</RouterLink>
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

.beta-badge {
  font-size: 0.65em;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--accent);
  background: rgba(255, 107, 53, 0.12);
  padding: 0.25em 0.6em;
  border-radius: 3px;
  margin-left: 0.75rem;
  vertical-align: middle;
}

.hero-headline {
  font-family: var(--ff-display);
  font-size: clamp(3rem, 8vw, 7rem);
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

/* Why */
.why {
  padding: var(--sp-section) var(--sp-page);
  max-width: 54rem;
  margin: 0 auto;
}

.why-label {
  font-size: var(--sz-micro);
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink-light);
  margin-bottom: 1.5rem;
}

.why-prose {
  font-family: var(--ff-display);
  font-size: clamp(1.5rem, 3.5vw, 2.25rem);
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.01em;
  color: var(--ink-light);
}

.why-prose .accent {
  color: var(--ink);
  font-style: normal;
  font-weight: 700;
}

/* How It Works */
.how-it-works {
  padding: var(--sp-section) var(--sp-page);
  background-color: var(--white);
}

.hiw-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4rem;
}

.hiw-title {
  font-family: var(--ff-display);
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -0.03em;
  color: var(--ink);
}

.hiw-title em {
  font-style: italic;
}

.hiw-tagline {
  font-size: var(--sz-body);
  color: var(--ink-light);
  text-align: right;
  line-height: 1.6;
}

.hiw-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--rule);
}

.hiw-step {
  padding: 3rem 2rem;
  border-right: 1px solid var(--rule);
}

.hiw-step:last-child {
  border-right: none;
}

.step-number {
  font-family: var(--ff-display);
  font-size: 5rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.04em;
  color: rgba(0, 0, 0, 0.06);
  display: block;
  margin-bottom: 1rem;
}

.step-title {
  font-family: var(--ff-display);
  font-size: var(--sz-h3);
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 1rem;
}

.step-desc {
  font-size: var(--sz-body);
  color: var(--ink-light);
  line-height: 1.6;
}

/* Alternative to Suffering */
.suffering-alt {
  background-color: var(--accent);
  padding: var(--sp-section) var(--sp-page);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.suffering-eyebrow {
  font-size: var(--sz-micro);
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 2rem;
}

.suffering-headline {
  font-family: var(--ff-display);
  font-size: clamp(2.5rem, 7vw, 5rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--white);
  margin-bottom: 2rem;
}

.suffering-headline em {
  font-style: italic;
}

.suffering-body {
  font-size: var(--sz-lead);
  color: rgba(255, 255, 255, 0.85);
  max-width: 42ch;
  margin: 0 auto 2.5rem;
  line-height: 1.6;
}

.btn-suffering {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--ff-body);
  font-size: var(--sz-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  background-color: var(--white);
  text-decoration: none;
  padding: 1rem 2.5rem;
  border: none;
  transition: background-color 0.25s ease, transform 0.2s ease;
}

.btn-suffering:hover {
  background-color: var(--surface);
  transform: translateY(-2px);
}

/* Everything You Need */
.features {
  padding: var(--sp-section) var(--sp-page);
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 4rem;
}

.features-title {
  font-family: var(--ff-display);
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--ink);
  position: sticky;
  top: 6rem;
}

.features-title em {
  font-style: italic;
  color: var(--ink-light);
}

.features-list {
  border-top: 1px solid var(--rule);
}

.feature-item {
  display: grid;
  grid-template-columns: 3rem 1fr;
  gap: 1.5rem;
  padding: 2rem 0;
  border-bottom: 1px solid var(--rule);
}

.feature-number {
  font-size: var(--sz-small);
  font-weight: 500;
  color: var(--ink-light);
}

.feature-name {
  font-family: var(--ff-display);
  font-size: var(--sz-h4);
  font-weight: 700;
  font-style: italic;
  color: var(--ink);
  margin-bottom: 0.75rem;
}

.feature-desc {
  font-size: var(--sz-body);
  color: var(--ink-light);
  line-height: 1.6;
}

/* Spectrum */
.spectrum {
  padding: var(--sp-section) var(--sp-page);
  background-color: var(--white);
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

.hero-opensource {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 1.5rem;
  font-size: var(--sz-small);
  color: var(--ink-light);
}

.hero-opensource a {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--ink);
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;
}

.hero-opensource a:hover {
  color: var(--accent);
}

.hero-opensource svg {
  flex-shrink: 0;
  vertical-align: middle;
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
  .hero-headline {
    font-size: clamp(3.5rem, 12vw, 5rem);
  }

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

  .hiw-header {
    flex-direction: column;
    gap: 2rem;
  }

  .hiw-tagline {
    text-align: left;
  }

  .hiw-steps {
    grid-template-columns: 1fr;
  }

  .hiw-step {
    border-right: none;
    border-bottom: 1px solid var(--rule);
    padding: 2rem 0;
  }

  .hiw-step:last-child {
    border-bottom: none;
  }

  .features {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .features-title {
    position: static;
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
