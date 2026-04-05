<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  styleKey: string
  styleName: string
  category: string
  description?: string
  number?: number
  tags?: string[]
}>()

const router = useRouter()

const styleClass = computed(() => {
  return `sn-${props.styleKey}`
})

function useStyle() {
  router.push({
    path: '/generate',
    query: { style: props.styleKey }
  })
}
</script>

<template>
  <div class="style-card-full" :data-tags="category">
    <p v-if="number" class="style-card-num">{{ String(number).padStart(2, '0') }}</p>
    <span class="style-card-name" :class="styleClass">{{ styleName }}</span>
    <p v-if="description" class="style-card-desc">{{ description }}</p>
    <div v-if="tags?.length" class="style-card-tags">
      <span v-for="tag in tags" :key="tag" class="style-tag">{{ tag }}</span>
    </div>
    <button class="style-use-btn" @click="useStyle">Use this style</button>
  </div>
</template>

<style scoped>
.style-card-full {
  border-right: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  padding: 2rem;
  position: relative;
  transition: background-color 0.25s ease;
  overflow: hidden;
  cursor: default;
  display: flex;
  flex-direction: column;
  min-height: 240px;
}

.style-card-full::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.style-card-full:hover::before {
  transform: scaleX(1);
}

.style-card-full:hover {
  background-color: rgba(16, 14, 11, 0.02);
}

.style-card-num {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--ink-light);
  margin-bottom: 1rem;
}

.style-card-name {
  font-weight: 700;
  line-height: 1;
  display: block;
  transition: transform 0.2s ease;
}

.style-card-full:hover .style-card-name {
  transform: translateX(3px);
}

.style-card-desc {
  font-size: 0.8125rem;
  color: var(--ink-light);
  line-height: 1.5;
  max-width: 28ch;
  margin-top: 0.75rem;
  flex: 1;
}

.style-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.style-tag {
  display: inline-block;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-light);
  background-color: rgba(16, 14, 11, 0.04);
  padding: 0.25rem 0.6rem;
  border-radius: 2px;
}

.style-use-btn {
  display: none;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--ff-body, 'Space Grotesk', system-ui, sans-serif);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--white);
  background-color: var(--accent);
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: absolute;
  bottom: 2rem;
  right: 2rem;
}

.style-card-full:hover .style-use-btn {
  display: inline-flex;
}

.style-use-btn:hover {
  background-color: var(--accent-warm);
}

/* Individual style name treatments */
.sn-minimalist {
  font-size: 1.6rem;
  font-family: var(--ff-display, 'Playfair Display', Georgia, serif);
  font-weight: 300;
  letter-spacing: 0.08em;
}

.sn-brutalist {
  font-size: 2.2rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  text-transform: uppercase;
}

.sn-glassmorphism {
  font-size: 1.5rem;
  font-weight: 300;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.sn-corporate {
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.sn-playful {
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.sn-darkLuxury {
  font-size: 1.5rem;
  font-family: var(--ff-display, 'Playfair Display', Georgia, serif);
  font-weight: 400;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.sn-editorial {
  font-size: 2rem;
  font-family: var(--ff-display, 'Playfair Display', Georgia, serif);
  font-style: italic;
  font-weight: 400;
}

.sn-retro {
  font-size: 1.8rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.sn-neobrutalism {
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  text-transform: uppercase;
}

.sn-organic {
  font-size: 1.6rem;
  font-family: var(--ff-display, 'Playfair Display', Georgia, serif);
  font-weight: 400;
  font-style: italic;
}

.sn-cyberpunk {
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.sn-swiss {
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: 0.06em;
}

.sn-artDeco {
  font-size: 1.6rem;
  font-family: var(--ff-display, 'Playfair Display', Georgia, serif);
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.sn-newspaper {
  font-size: 1.8rem;
  font-family: var(--ff-display, 'Playfair Display', Georgia, serif);
  font-weight: 900;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.sn-neumorphism {
  font-size: 1.4rem;
  font-weight: 400;
  letter-spacing: 0.06em;
}

.sn-monochrome {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.sn-y2k {
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.sn-maximalist {
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  text-transform: uppercase;
}

.sn-cleanTech {
  font-size: 1.4rem;
  font-weight: 500;
  letter-spacing: 0.04em;
}

.sn-warmCorporate {
  font-size: 1.4rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.sn-startupBold {
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.sn-saasMarketing {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.sn-dashboardUI {
  font-size: 1.3rem;
  font-weight: 500;
  letter-spacing: 0.04em;
}

.sn-ecommerce {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.sn-portfolio {
  font-size: 1.6rem;
  font-family: var(--ff-display, 'Playfair Display', Georgia, serif);
  font-weight: 400;
  letter-spacing: 0.06em;
}

.sn-documentation {
  font-size: 1.3rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.sn-healthcare {
  font-size: 1.4rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.sn-fintech {
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.sn-media {
  font-size: 1.6rem;
  font-family: var(--ff-display, 'Playfair Display', Georgia, serif);
  font-weight: 700;
  letter-spacing: 0;
}

.sn-government {
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.style-card-full.hidden {
  display: none;
}
</style>
