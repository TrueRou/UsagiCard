<script setup lang="ts">
definePageMeta({
    layout: 'full-page',
    pageTransition: {
        name: 'function-page',
        mode: 'out-in',
    },
})

const route = useRoute()
const type = route.query.type as string | undefined

const AVAILABLE_TYPES: Record<string, ProductTypeDesign> = {
    0: ProductTypeDesign.UsagiCardDX,
    UsagiCard: ProductTypeDesign.UsagiCardDX,
    UsagiCardDX: ProductTypeDesign.UsagiCardDX,
    1: ProductTypeDesign.UsagiCardWars,
    UsagiCardWars: ProductTypeDesign.UsagiCardWars,
}

// 使用 useDesign，fromProduct 和 fromArtifact 均为 undefined 表示预览模式
const useDesignCtx = await useDesign(computed(() => {
    return AVAILABLE_TYPES[type ?? '0'] ?? ProductTypeDesign.UsagiCardDX
}))

const designerComponent = computed(() => useDesignCtx.designerComponent.value)
</script>

<template>
    <div class="w-full overflow-y-scroll">
        <!-- 预览模式提示条 -->
        <div class="flex items-center justify-center gap-3 px-4 py-2 text-sm shrink-0 bg-warning text-warning-content">
            <Icon name="mdi:eye-outline" class="w-4 h-4 shrink-0" />
            <span>预览模式 — 设计无法保存，满意后请前往下单</span>
            <NuxtLink to="/marketplace" class="btn btn-xs btn-neutral shrink-0">
                了解如何下单
            </NuxtLink>
        </div>
        <!-- 设计器主体 -->
        <div class="w-full overflow-y-scroll relative">
            <component :is="designerComponent" :use-design-ctx="useDesignCtx" />
        </div>
    </div>
</template>
