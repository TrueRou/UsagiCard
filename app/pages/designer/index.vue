<script setup lang="ts">
definePageMeta({
    layout: 'full-page',
    pageTransition: {
        name: 'function-page',
        mode: 'out-in',
    },
})

useHead({
    title: '设计 - 兔兔实验室',
})

const route = useRoute()
const productId = route.query.id as string // 正在编辑的产品ID
const productType = route.query.type as unknown as ProductTypeDesign || 0 // 如果没有编辑的产品，预览的设计类型

// 使用 useDesign，fromProduct 和 fromArtifact 均为 undefined 表示预览模式
let useDesignCtx = await useDesign(toRef(productType))

// 如果有 productId，说明正在编辑一个已存在的产品
if (productId) {
    const { product } = await useProduct(productId)

    useDesignCtx = await useDesign(
        computed(() => product.value.type.design_type),
        computed(() => product.value.design),
        computed(() => product.value),
    )

    useHead({
        title: `设计 ${useDesignCtx.designTypeLiteral.value} - 兔兔实验室`,
    })
}

const inPreviewMode = computed(() => !useDesignCtx.fromProduct.value && !useDesignCtx.fromArtifact.value)
const designerComponent = computed(() => useDesignCtx.designerComponent.value)
</script>

<template>
    <div class="w-full flex flex-col h-full relative">
        <!-- 预览模式提示条 -->
        <div v-if="inPreviewMode" class="absolute top-0 w-full z-50 flex items-center justify-center gap-3 px-4 py-2 text-sm bg-warning/90 backdrop-blur text-warning-content">
            <Icon name="mdi:eye-outline" class="w-4 h-4 shrink-0" />
            <span>预览模式 — 设计无法保存，仅供预览参考</span>
            <NuxtLink to="/marketplace" class="btn btn-xs btn-neutral shrink-0">
                返回市场页面
            </NuxtLink>
        </div>
        <!-- 设计器主体 -->
        <component :is="designerComponent" :use-design-ctx="useDesignCtx" class="flex-1" />
    </div>
</template>
