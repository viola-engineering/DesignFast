import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getConfig } from '@/api/config'

export const useConfigStore = defineStore('config', () => {
  const byokEnabled = ref(false)
  const githubUrl = ref('')
  const loaded = ref(false)

  async function load() {
    if (loaded.value) return
    try {
      const config = await getConfig()
      byokEnabled.value = config.byokEnabled
      githubUrl.value = config.githubUrl
      loaded.value = true
    } catch {
      // Use defaults on error
      loaded.value = true
    }
  }

  return { byokEnabled, githubUrl, loaded, load }
})
