<script lang="ts" setup>
const { allSeries } = useMarketplaceSeriesMap()

useHead({
    title: '欢迎 - 兔兔实验室',
})
</script>

<template>
    <div class="pb-16">
        <section class="max-w-6xl mx-auto px-6 sm:px-10 pt-20 pb-12">
            <p class="text-xs font-semibold tracking-[0.35em] uppercase mb-3">
                兔兔实验室 · UsagiLab
            </p>
            <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight mb-6">
                一起创造独特的礼物吧<br>{{ 'Ｃｉａｌｌｏ～（∠・ω＜ ）⌒★' }}
            </h1>
            <p class="text-base sm:text-lg max-w-3xl text-base-content/80">
                UsagiLab 是一个可以自由定制周边的创作空间。快速定制属于你的高技术力周边
                <br>
                从创意到成品一步到位
            </p>
            <div class="mt-7 flex flex-wrap gap-3">
                <NuxtLink class="btn btn-primary" to="/marketplace">
                    浏览工坊
                </NuxtLink>
                <NuxtLink class="btn btn-outline" to="/designer?type=0">
                    尝试设计
                </NuxtLink>
            </div>
        </section>

        <section class="max-w-6xl mx-auto px-6 sm:px-10 py-6">
            <ul class="grid gap-4 sm:grid-cols-2">
                <li
                    v-for="series in allSeries"
                    :key="series.key"
                    class="rounded-2xl border border-base-300 p-5 bg-base-100"
                >
                    <p class="text-xs uppercase tracking-[0.2em] text-primary">
                        SERIES
                    </p>
                    <h3 class="text-xl font-semibold mt-2">
                        {{ series.title }}
                    </h3>
                    <p class="text-sm text-base-content/70 mt-2">
                        {{ series.summary }}
                    </p>
                    <NuxtLink class="btn btn-accent btn-sm mt-4 -ml-2" to="/marketplace#series">
                        查看系列商品 →
                    </NuxtLink>
                </li>
            </ul>
        </section>

        <section class="max-w-6xl mx-auto px-6 sm:px-10 py-6">
            <div class="grid gap-4 lg:grid-cols-3">
                <!-- <div class="rounded-2xl border border-base-300 bg-base-100 p-4 lg:col-span-2">
                    <p class="text-sm font-semibold mb-2">
                        宣传视频
                    </p>
                    <video
                        class="w-full rounded-xl bg-base-200 aspect-video"
                        controls
                        preload="metadata"
                        poster="/media/placeholders/promo-cover.webp"
                    >
                        <source src="/media/promo/usagicard-trailer-v1.mp4" type="video/mp4">
                    </video>
                </div> -->
                <div class="rounded-2xl border border-base-300 bg-base-100 p-4">
                    <p class="text-sm font-semibold mb-2">
                        返图位（示例）
                    </p>
                    <ul class="grid grid-cols-2 gap-2">
                        <li v-for="n in 4" :key="n" class="aspect-square rounded-lg bg-base-200 grid place-items-center text-xs text-base-content/60">
                            feedback {{ n }}
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    </div>
</template>
