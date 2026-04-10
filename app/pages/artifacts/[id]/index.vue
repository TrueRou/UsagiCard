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
const { artifact, storageOf, storageSave, useDesignCtx } = await useArtifact(artifactId)
const adaptiveComponent = computed(() => useDesignCtx.adaptiveViewComponent.value)

useHead({
    title: `${artifact.value.product.type.name} - 兔兔实验室`,
})

const { startPhase1 } = useTour(artifact, storageOf, storageSave)

onMounted(() => {
    const ucStorage = storageOf('UsagiCard').value
    if (!ucStorage?.skip_tour) {
        setTimeout(() => startPhase1(), 500)
    }
})
</script>

<template>
    <div class="w-full h-full overflow-hidden relative">
        <component :is="adaptiveComponent" :use-design-ctx="useDesignCtx" :storage-save="storageSave" />
    </div>
</template>
