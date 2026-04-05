<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  question: string
  answer: string
}>()

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="faq-item" :class="{ open: isOpen }">
    <button class="faq-question" @click="toggle" :aria-expanded="isOpen">
      <span>{{ question }}</span>
      <span class="faq-icon">{{ isOpen ? '-' : '+' }}</span>
    </button>
    <div class="faq-answer" v-show="isOpen">
      <p>{{ answer }}</p>
    </div>
  </div>
</template>

<style scoped>
.faq-item {
  border-bottom: 1px solid var(--rule);
}

.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  background: none;
  border: none;
  text-align: left;
  font-family: var(--ff-body);
  font-size: var(--sz-lead);
  font-weight: 500;
  color: var(--ink);
  cursor: pointer;
  transition: color 0.2s ease;
}

.faq-question:hover {
  color: var(--accent);
}

.faq-icon {
  font-family: var(--ff-display);
  font-size: 1.5rem;
  font-weight: 300;
  color: var(--ink-light);
  transition: transform 0.3s ease;
}

.faq-item.open .faq-icon {
  color: var(--accent);
}

.faq-answer {
  padding-bottom: 1.5rem;
}

.faq-answer p {
  font-size: var(--sz-body);
  color: var(--ink-light);
  line-height: 1.6;
  max-width: 60ch;
}
</style>
