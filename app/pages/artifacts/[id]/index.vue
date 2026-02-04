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

// onMounted(async () => {
//     card.value = await cardStore.fetchCard(props.uuid);
//     if (card.value && card.value.status == CardStatus.ACTIVATED && card.value.properties.derived_from) {
//         router.replace({ params: { uuid: card.value.properties.derived_from } });
//         return;
//     }
// })

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
        <component :is="sketchpadComponent" ref="sketchpad" :artifact-ctx="artifactCtx" :artifact-design="artifactDesign" />
    </div>
</template>

<style scoped>
.absolute-center {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    transform-origin: top left;
}

.font-adjust {
    -webkit-text-size-adjust: auto;
}
</style>
