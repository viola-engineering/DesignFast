<script setup lang="ts">
interface Feature {
  text: string
  included: boolean
}

defineProps<{
  name: string
  price: string
  period?: string
  description: string
  features: Feature[]
  ctaText: string
  ctaLink: string
  featured?: boolean
}>()
</script>

<template>
  <div class="pricing-card" :class="{ featured }">
    <p class="pricing-tier-name">{{ name }}</p>
    <p class="pricing-price">
      {{ price }}
      <span v-if="period" class="per">{{ period }}</span>
    </p>
    <p class="pricing-desc">{{ description }}</p>
    <hr class="pricing-divider" />
    <ul class="pricing-features-list">
      <li v-for="(feature, index) in features" :key="index" class="pricing-feature">
        <span v-if="feature.included" class="pricing-check">&#10003;</span>
        <span v-else class="pricing-x">&#10005;</span>
        <span :class="{ 'pricing-feature-text-muted': !feature.included }">{{ feature.text }}</span>
      </li>
    </ul>
    <RouterLink :to="ctaLink" class="btn-pricing" :class="{ 'featured-btn': featured }">
      {{ ctaText }}
    </RouterLink>
  </div>
</template>

<style scoped>
.pricing-card {
  background-color: var(--bg);
  border-right: 1px solid var(--rule);
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
}

.pricing-card.featured {
  background-color: var(--ink);
  color: var(--white);
}

.pricing-tier-name {
  font-size: var(--sz-micro);
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ink-light);
  margin-bottom: 1rem;
}

.pricing-card.featured .pricing-tier-name {
  color: rgba(253, 251, 247, 0.5);
}

.pricing-price {
  font-family: var(--ff-display);
  font-size: clamp(3rem, 5vw, 4rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.03em;
  margin-bottom: 1rem;
}

.pricing-price .per {
  font-family: var(--ff-body);
  font-size: var(--sz-small);
  font-weight: 400;
  letter-spacing: 0;
  color: var(--ink-light);
}

.pricing-card.featured .pricing-price .per {
  color: rgba(253, 251, 247, 0.5);
}

.pricing-desc {
  font-size: var(--sz-small);
  color: var(--ink-light);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.pricing-card.featured .pricing-desc {
  color: rgba(253, 251, 247, 0.65);
}

.pricing-divider {
  border: none;
  border-top: 1px solid var(--rule);
  margin-bottom: 1.5rem;
}

.pricing-card.featured .pricing-divider {
  border-color: rgba(255, 255, 255, 0.1);
}

.pricing-features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
  flex: 1;
}

.pricing-feature {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: var(--sz-small);
  line-height: 1.4;
  margin-bottom: 0.75rem;
}

.pricing-check {
  color: var(--accent);
  font-weight: 600;
  flex-shrink: 0;
}

.pricing-card.featured .pricing-check {
  color: var(--accent-warm);
}

.pricing-x {
  color: var(--ink-light);
  opacity: 0.4;
  flex-shrink: 0;
}

.pricing-feature-text-muted {
  color: var(--ink-light);
  opacity: 0.5;
}

.pricing-card.featured .pricing-feature-text-muted {
  color: rgba(253, 251, 247, 0.35);
}

.btn-pricing {
  display: block;
  text-align: center;
  font-family: var(--ff-body);
  font-size: var(--sz-small);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 1rem 1.5rem;
  border: 1.5px solid var(--ink);
  color: var(--ink);
  background-color: transparent;
  transition: background-color 0.25s ease, color 0.25s ease, transform 0.2s ease;
}

.btn-pricing:hover {
  background-color: var(--ink);
  color: var(--white);
  transform: translateY(-2px);
}

.btn-pricing.featured-btn {
  border-color: var(--white);
  color: var(--ink);
  background-color: var(--white);
}

.btn-pricing.featured-btn:hover {
  background-color: var(--accent-warm);
  border-color: var(--accent-warm);
  color: var(--white);
}
</style>
