import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('globalLoading', () => {
    const loadingCount = ref(0)

    const isLoading = computed(() => loadingCount.value > 0)

    const startLoading = () => {
        loadingCount.value++
    }

    const stopLoading = () => {
        loadingCount.value = Math.max(0, loadingCount.value - 1)
    }

    const resetLoading = () => {
        loadingCount.value = 0
    }

    return {
        isLoading: readonly(isLoading),
        startLoading,
        stopLoading,
        resetLoading
    }
})