<script setup lang="ts">
import type { ProductTypeDesign } from '~/types/api'
import { ArtifactDisplayMode, ProductTypeDesign as PTD } from '~/types/api'

const props = withDefaults(defineProps<{
    design: Record<string, unknown>
    designType: ProductTypeDesign
    side?: 'front' | 'back'
    width?: number
}>(), {
    side: 'front',
    width: 214,
})

const CARD_WIDTH_PX = 204
const CARD_RATIO = 3.370 / 2.125

const designRef = computed(() => props.design)
const typeRef = computed(() => props.designType)

const supported = computed(() => props.designType === PTD.USAGI_CARD_DX)

const ctx = useDesign(designRef, typeRef)
ctx.sketchpadScale.value = props.width / CARD_WIDTH_PX
ctx.displayMode.value = props.side === 'back' ? ArtifactDisplayMode.SKETCHPAD_BACK : ArtifactDisplayMode.SKETCHPAD_FRONT

watch(() => [props.side, props.width], () => {
    ctx.sketchpadScale.value = props.width / CARD_WIDTH_PX
    ctx.displayMode.value = props.side === 'back' ? ArtifactDisplayMode.SKETCHPAD_BACK : ArtifactDisplayMode.SKETCHPAD_FRONT
})

const height = computed(() => Math.round(props.width * CARD_RATIO))
const sketchpadComponent = computed(() => supported.value ? ctx.sketchpadComponent.value : undefined)
</script>

<template>
    <div
        class="relative overflow-hidden rounded-xl bg-base-200 mx-auto"
        :style="{ width: `${width}px`, height: `${height}px` }"
    >
        <component
            :is="sketchpadComponent"
            v-if="sketchpadComponent"
            :use-design-ctx="ctx"
        />
        <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-base-content/40">
            <Icon name="mdi:card-outline" class="w-10 h-10" />
            <p class="text-xs">
                该类型暂不支持预览
            </p>
        </div>
    </div>
</template>
