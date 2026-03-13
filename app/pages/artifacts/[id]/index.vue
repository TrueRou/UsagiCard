<script setup lang="ts">
definePageMeta({
    layout: 'full-page',
    pageTransition: {
        name: 'function-page',
        mode: 'out-in',
    },
})

const route = useRoute()
const artifactId = route.params.id as string // UUID string
const { artifact, useDesignCtx, storageSave } = await useArtifact(artifactId)
const adaptiveComponent = computed(() => useDesignCtx.adaptiveViewComponent.value)

useHead({
    title: `${artifact.value.product.type.name} - 兔兔实验室`,
})

const { startPhase1 } = useTour(artifact, storageSave)

onMounted(() => {
    const storage = artifact.value.storage as UsagiCardStorage
    if (!storage?.skip_tour) {
        setTimeout(() => startPhase1(), 500)
    }
})
</script>

<template>
    <div class="w-full h-full overflow-hidden relative">
        <component :is="adaptiveComponent" :use-design-ctx="useDesignCtx" />
    </div>
</template>
