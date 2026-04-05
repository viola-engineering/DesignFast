import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as generationsApi from '@/api/generations'
import type {
  GenerationListItem,
  GenerationDetail,
  CreateGenerationRequest,
  CreateGenerationResponse
} from '@/api/generations'

export const useGenerationsStore = defineStore('generations', () => {
  const generations = ref<GenerationListItem[]>([])
  const currentGeneration = ref<GenerationDetail | null>(null)
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const hasMore = computed(() => generations.value.length < total.value)

  async function fetchList(limit = 20, offset = 0, append = false) {
    loading.value = true
    error.value = null

    try {
      const response = await generationsApi.list(limit, offset)

      if (append) {
        generations.value = [...generations.value, ...response.generations]
      } else {
        generations.value = response.generations
      }
      total.value = response.total
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch generations'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string) {
    loading.value = true
    error.value = null

    try {
      currentGeneration.value = await generationsApi.getById(id)
      return currentGeneration.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch generation'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function create(data: CreateGenerationRequest): Promise<CreateGenerationResponse> {
    loading.value = true
    error.value = null

    try {
      const response = await generationsApi.create(data)

      // Add to the front of the list
      const newItem: GenerationListItem = {
        id: response.id,
        prompt: data.prompt,
        mode: data.mode || 'landing',
        themeMode: data.themeMode || 'freestyle',
        status: response.status,
        jobCount: response.jobs.length,
        jobsDone: 0,
        jobsFailed: 0,
        createdAt: new Date().toISOString(),
        completedAt: null
      }
      generations.value = [newItem, ...generations.value]
      total.value += 1

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create generation'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteById(id: string) {
    loading.value = true
    error.value = null

    try {
      await generationsApi.deleteById(id)

      // Remove from list
      generations.value = generations.value.filter(g => g.id !== id)
      total.value -= 1

      // Clear current if it matches
      if (currentGeneration.value?.id === id) {
        currentGeneration.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete generation'
      throw err
    } finally {
      loading.value = false
    }
  }

  function updateGenerationStatus(
    id: string,
    status: GenerationListItem['status'],
    updates?: Partial<GenerationListItem>
  ) {
    const index = generations.value.findIndex(g => g.id === id)
    if (index !== -1) {
      generations.value[index] = {
        ...generations.value[index],
        status,
        ...updates
      }
    }

    if (currentGeneration.value?.id === id) {
      currentGeneration.value = {
        ...currentGeneration.value,
        status,
        ...updates
      }
    }
  }

  function clearCurrent() {
    currentGeneration.value = null
  }

  function clear() {
    generations.value = []
    currentGeneration.value = null
    total.value = 0
    error.value = null
  }

  return {
    generations,
    currentGeneration,
    total,
    loading,
    error,
    hasMore,
    fetchList,
    fetchById,
    create,
    deleteById,
    updateGenerationStatus,
    clearCurrent,
    clear
  }
})
