<script setup lang="ts">
import { computed } from 'vue'

type ButtonVariant = 'primary' | 'ghost' | 'ghost-light' | 'outline' | 'banner' | 'final'
type ButtonSize = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClass = computed(() => {
  return [
    'btn',
    `btn-${props.variant}`,
    `btn-size-${props.size}`,
    {
      'btn-disabled': props.disabled || props.loading,
      'btn-loading': props.loading
    }
  ]
})

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :class="buttonClass"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <span v-if="loading" class="btn-spinner"></span>
    <slot />
    <span v-if="$slots.arrow" class="arrow">
      <slot name="arrow" />
    </span>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--ff-body, 'Space Grotesk', system-ui, sans-serif);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.25s ease, color 0.25s ease, transform 0.2s ease, border-color 0.25s ease;
  position: relative;
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-loading {
  color: transparent !important;
}

.btn-spinner {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 1.2em;
  height: 1.2em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* Size variants */
.btn-size-sm {
  font-size: 0.6875rem;
  padding: 0.6rem 1.4rem;
}

.btn-size-md {
  font-size: 0.8125rem;
  padding: 1rem 2.2rem;
}

.btn-size-lg {
  font-size: 0.875rem;
  padding: 1.2rem 2.8rem;
}

/* Primary - ink background, accent on hover */
.btn-primary {
  color: var(--white);
  background-color: var(--ink);
  border: 2px solid var(--ink);
}

.btn-primary:hover:not(.btn-disabled) {
  background-color: var(--accent);
  border-color: var(--accent);
  transform: translateY(-2px);
}

.btn-primary .arrow {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.btn-primary:hover:not(.btn-disabled) .arrow {
  transform: translateX(4px);
}

/* Ghost - transparent with ink text, underline style */
.btn-ghost {
  font-weight: 500;
  letter-spacing: 0.06em;
  color: var(--ink-light);
  background: none;
  border: none;
  border-bottom: 1px solid var(--rule);
  padding: 0;
  padding-bottom: 2px;
  text-transform: none;
}

.btn-ghost:hover:not(.btn-disabled) {
  color: var(--ink);
  border-color: var(--ink);
}

/* Ghost-light - for dark backgrounds */
.btn-ghost-light {
  font-weight: 500;
  letter-spacing: 0.06em;
  color: rgba(253, 251, 247, 0.45);
  background: none;
  border: none;
  border-bottom: 1px solid rgba(253, 251, 247, 0.2);
  padding: 0;
  padding-bottom: 2px;
  text-transform: none;
}

.btn-ghost-light:hover:not(.btn-disabled) {
  color: rgba(253, 251, 247, 0.85);
  border-color: rgba(253, 251, 247, 0.5);
}

/* Outline - bordered, transparent fill */
.btn-outline {
  color: var(--ink);
  background-color: transparent;
  border: 1.5px solid var(--ink);
}

.btn-outline:hover:not(.btn-disabled) {
  background-color: var(--ink);
  color: var(--white);
  transform: translateY(-1px);
}

/* Banner - white with accent text, for accent backgrounds */
.btn-banner {
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--accent);
  background-color: var(--white);
  border: 2px solid var(--white);
}

.btn-banner:hover:not(.btn-disabled) {
  background-color: transparent;
  color: var(--white);
  transform: translateY(-2px);
}

/* Final - large CTA style for dark sections */
.btn-final {
  font-weight: 700;
  color: var(--ink);
  background-color: var(--white);
  border: 2px solid var(--white);
}

.btn-final:hover:not(.btn-disabled) {
  background-color: var(--accent-warm);
  border-color: var(--accent-warm);
  color: var(--white);
  transform: translateY(-2px);
}
</style>
