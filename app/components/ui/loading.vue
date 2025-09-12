<template>
  <Transition name="loading">
    <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-base-300/50 backdrop-blur-sm">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { isLoading } = useLoadingStore()
</script>

<style scoped>
.loading-enter-active,
.loading-leave-active {
  transition: opacity 0.2s ease;
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}
</style>