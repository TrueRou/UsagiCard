<script setup lang="ts">
definePageMeta({
    layout: 'full-page',
})

const sketchpadRef = useTemplateRef<any>('sketchpad')
const { width, height } = useWindowSize()

const route = useRoute()
const artifactId = route.params.id as string // UUID string
const { useDesignCtx } = await useArtifact(artifactId)
const sketchpadComponent = computed(() => useDesignCtx.sketchpadComponent.value)

useHead({
    title: '工件详情 - 兔兔实验室',
})

const shouldRender = ref(false)

watchEffect(() => {
    if (route.query.back === '1') {
        useDesignCtx.displayMode.value = ArtifactDisplayMode.SKETCHPAD_BACK
    }
    if (sketchpadRef.value?.$el) {
        const cardWidth: number = sketchpadRef.value.$el.clientWidth
        const cardHeight: number = sketchpadRef.value.$el.clientHeight
        useDesignCtx.sketchpadScale.value = Math.min(width.value / cardWidth, height.value / cardHeight)
    }
})

onMounted(() => {
    shouldRender.value = true
})
</script>

<template>
    <div class="w-full h-full overflow-hidden relative">
        <component :is="sketchpadComponent" v-if="shouldRender" ref="sketchpad" class="absolute-center" :use-design-ctx="useDesignCtx" />
    </div>
</template>

<style scoped>
.absolute-center {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    transform-origin: top left;
}
</style>
