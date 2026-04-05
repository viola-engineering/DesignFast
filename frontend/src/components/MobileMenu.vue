<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface User {
  id: string
  email: string
  name?: string | null
}

defineProps<{
  open: boolean
  isLoggedIn: boolean
  user?: User | null
}>()

const emit = defineEmits<{
  close: []
  logout: []
}>()
</script>

<template>
  <div class="nav-mobile-menu" :class="{ open }" aria-label="Mobile navigation">
    <RouterLink to="/" class="nav-mobile-link" @click="emit('close')">Home</RouterLink>
    <RouterLink to="/generate" class="nav-mobile-link" @click="emit('close')">Generate</RouterLink>
    <RouterLink to="/styles" class="nav-mobile-link" @click="emit('close')">Styles</RouterLink>
    <RouterLink to="/pricing" class="nav-mobile-link" @click="emit('close')">Pricing</RouterLink>

    <template v-if="isLoggedIn">
      <RouterLink to="/history" class="nav-mobile-link" @click="emit('close')">History</RouterLink>
      <RouterLink to="/account" class="nav-mobile-link" @click="emit('close')">
        {{ user?.name || user?.email || 'Account' }}
      </RouterLink>
      <button class="nav-mobile-cta" @click="emit('logout')">Logout</button>
    </template>
    <template v-else>
      <RouterLink to="/login" class="nav-mobile-link" @click="emit('close')">Login</RouterLink>
      <RouterLink to="/generate" class="nav-mobile-cta" @click="emit('close')">Start free</RouterLink>
    </template>
  </div>
</template>

<style scoped>
.nav-mobile-menu {
  position: fixed;
  top: 62px;
  left: 0;
  right: 0;
  background-color: var(--bg);
  border-bottom: 1px solid var(--rule);
  padding: 1.5rem var(--sp-page, clamp(1.5rem, 5vw, 5rem));
  display: none;
  flex-direction: column;
  gap: 0;
  z-index: 99;
}

.nav-mobile-menu.open {
  display: flex;
}

.nav-mobile-link {
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-light);
  text-decoration: none;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--rule);
  transition: color 0.2s ease;
  background: none;
  border-left: none;
  border-right: none;
  border-top: none;
  cursor: pointer;
  text-align: left;
  width: 100%;
}

.nav-mobile-link:hover,
.nav-mobile-link.active {
  color: var(--ink);
}

.nav-mobile-cta {
  margin-top: 1rem;
  display: inline-flex;
  font-family: var(--ff-body, 'Space Grotesk', system-ui, sans-serif);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--white);
  background-color: var(--accent);
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  text-align: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  border: none;
  cursor: pointer;
}

.nav-mobile-cta:hover {
  background-color: var(--accent-warm);
}
</style>
