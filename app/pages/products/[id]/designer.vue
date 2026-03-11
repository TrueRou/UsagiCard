<script setup lang="ts">
definePageMeta({
    layout: 'full-page',
    pageTransition: {
        name: 'function-page',
        mode: 'out-in',
    },
})

const route = useRoute()
const productId = route.params.id as string // UUID string
const { product } = await useProduct(productId)

const useDesignCtx = await useDesign(
    computed(() => product.value.type.design_type),
    computed(() => product.value.design),
    computed(() => product.value),
)

const designerComponent = computed(() => useDesignCtx.designerComponent.value)
</script>

<template>
    <div class="w-full  relative">
        <component :is="designerComponent" :use-design-ctx="useDesignCtx" />
    </div>
</template>
