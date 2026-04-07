<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '@/stores/config'
import ScrollReveal from '@/components/ScrollReveal.vue'
import PricingCard from '@/components/PricingCard.vue'
import FeatureTable from '@/components/FeatureTable.vue'
import FaqAccordion from '@/components/FaqAccordion.vue'

const configStore = useConfigStore()
const byokEnabled = computed(() => configStore.byokEnabled)

const tiers = computed(() => [
  {
    name: 'Free',
    price: '\u20AC0',
    period: '',
    description: 'Explore DesignFast with Gemini-powered generations. No credit card, no commitment.',
    features: [
      { text: '3 generations per month', included: true },
      { text: 'Gemini model', included: true },
      { text: 'Up to 2 styles per generation', included: true },
      { text: 'Up to 2 versions per generation', included: true },
      { text: 'Single-page & multi-page modes', included: true },
      { text: 'Iterate & refine', included: true },
      { text: 'Download your output files', included: true },
      { text: 'Claude model', included: false },
      { text: 'Credit-based usage', included: false },
      ...(byokEnabled.value ? [{ text: 'BYOK (own API keys)', included: false }] : []),
    ],
    ctaText: 'Get started free',
    ctaLink: '/generate',
    featured: false
  },
  {
    name: 'Pro',
    price: 'from \u20AC5',
    period: '',
    description: 'Buy credits, use them anytime. Full access to Claude and Gemini. No subscription.',
    features: [
      { text: 'Credits never expire', included: true },
      { text: 'Claude (20 cr) & Gemini (1 cr)', included: true },
      { text: 'Up to 4 styles per generation', included: true },
      { text: 'Up to 4 versions per generation', included: true },
      { text: 'Single-page & multi-page modes', included: true },
      { text: 'Iterate & refine', included: true },
      { text: 'Download your output files', included: true },
      ...(byokEnabled.value ? [{ text: 'BYOK — bypass credits', included: true }] : []),
      { text: '3 free Gemini generations when out of credits', included: true },
    ],
    ctaText: 'Buy credits',
    ctaLink: '/account',
    featured: true
  }
])

const featureTableRows = computed(() => [
  { feature: 'Usage', free: '', pro: '', isCategory: true },
  { feature: 'Pricing', free: 'Free', pro: 'Pay as you go' },
  { feature: 'Gemini cost', free: '1 generation', pro: '1 credit' },
  { feature: 'Claude cost', free: '-', pro: '20 credits' },
  { feature: 'Styles per generation', free: 'Up to 2', pro: 'Up to 4' },
  { feature: 'Versions per generation', free: 'Up to 2', pro: 'Up to 4' },
  { feature: 'Credit expiry', free: '-', pro: 'Never' },
  { feature: 'Models', free: '', pro: '', isCategory: true },
  { feature: 'Gemini', free: '✓', pro: '✓' },
  { feature: 'Claude', free: '-', pro: '✓' },
  { feature: 'Modes', free: '', pro: '', isCategory: true },
  { feature: 'Single-page landing', free: '✓', pro: '✓' },
  { feature: 'Multi-page webapp', free: '✓', pro: '✓' },
  { feature: 'Features', free: '', pro: '', isCategory: true },
  { feature: 'Download files', free: '✓', pro: '✓' },
  { feature: 'Iterate & refine', free: '✓', pro: '✓' },
  ...(byokEnabled.value ? [{ feature: 'BYOK (own API keys)', free: '-', pro: '✓' }] : []),
  { feature: 'Fallback Gemini when out of credits', free: '-', pro: '3 gen/mo' },
])

const faqs = [
  {
    question: 'How do credits work?',
    answer: 'Buy credits once, use them anytime. Each generation costs credits based on the model: Gemini costs 1 credit, Claude costs 20 credits. Multiple styles multiply the cost. Credits never expire. When your credits run out, you can still use Gemini with up to 3 fallback generations per month.'
  },
  {
    question: 'What credit packages are available?',
    answer: '50 credits for \u20AC5, 100 credits for \u20AC10, 250 credits for \u20AC22, or 500 credits for \u20AC40. Buy what you need, top up when you want. No subscription, no recurring charges.'
  },
  {
    question: 'Is DesignFast open source?',
    answer: 'Yes! DesignFast is fully open source. You can self-host it on your own infrastructure, use your own API keys, and pay only for what you use directly to Anthropic and Google. The cloud version is for those who want a ready-to-use service without setup.'
  },
  {
    question: 'Can I use my own API keys?',
    answer: 'On the cloud version, we handle all API costs through credits. If you want to use your own API keys (BYOK), you can self-host DesignFast for free - just clone the repo from GitHub and run it with your own keys.'
  },
  {
    question: 'What is the difference between single-page and multi-page mode?',
    answer: 'Single-page mode generates a standalone HTML page - perfect for landing pages, portfolios, or marketing sites. Multi-page webapp mode generates multiple linked pages with shared navigation and consistent design - ideal for documentation sites, dashboards, or small web applications.'
  },
  {
    question: 'Do I own the code that DesignFast generates?',
    answer: 'Absolutely. You own 100% of the code we generate for you. No attribution required, no license restrictions. Use it for client work, sell it, modify it - it is your code.'
  },
  {
    question: 'What does Iterate & refine mean?',
    answer: 'After a generation completes, you can have a conversation with AI to refine the output. "Make the headline bigger", "Add a dark mode toggle", "Change the accent color to blue" - describe changes in plain language and see them applied immediately. Each refinement message costs credits based on the model used.'
  }
]
</script>

