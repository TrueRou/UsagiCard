<script setup lang="ts">
definePageMeta({
    layout: 'full-page',
    pageTransition: {
        name: 'function-page',
        mode: 'out-in',
    },
})

const route = useRoute()
const typeParam = (route.query.type as string | undefined) ?? 'UsagiCardDX'

// 解析设计类型：支持 UsagiCardDX / UsagiCardWars
const designTypeValue = computed<ProductTypeDesign>(() => {
    if (typeParam === 'UsagiCardWars')
        return ProductTypeDesign.UsagiCardWars
    return ProductTypeDesign.UsagiCardDX
})

const designTypeLabel = computed(() => {
    return typeParam === 'UsagiCardWars' ? 'UsagiCard WARS' : 'UsagiCard DX'
})

// 构造用于预览的模拟商品信息（不对应数据库实体）
const previewProduct = ref<ProductSimpleResponse>({
    id: '00000000-0000-0000-0000-000000000000',
    design: {},
    type: {
        id: '00000000-0000-0000-0000-000000000000',
        name: designTypeLabel.value,
        description: '预览模式',
        design_type: designTypeValue.value,
        function_types: [],
    },
})

// 使用 useDesign，fromArtifact 为 undefined 表示预览模式（无工件绑定）
const useDesignCtx = await useDesign(
    designTypeValue,
    computed(() => previewProduct.value.design),
    previewProduct as Ref<ProductSimpleResponse>,
    ref(undefined),
)

const designerComponent = computed(() => useDesignCtx.designerComponent.value)
</script>

<template>
    <div class="flex flex-col h-dvh">
        <!-- 预览模式提示条 -->
        <div class="flex items-center justify-center gap-3 px-4 py-2 text-sm shrink-0 bg-warning text-warning-content">
            <Icon name="mdi:eye-outline" class="w-4 h-4 shrink-0" />
            <span>预览模式 — 设计无法保存，满意后请前往下单</span>
            <NuxtLink to="/marketplace" class="btn btn-xs btn-neutral shrink-0">
                了解如何下单
            </NuxtLink>
        </div>
        <!-- 设计器主体 -->
        <div class="flex-1 overflow-hidden relative">
            <component :is="designerComponent" :use-design-ctx="useDesignCtx" />
        </div>
    </div>
</template>
