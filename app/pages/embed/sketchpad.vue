<script setup lang="ts">
import type { ProductTypeDesign } from '~/types/api'

definePageMeta({
    layout: 'embed',
})

const MESSAGE_SOURCE = 'leporidae-sketchpad'
const CARD_RATIO = 3.370 / 2.125

const { width } = useWindowSize()
const previewWidth = computed(() => Math.max(Math.floor(width.value), 1))

const containerRef = useTemplateRef<HTMLElement>('container')
const parentOrigin = ref<string>()
const design = shallowRef<Record<string, unknown>>()
const designType = ref<ProductTypeDesign>()
const side = ref<'front' | 'back'>('front')
const errorMessage = ref<string>()

function post(type: string, payload?: Record<string, unknown>) {
    if (!parentOrigin.value) {
        return
    }
    window.parent.postMessage({ source: MESSAGE_SOURCE, type, payload }, parentOrigin.value)
}

function onMessage(event: MessageEvent) {
    // 只接受嵌入方（referrer origin）发来的 render 消息；embed 页不调 API、不持会话，无更多来源限制
    if (event.origin !== parentOrigin.value) {
        return
    }
    const data = event.data
    if (!data || data.source !== MESSAGE_SOURCE || data.type !== 'render') {
        return
    }
    const payload = data.payload ?? {}
    design.value = payload.design ?? {}
    designType.value = payload.designType as ProductTypeDesign
    side.value = payload.side === 'back' ? 'back' : 'front'
    errorMessage.value = undefined
}

onMounted(() => {
    // 通过 referrer 确定唯一可能的嵌入方 origin，作为所有上行消息的 targetOrigin
    try {
        parentOrigin.value = new URL(document.referrer).origin
    }
    catch {
        // referrer 为空或非法时保持静默，页面停留在等待态
    }
    window.addEventListener('message', onMessage)
    post('ready')
})

onBeforeUnmount(() => {
    window.removeEventListener('message', onMessage)
})

onErrorCaptured((err) => {
    errorMessage.value = err instanceof Error ? err.message : String(err)
    post('error', { message: errorMessage.value })
    return false
})

// 渲染完成后实测容器尺寸回报给父页面（DesignPreview 根节点有固定宽高样式，尺寸是确定的）
watch([design, designType, side, previewWidth], async () => {
    if (!design.value || !designType.value) {
        return
    }
    await nextTick()
    const el = containerRef.value
    if (el) {
        post('rendered', { width: el.clientWidth, height: el.clientHeight })
    }
})

useHead({
    title: '设计预览',
})
</script>

<template>
    <div ref="container" class="w-full min-h-screen flex flex-col items-center justify-start">
        <ClientOnly>
            <DesignPreview
                v-if="design && designType"
                :design="design"
                :design-type="designType"
                :side="side"
                :width="previewWidth"
            />
            <div
                v-else
                class="flex items-center justify-center text-base-content/30 text-xs"
                :style="{ width: `${previewWidth}px`, height: `${Math.round(previewWidth * CARD_RATIO)}px` }"
            >
                {{ errorMessage ?? '等待设计数据…' }}
            </div>
        </ClientOnly>
    </div>
</template>
