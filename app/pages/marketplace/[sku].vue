<script lang="ts" setup>
const route = useRoute()
const skuSlug = computed(() => String(route.params.sku || ''))

const { findSkuBySlug } = useMarketplaceSeriesMap()

const currentSku = computed(() => findSkuBySlug(skuSlug.value))

if (!currentSku.value) {
    throw createError({
        statusCode: 404,
        statusText: '商品不存在',
        fatal: true,
    })
}

const sku = computed(() => currentSku.value!)

const capabilities = computed(() => [
    {
        label: '账号系统',
        value: sku.value.accountSupport ? '支持' : '不支持',
    },
    {
        label: '卡片主页',
        value: sku.value.cardPageSupport ? '支持' : '不支持',
    },
])

useHead(() => ({
    title: `${sku.value.name} 工坊 - 兔兔实验室`,
}))
</script>

<template>
    <div class="max-w-5xl mx-auto px-6 sm:px-10 pt-12 pb-16">
        <NuxtLink to="/marketplace" class="btn btn-ghost btn-sm -ml-3">
            ← 返回工坊
        </NuxtLink>

        <section class="pt-3">
            <p class="text-xs uppercase tracking-[0.25em] text-primary font-semibold">
                SKU DETAIL
            </p>
            <h1 class="text-3xl sm:text-4xl font-semibold mt-2">
                {{ sku.name }}
            </h1>
            <p class="text-base text-base-content/75 mt-2">
                {{ sku.subtitle }}
            </p>
            <p class="text-sm text-base-content/75 mt-4 max-w-3xl">
                {{ sku.description }}
            </p>
        </section>

        <section class="pt-7 grid gap-4 md:grid-cols-3">
            <div class="rounded-2xl border border-base-300 bg-base-100 p-5 md:col-span-2">
                <h2 class="text-lg font-semibold">
                    这款的核心差异
                </h2>
                <p class="text-sm text-base-content/75 mt-2">
                    {{ sku.difference }}
                </p>
                <ul class="mt-4 flex flex-wrap gap-2">
                    <li v-for="tag in sku.tags" :key="tag" class="badge badge-outline">
                        {{ tag }}
                    </li>
                </ul>
            </div>

            <div class="rounded-2xl border border-base-300 bg-base-100 p-5">
                <p class="text-sm text-base-content/70">
                    预算定位
                </p>
                <p class="mt-1 font-semibold text-lg">
                    {{ sku.priceHint }}
                </p>
                <p class="text-xs text-base-content/60 mt-3">
                    小提示：先开预览设计，满意后再下单更稳。
                </p>
            </div>
        </section>

        <section class="pt-8">
            <h2 class="text-xl font-semibold">
                功能支持
            </h2>
            <ul class="mt-4 grid gap-3 sm:grid-cols-2">
                <li
                    v-for="capability in capabilities"
                    :key="capability.label"
                    class="rounded-xl border border-base-300 bg-base-100 p-4"
                >
                    <p class="text-sm text-base-content/60">
                        {{ capability.label }}
                    </p>
                    <p class="font-semibold mt-1">
                        {{ capability.value }}
                    </p>
                </li>
            </ul>
        </section>

        <section class="pt-8">
            <h2 class="text-xl font-semibold">
                生产与发货节奏
            </h2>
            <p class="text-sm text-base-content/75 mt-2">
                下单完成后卡片会先进入草稿状态，在锁单前你都可以继续微调。每月 10 / 20 / 30 号锁单，锁单后约两周发货。
            </p>
        </section>

        <section class="pt-8">
            <div class="rounded-2xl border border-primary/30 bg-primary/10 p-6">
                <h2 class="text-xl font-semibold">
                    心动了就开工吧 ✨
                </h2>
                <p class="text-sm text-base-content/80 mt-2">
                    现在进设计器，先把你脑内的卡面具现化！
                </p>
                <div class="mt-4 flex flex-wrap gap-2">
                    <NuxtLink class="btn btn-primary" :to="`/designer?type=${sku.designerType}`">
                        立即开画
                    </NuxtLink>
                    <NuxtLink class="btn btn-ghost" to="/marketplace">
                        再看看其他 SKU
                    </NuxtLink>
                </div>
            </div>
        </section>
    </div>
</template>