<template>
  <div class="pricing-page">
    <!-- Page Hero -->
    <section class="page-hero">
      <p class="page-hero-label">Honest pricing</p>
      <h1 class="page-hero-title">
        Start for free.<br /><em>Scale when ready.</em>
      </h1>
      <p class="page-hero-sub">
        No credit card required. Free tier gets you 3 Gemini generations per month
        to see if DesignFast works for you. Upgrade when it does.
      </p>
      <p class="hero-opensource">
        <a href="https://github.com/viola-engineering/designfast" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Open source
        </a> — self-host with your own API keys
      </p>
    </section>

    <!-- Pricing Cards -->
    <section class="pricing-section">
      <div class="pricing-grid">
        <ScrollReveal v-for="(tier, index) in tiers" :key="tier.name" :delay="index * 150">
          <PricingCard
            :name="tier.name"
            :price="tier.price"
            :period="tier.period"
            :description="tier.description"
            :features="tier.features"
            :cta-text="tier.ctaText"
            :cta-link="tier.ctaLink"
            :featured="tier.featured"
          />
        </ScrollReveal>
      </div>
    </section>

    <!-- Trust Band -->
    <section class="statement-band">
      <div class="statement-inner">
        <p class="statement-eyebrow">Fair deal</p>
        <p class="statement-text">
          No lock-in. No proprietary formats. <span class="ital">You own every line</span> of code
          DesignFast generates. Cancel anytime. Download everything
          before you go. We're <span class="hot">not holding your work hostage.</span>
        </p>
      </div>
    </section>

    <!-- Compare Table -->
    <section class="compare-section">
      <ScrollReveal>
        <div class="section-header">
          <p class="section-kicker">Full breakdown</p>
          <h2 class="section-title">
            Compare all <em>features</em>
          </h2>
        </div>
      </ScrollReveal>
      <ScrollReveal :delay="100">
        <FeatureTable :rows="featureTableRows" />
      </ScrollReveal>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section">
      <ScrollReveal>
        <div class="section-header">
          <p class="section-kicker">Questions</p>
          <h2 class="section-title">
            Frequently <em>asked</em>
          </h2>
        </div>
      </ScrollReveal>
      <div class="faq-list">
        <ScrollReveal v-for="(faq, index) in faqs" :key="index" :delay="index * 50">
          <FaqAccordion :question="faq.question" :answer="faq.answer" />
        </ScrollReveal>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="final-cta">
      <ScrollReveal>
        <div class="final-cta-inner">
          <h2 class="final-headline">Ready to build?</h2>
          <p class="final-body">
            Start with the free tier. No credit card required.
          </p>
          <RouterLink to="/generate" class="btn-final">
            Get started free <span>-></span>
          </RouterLink>
        </div>
      </ScrollReveal>
    </section>
  </div>
</template>

<style scoped>
.pricing-page {
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

/* Pricing Grid */
.pricing-section {
  padding: 0;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border-top: 1px solid var(--rule);
}

.pricing-grid > :deep(*) {
  height: 100%;
}

.pricing-grid :deep(.pricing-card) {
  height: 100%;
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

.statement-text .ital {
  font-style: italic;
}

.statement-text .hot {
  color: var(--accent-warm);
}

/* Compare Section */
.compare-section {
  padding: var(--sp-section) 0;
}

.section-header {
  padding: 0 var(--sp-page);
  margin-bottom: 3rem;
}

.section-kicker {
  font-size: var(--sz-micro);
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink-light);
  margin-bottom: 1rem;
}

.section-title {
  font-family: var(--ff-display);
  font-size: var(--sz-title);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.section-title em {
  color: var(--accent);
  font-style: italic;
}

/* FAQ Section */
.faq-section {
  padding: var(--sp-section) 0;
  border-top: 1px solid var(--rule);
}

.faq-list {
  max-width: 50rem;
  padding: 0 var(--sp-page);
}

/* Final CTA */
.final-cta {
  background-color: var(--dark);
  padding: var(--sp-section) var(--sp-page);
}

.final-cta-inner {
  text-align: center;
  max-width: 40ch;
  margin: 0 auto;
}

.final-headline {
  font-family: var(--ff-display);
  font-size: var(--sz-display);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--white);
  margin-bottom: 1rem;
}

.final-body {
  font-size: var(--sz-lead);
  color: rgba(253, 251, 247, 0.65);
  margin-bottom: 2rem;
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

@media (max-width: 1024px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .statement-inner {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .statement-eyebrow {
    writing-mode: horizontal-tb;
    transform: none;
  }
}
</style>
