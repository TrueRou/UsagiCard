<script lang="ts" setup>
const { allSeries } = useMarketplaceSeriesMap()

const selectedSeriesKey = ref<MarketplaceSeriesKey>('usagicard')

const selectedSeries = computed(() => {
    return allSeries.value.find(series => series.key === selectedSeriesKey.value) ?? allSeries.value[0]
})

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
    title: '工坊 - 兔兔实验室',
})
</script>

<template>
    <div class="max-w-6xl mx-auto px-6 sm:px-10 pt-12 pb-16">
        <section>
            <p class="text-xs font-semibold tracking-[0.3em] uppercase text-primary">
                Marketplace
            </p>
            <h1 class="text-3xl sm:text-4xl font-semibold mt-2">
                UsagiLab 工坊
            </h1>
            <p class="text-sm sm:text-base text-base-content/70 mt-3 max-w-3xl">
                在这里挑选你喜欢的系列，可以先尝试设计，满意后再下单。每个系列都有独特的设计风格和功能定位，总有一款适合你。
            </p>
        </section>

        <section id="series" class="pt-8">
            <h2 class="text-xl font-semibold">
                系列筛选
            </h2>
            <div class="mt-4 flex flex-wrap gap-2">
                <button
                    v-for="series in allSeries"
                    :key="series.key"
                    class="btn btn-sm"
                    :class="selectedSeriesKey === series.key ? 'btn-primary' : 'btn-outline'"
                    @click="selectedSeriesKey = series.key"
                >
                    {{ series.name }}
                </button>
            </div>
        </section>

        <section v-if="selectedSeries" id="products" class="pt-8">
            <header class="mb-4">
                <h2 class="text-2xl font-semibold">
                    {{ selectedSeries.title }}
                </h2>
                <p class="text-sm text-base-content/70 mt-1">
                    {{ selectedSeries.summary }}
                </p>
            </header>

            <div class="overflow-x-auto border border-base-300 rounded-xl bg-base-100">
                <table class="table table-zebra w-full min-w-230">
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>定位</th>
                            <th>账号系统</th>
                            <th>卡片主页</th>
                            <th>差异说明</th>
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
                                <span class="badge badge-outline">{{ sku.priceHint }}</span>
                            </td>
                            <td>
                                <span class="badge" :class="sku.accountSupport ? 'badge-success' : 'badge-ghost'">
                                    {{ sku.accountSupport ? '支持' : '不支持' }}
                                </span>
                            </td>
                            <td>
                                <span class="badge" :class="sku.cardPageSupport ? 'badge-success' : 'badge-ghost'">
                                    {{ sku.cardPageSupport ? '支持' : '不支持' }}
                                </span>
                            </td>
                            <td class="text-sm text-base-content/80">
                                {{ sku.difference }}
                            </td>
                            <td>
                                <div class="flex justify-end gap-2">
                                    <NuxtLink class="btn btn-xs btn-outline" :to="`/marketplace/${sku.slug}`">
                                        详情
                                    </NuxtLink>
                                    <NuxtLink class="btn btn-xs btn-primary" :to="`/designer?type=${sku.designerType}`">
                                        设计
                                    </NuxtLink>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <section id="gallery" class="pt-8">
            <h2 class="text-xl font-semibold">
                用户返图
            </h2>
            <p class="text-sm text-base-content/70 mt-2">
                <!-- 资源目录已预留到 /public/media/feedback，替换文件即可上线展示。 -->
            </p>
            <ul class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <li v-for="n in 8" :key="n" class="aspect-square rounded-xl bg-base-200 border border-base-300 grid place-items-center text-xs text-base-content/60">
                    feedback {{ n }}
                </li>
            </ul>
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
            <div class="mt-5 flex flex-wrap gap-2">
                <NuxtLink class="btn btn-primary btn-sm" to="/designer?type=0">
                    先试设计器
                </NuxtLink>
                <NuxtLink class="btn btn-ghost btn-sm" to="/auth/register?redirect=/marketplace">
                    注册后再下单
                </NuxtLink>
            </div>
        </section>
    </div>
</template>
