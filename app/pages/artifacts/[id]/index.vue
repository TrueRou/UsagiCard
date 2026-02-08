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
const { useDesignCtx } = await useArtifact(artifactId)
const adaptiveComponent = computed(() => useDesignCtx.adaptiveViewComponent.value)
</script>

<template>
    <div class="w-full h-full overflow-hidden relative">
        <component :is="adaptiveComponent" :use-design-ctx="useDesignCtx" />
    </div>
</template>
