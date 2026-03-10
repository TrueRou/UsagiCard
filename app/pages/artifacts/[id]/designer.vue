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
const designerComponent = computed(() => useDesignCtx.designerComponent.value)
</script>

<template>
    <div class="w-full h-full overflow-hidden relative">
        <component :is="designerComponent" :use-design-ctx="useDesignCtx" />
    </div>
</template>
