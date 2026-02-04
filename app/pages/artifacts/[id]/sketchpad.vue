<script setup lang="ts">
definePageMeta({
    layout: 'full-page',
})

const sketchpadRef = useTemplateRef<any>('sketchpad')
const { width, height } = useWindowSize()

const route = useRoute()
const artifactId = route.params.id as string // UUID string
const artifactCtx = await useArtifact(artifactId)
const artifactDesign = artifactCtx.artifact.value.product.design
const sketchpadComponent = resolveComponent(artifactCtx.sketchpadComponent)

watchEffect(() => {
    if (sketchpadRef.value?.$el) {
        const cardWidth: number = sketchpadRef.value.$el.clientWidth
        const cardHeight: number = sketchpadRef.value.$el.clientHeight
        artifactCtx.sketchpadScale.value = Math.min(width.value / cardWidth, height.value / cardHeight)
    }
})
</script>

<template>
    <div class="w-full h-full overflow-hidden relative">
        <client-only>
            <component :is="sketchpadComponent" ref="sketchpad" :artifact-ctx="artifactCtx" :artifact-design="artifactDesign" />
        </client-only>
    </div>
</template>
