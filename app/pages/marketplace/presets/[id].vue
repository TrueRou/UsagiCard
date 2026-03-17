<script setup lang="ts">
interface MarketplacePresetDetail {
    id: string
    product_name: string
    product_description: string
    product_design: Record<string, unknown>
    product_material_id: string
    product_type_id: string
    material: ProductMaterialPublic
    type: ProductTypePublic
}

const route = useRoute()

const presetId = computed(() => {
    const raw = route.params.id
    if (Array.isArray(raw))
        return raw[0] ?? ''
    return raw ?? ''
})

if (!presetId.value) {
    await navigateTo('/marketplace')
}

const { data: preset, error } = await useLeporid<MarketplacePresetDetail>(`/api/platform/presets/${presetId.value}`, {
    server: true,
})

if (error.value || !preset.value) {
    await navigateTo('/marketplace')
}

useHead({
    title: `${preset.value?.product_name ?? '预设详情'} - 市场`,
})

async function handleContinue() {
    if (!preset.value)
        return
    await navigateTo(`/marketplace/products?preset=${encodeURIComponent(preset.value.id)}`)
}
</script>

<template>
    <div class="max-w-3xl mx-auto px-6 sm:px-10 py-10">
        <NuxtLink to="/marketplace" class="link link-hover text-sm text-base-content/70">
            ← 返回市场
        </NuxtLink>

        <section v-if="preset" class="mt-4 space-y-4">
            <div>
                <h1 class="text-2xl sm:text-3xl font-semibold">
                    {{ preset.product_name }}
                </h1>
                <p class="text-sm sm:text-base text-base-content/70 mt-2">
                    {{ preset.product_description }}
                </p>
            </div>

            <div class="grid sm:grid-cols-2 gap-3">
                <div class="border border-base-300 rounded-lg p-4">
                    <p class="text-xs uppercase tracking-wider text-base-content/60 mb-1">
                        材料
                    </p>
                    <p class="font-medium">
                        {{ preset.material.name }}
                    </p>
                    <p class="text-sm text-base-content/70 mt-1">
                        {{ preset.material.description }}
                    </p>
                </div>
                <div class="border border-base-300 rounded-lg p-4">
                    <p class="text-xs uppercase tracking-wider text-base-content/60 mb-1">
                        类型
                    </p>
                    <p class="font-medium">
                        {{ preset.type.name }}
                    </p>
                    <p class="text-sm text-base-content/70 mt-1">
                        {{ preset.type.description }}
                    </p>
                </div>
            </div>

            <div class="pt-2 flex justify-end">
                <button class="btn btn-primary" @click="handleContinue">
                    确认并继续下单
                </button>
            </div>
        </section>
    </div>
</template>
