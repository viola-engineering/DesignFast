<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'
import AppNav from '@/components/AppNav.vue'
import AppFooter from '@/components/AppFooter.vue'
import ToastContainer from '@/components/ToastContainer.vue'

const authStore = useAuthStore()
const configStore = useConfigStore()

onMounted(() => {
  authStore.fetchUser()
  configStore.load()
})
</script>

<template>
  <div class="app">
    <AppNav />
    <main class="main-content">
      <RouterView />
    </main>
    <AppFooter />
    <ToastContainer />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 62px; /* Account for fixed nav */
}
</style>
