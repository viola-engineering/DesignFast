<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MobileMenu from './MobileMenu.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const mobileMenuOpen = ref(false)
const scrolled = ref(false)

const isLoggedIn = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function handleScroll() {
  scrolled.value = window.scrollY > 20
}

async function logout() {
  await authStore.logout()
  closeMobileMenu()
  router.push('/')
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <nav class="nav" :class="{ scrolled }" role="navigation" aria-label="Main navigation">
    <RouterLink to="/" class="nav-wordmark">Design<em>Fast</em></RouterLink>

    <div class="nav-center">
      <RouterLink to="/generate" class="nav-link" :class="{ active: route.path === '/generate' }">Generate</RouterLink>
      <RouterLink to="/styles" class="nav-link" :class="{ active: route.path === '/styles' }">Styles</RouterLink>
      <RouterLink to="/pricing" class="nav-link" :class="{ active: route.path === '/pricing' }">Pricing</RouterLink>
    </div>

    <div class="nav-right">
      <template v-if="isLoggedIn">
        <RouterLink to="/history" class="nav-link" :class="{ active: route.path === '/history' }">History</RouterLink>
        <RouterLink to="/account" class="nav-link" :class="{ active: route.path === '/account' }">
          {{ user?.name || user?.email || 'Account' }}
        </RouterLink>
        <button class="btn-nav" @click="logout">Logout</button>
      </template>
      <template v-else>
        <RouterLink to="/login" class="nav-link">Login</RouterLink>
        <RouterLink to="/generate" class="btn-nav">Start free</RouterLink>
      </template>
    </div>

    <button
      class="nav-hamburger"
      :class="{ open: mobileMenuOpen }"
      aria-label="Toggle menu"
      :aria-expanded="mobileMenuOpen"
      @click="toggleMobileMenu"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  </nav>

  <MobileMenu
    :open="mobileMenuOpen"
    :is-logged-in="isLoggedIn"
    :user="user"
    @close="closeMobileMenu"
    @logout="logout"
  />
</template>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem var(--sp-page, clamp(1.5rem, 5vw, 5rem));
  background-color: var(--bg);
  border-bottom: 1px solid var(--rule);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.nav.scrolled {
  box-shadow: 0 1px 24px rgba(16, 14, 11, 0.07);
}

.nav-wordmark {
  font-family: var(--ff-display, 'Playfair Display', Georgia, serif);
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ink);
  text-decoration: none;
  flex-shrink: 0;
}

.nav-wordmark em {
  color: var(--accent);
  font-style: normal;
}

.nav-center {
  display: flex;
  align-items: center;
  gap: 0;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-light);
  text-decoration: none;
  padding: 0.4rem 0.75rem;
  transition: color 0.2s ease;
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0.75rem;
  right: 0.75rem;
  height: 1px;
  background-color: var(--accent);
  transform: scaleX(0);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-link:hover {
  color: var(--ink);
}

.nav-link:hover::after {
  transform: scaleX(1);
}

.nav-link.active {
  color: var(--ink);
}

.nav-link.active::after {
  transform: scaleX(1);
}

.btn-nav {
  font-family: var(--ff-body, 'Space Grotesk', system-ui, sans-serif);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--white);
  background-color: var(--accent);
  text-decoration: none;
  padding: 0.55rem 1.4rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  display: inline-block;
}

.btn-nav:hover {
  background-color: var(--accent-warm);
  transform: translateY(-1px);
}

.nav-hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
}

.nav-hamburger span {
  display: block;
  width: 22px;
  height: 1.5px;
  background-color: var(--ink);
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.nav-hamburger.open span:nth-child(1) {
  transform: translateY(6.5px) rotate(45deg);
}

.nav-hamburger.open span:nth-child(2) {
  opacity: 0;
}

.nav-hamburger.open span:nth-child(3) {
  transform: translateY(-6.5px) rotate(-45deg);
}

@media (max-width: 768px) {
  .nav-center,
  .nav-right {
    display: none;
  }

  .nav-hamburger {
    display: flex;
  }
}
</style>
