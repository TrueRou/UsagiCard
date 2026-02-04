<script setup lang="ts">
definePageMeta({
    layout: 'full-page',
})

const route = useRoute()
const artifactId = route.params.id as string // UUID string
const artifactCtx = await useArtifact(artifactId)
const artifactDesign = artifactCtx.artifact.value.product.design
const adaptiveComponent = resolveComponent(artifactCtx.adaptiveViewComponent)
</script>

<template>
    <div class="w-full h-full overflow-hidden relative">
        <component :is="adaptiveComponent" :artifact-ctx="artifactCtx" :artifact-design="artifactDesign" />
    </div>
</template>
