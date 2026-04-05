<script setup lang="ts">
const props = withDefaults(defineProps<{
  items: string[]
  speed?: number
  pauseOnHover?: boolean
}>(), {
  speed: 32,
  pauseOnHover: true
})
</script>

<template>
  <div class="ticker-band" :class="{ 'pause-on-hover': props.pauseOnHover }" aria-label="Features ticker">
    <div class="ticker-track" :style="{ animationDuration: `${props.speed}s` }">
      <span class="ticker-item">
        <template v-for="(item, index) in props.items" :key="`a-${index}`">
          {{ item }} <span class="ticker-dot"></span>
        </template>
      </span>
      <span class="ticker-item" aria-hidden="true">
        <template v-for="(item, index) in props.items" :key="`b-${index}`">
          {{ item }} <span class="ticker-dot"></span>
        </template>
      </span>
    </div>
  </div>
</template>

<style scoped>
.ticker-band {
  background-color: var(--accent);
  overflow: hidden;
  padding: 0.6rem 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.ticker-track {
  display: flex;
  width: max-content;
  animation: ticker linear infinite;
}

.pause-on-hover .ticker-track:hover {
  animation-play-state: paused;
}

@keyframes ticker {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.ticker-item {
  white-space: nowrap;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(253, 251, 247, 0.85);
  padding: 0 2.5rem;
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.ticker-dot {
  display: inline-block;
  width: 4px;
  height: 4px;
  background-color: rgba(253, 251, 247, 0.4);
  border-radius: 50%;
}
</style>
