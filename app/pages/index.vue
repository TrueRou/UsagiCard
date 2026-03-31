<script lang="ts" setup>
const { allSeries } = await useMarketplaceSeriesMap()
const { loggedIn } = useUserSession()
const route = useRoute()

const faqItems = [
    {
        q: '多久发货？',
        a: '每月 10 / 20 / 30 号锁单，锁单后进入制作流程。锁单后通常 2 周内发货，节假日可能会顺延。',
    },
    {
        q: '可以先试设计效果吗？',
        a: '可以，直接进入设计器预览模式，满意后再下单吗，也可以查看我们的展示视频了解更多。',
    },
]

useHead({
    title: '官网 - 兔兔实验室',
})

function getPresetPath(presetId: string) {
    return `/marketplace/presets/${presetId}`
}

function getCheckoutPath(sku: MarketplaceSku) {
    if (sku.presetId)
        return `/marketplace/products?preset=${encodeURIComponent(sku.presetId)}`
    return `/marketplace/products?type=${sku.designerType}`
}

async function handleOrderClick(sku: MarketplaceSku) {
    const target = getCheckoutPath(sku)
    if (!loggedIn.value) {
        return navigateTo(`/auth/login?redirect=${encodeURIComponent(target)}`)
    }
    return navigateTo(target)
}

async function handleDetailClick(sku: MarketplaceSku) {
    if (sku.presetId)
        return navigateTo(getPresetPath(sku.presetId))
    return navigateTo(`/marketplace/products?type=${sku.designerType}&from=${encodeURIComponent(route.fullPath)}`)
}
</script>

<template>
    <div class="py-4">
        <section class="max-w-6xl mx-auto px-6 sm:px-10">
            <p class="text-xs font-semibold tracking-[0.35em] uppercase mb-3">
                兔兔实验室 · UsagiLab
            </p>
            <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight mb-6">
                一起创造独特的礼物吧<br>{{ 'Ｃｉａｌｌｏ～（∠・ω＜ ）⌒★' }}
            </h1>
            <p class="text-base sm:text-lg max-w-3xl text-base-content/80">
                将独特的设计与个性化的功能结合，快速定制属于你的高技术力周边，从创意到成品一步到位。
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
                <a class="btn btn-accent" href="/docs/index.html">
                    文档
                </a>
                <a class="btn btn-primary" href="/docs/begin.html">
                    快速开始
                </a>
            </div>
        </section>
        <div class="max-w-6xl mx-auto px-6 sm:px-10">
            <section v-for="selectedSeries in allSeries" id="products" :key="selectedSeries.key" class="pt-8">
                <header class="mb-4">
                    <h2 class="text-2xl font-semibold">
                        {{ selectedSeries.title }}
                    </h2>
                    <p class="text-sm text-base-content/70 mt-1">
                        {{ selectedSeries.summary }}
                    </p>
                </header>

                <div v-if="selectedSeries.cover || selectedSeries.showcaseVideo" class="grid sm:grid-cols-2 gap-3">
                    <div v-if="selectedSeries.cover" class="rounded-xl border border-base-300 overflow-hidden bg-base-100">
                        <img :src="selectedSeries.cover" alt="series cover" class="w-full object-cover">
                    </div>
                    <div v-if="selectedSeries.showcaseVideo" class="rounded-xl border border-base-300 overflow-hidden bg-base-100">
                        <video class="w-full h-full aspect-video bg-base-200" controls preload="metadata">
                            <source :src="selectedSeries.showcaseVideo" type="video/mp4">
                        </video>
                    </div>
                </div>

                <div class="flex gap-2 my-2">
                    <template v-for="value in selectedSeries.channelLinks" :key="value.url">
                        <a :href="value.url" target="_blank" class="btn btn-sm" :class="[value.buttonClass || 'btn-outline']">
                            <div v-if="value.svgContent" v-html="value.svgContent" />
                            {{ value.name }}
                        </a>
                    </template>
                    <NuxtLink class="btn btn-sm btn-secondary" :to="{ path: '/marketplace', query: { key: selectedSeries.key } }">
                        详情
                    </NuxtLink>
                </div>

                <div class="overflow-x-auto border border-base-300 rounded-xl bg-base-100">
                    <table class="table table-zebra w-full min-w-230">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>材料</th>
                                <th>功能</th>
                                <th>价格</th>
                                <th class="text-right">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="sku in selectedSeries.skus" :key="sku.slug">
                                <td>
                                    <p class="font-medium">
                                        {{ sku.name }}
                                    </p>
                                    <p class="text-xs text-base-content/60 mt-1">
                                        {{ sku.subtitle }}
                                    </p>
                                </td>
                                <td>
                                    <div class="flex gap-2 text-nowrap">
                                        <span v-for="tag in sku.materialTags" :key="tag" class="badge badge-outline">{{ tag }}</span>
                                    </div>
                                </td>
                                <td>
                                    <div class="flex gap-2 text-nowrap">
                                        <span v-for="tag in sku.functionTags" :key="tag" class="badge badge-outline">{{ tag }}</span>
                                    </div>
                                </td>
                                <td>
                                    <p class="font-medium">
                                        {{ sku.startPrice }}
                                    </p>
                                </td>
                                <td>
                                    <div class="flex justify-end gap-2">
                                        <button class="btn btn-xs btn-outline" @click="handleDetailClick(sku)">
                                            详情
                                        </button>
                                        <button class="btn btn-xs btn-primary" @click="handleOrderClick(sku)">
                                            下单
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section id="faq" class="pt-10">
                <h2 class="text-xl font-semibold">
                    购买须知
                </h2>
                <ul class="mt-4 grid gap-3">
                    <li v-for="item in faqItems" :key="item.q" class="rounded-xl border border-base-300 bg-base-100 p-4">
                        <p class="font-semibold">
                            {{ item.q }}
                        </p>
                        <p class="text-sm text-base-content/70 mt-1">
                            {{ item.a }}
                        </p>
                    </li>
                </ul>
            </section>
        </div>
    </div>
</template>
