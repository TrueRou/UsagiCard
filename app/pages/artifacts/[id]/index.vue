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
const { artifact, storageSave, useDesignCtx } = await useArtifact(artifactId)
const adaptiveComponent = computed(() => useDesignCtx.adaptiveViewComponent.value)

useHead({
    title: `${artifact.value.type.name} - 兔兔实验室`,
})
</script>

<template>
    <div class="w-full h-full overflow-hidden relative">
        <component
            :is="adaptiveComponent"
            :use-design-ctx="useDesignCtx"
            :storage-save="storageSave"
        />
    </div>
</template>
