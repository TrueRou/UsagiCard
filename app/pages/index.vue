<script lang="ts" setup>
import type { Ref } from 'vue'

useHead({
    title: 'Bunny — Crafted for Collectors',
})

type ProductCategory = 'all' | 'bunny' | 'pass'

interface ProductCard {
    slug: string
    title: string
    subtitle: string
    price: string
    badge?: string
    category: ProductCategory
    accent: string
    image: string
}

const tabs: { id: ProductCategory, label: string }[] = [
    { id: 'all', label: '所有产品' },
    { id: 'bunny', label: '兔卡系列' },
    { id: 'pass', label: '通行证系列' },
]

const products: ProductCard[] = [
    {
        slug: 'card-film',
        title: '卡贴',
        subtitle: '雾面陶瓷涂层，贴合每一次触碰。',
        price: 'RMB 199 起',
        badge: '全新',
        category: 'bunny',
        accent: 'from-indigo-500 to-blue-500',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80',
    },
    {
        slug: 'nfc-card',
        title: 'NFC 卡片',
        subtitle: '一触即发的灵动体验，瞬间连接游戏世界。',
        price: 'RMB 299 起',
        category: 'bunny',
        accent: 'from-slate-900 to-gray-700',
        image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80',
    },
    {
        slug: 'aime-card',
        title: 'AIME 卡片',
        subtitle: '针对音游玩家调校，记录每一次完美演出。',
        price: 'RMB 349 起',
        category: 'bunny',
        accent: 'from-amber-500 to-orange-500',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    },
    {
        slug: 'aime-plus',
        title: 'AIME 兼容卡',
        subtitle: '跨区域通用，云端备份，随时召回你的战绩。',
        price: 'RMB 369 起',
        category: 'bunny',
        accent: 'from-rose-500 to-pink-500',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    },
    {
        slug: 'bunny-pass',
        title: '通行证',
        subtitle: '一张卡，一座城市的沉浸式体验。',
        price: 'RMB 429 起',
        category: 'pass',
        accent: 'from-emerald-500 to-teal-500',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    },
]

const activeTab: Ref<ProductCategory> = ref('all')

const filteredProducts = computed(() => {
    if (activeTab.value === 'all') {
        return products
    }
    return products.filter(item => item.category === activeTab.value)
})

const advertisingTiles = [
    {
        title: 'Bunny Cloud',
        description: '跨终端数据同步，玩家记录、收藏进度与设备偏好均可一键漫游。',
        imagery: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
    },
    {
        title: 'Studio Crafted',
        description: '由内部工作室手工调校色彩与材质，确保每一张卡都拥有艺术品级质感。',
        imagery: 'https://images.unsplash.com/photo-1500534319217-43b75f4525e0?auto=format&fit=crop&w=1200&q=80',
    },
]
</script>

<template>
    <!-- eslint-disable vue/singleline-html-element-content-newline -->
    <div class="bg-slate-950 text-slate-50">
        <section class="max-w-6xl mx-auto px-6 sm:px-10 pt-24 pb-16">
            <p class="text-xs font-semibold tracking-[0.4em] uppercase text-slate-400 mb-4">Bunny Studio</p>
            <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight mb-6">充满仪式感的商业产品主页</h1>
            <p class="text-lg text-slate-300 max-w-3xl">
                我们以音乐与收藏的灵感，打造适配每一位创造者的高端 NFC 生态。选择你的系列，让工艺与科技共同点亮下一段故事。
            </p>
            <div class="mt-12 border border-slate-800 rounded-3xl bg-slate-900/50 p-1 flex flex-wrap gap-2">
                <button
                    v-for="tab in tabs"
                    :key="tab.id"
                    class="flex-1 min-w-[140px] rounded-2xl py-3 text-center text-sm font-medium transition"
                    :class="[
                        activeTab === tab.id
                            ? 'bg-white text-slate-900'
                            : 'text-slate-400 hover:text-white hover:bg-white/5',
                    ]"
                    @click="activeTab = tab.id"
                >
                    {{ tab.label }}
                </button>
            </div>

            <div class="mt-12 grid gap-8 md:grid-cols-2">
                <article
                    v-for="product in filteredProducts"
                    :key="product.slug"
                    class="group bg-white/5 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur"
                >
                    <div class="flex flex-col gap-6 p-8">
                        <div class="flex items-center gap-3">
                            <span
                                v-if="product.badge"
                                class="text-xs font-semibold tracking-wide uppercase text-amber-400"
                            >
                                {{ product.badge }}
                            </span>
                            <span class="text-sm text-slate-400">Bunny Collection</span>
                        </div>
                        <div>
                            <h2 class="text-3xl font-semibold text-white">{{ product.title }}</h2>
                            <p class="text-slate-300 mt-3">{{ product.subtitle }}</p>
                        </div>
                        <div class="text-base text-slate-200">{{ product.price }}</div>
                        <div
                            class="aspect-[5/3] w-full rounded-3xl bg-gradient-to-br shadow-2xl overflow-hidden"
                            :class="product.accent"
                        >
                            <img :src="product.image" :alt="product.title" class="w-full h-full object-cover mix-blend-luminosity">
                        </div>
                        <div class="flex flex-wrap gap-4">
                            <NuxtLink
                                :to="`/products/${product.slug}`"
                                class="px-5 py-2 rounded-full text-sm font-semibold bg-white text-slate-900"
                            >
                                进一步了解
                            </NuxtLink>
                            <button
                                type="button"
                                class="px-5 py-2 rounded-full text-sm font-semibold border border-white/30 text-white hover:bg-white/10"
                            >
                                立即定制
                            </button>
                        </div>
                    </div>
                </article>
            </div>
        </section>

        <section class="bg-black/20 border-t border-b border-white/5">
            <div class="max-w-6xl mx-auto px-6 sm:px-10 py-20 space-y-10">
                <div class="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <p class="text-xs tracking-[0.4em] uppercase text-slate-500 mb-4">Global System</p>
                        <h2 class="text-4xl font-semibold mb-6">广告展示 · 系统级体验</h2>
                        <p class="text-slate-300 leading-relaxed">
                            从云端服务到线下体验，我们构建了一套纵向一体化的商业系统。这里展示的是一段持续更新的旅程：
                            透过全息光泽、雕刻工艺以及可编程功能件，帮助品牌在任何场景都保持极致辨识度。
                        </p>
                        <div class="mt-8 grid sm:grid-cols-2 gap-6">
                            <div class="rounded-2xl border border-white/10 p-6">
                                <p class="text-sm uppercase tracking-[0.2em] text-slate-400">实时联动</p>
                                <p class="text-2xl font-semibold mt-3">24 城市节点</p>
                                <p class="text-sm text-slate-400 mt-2">覆盖实体店、展览与主题巡游。</p>
                            </div>
                            <div class="rounded-2xl border border-white/10 p-6">
                                <p class="text-sm uppercase tracking-[0.2em] text-slate-400">高保密</p>
                                <p class="text-2xl font-semibold mt-3">链路加密</p>
                                <p class="text-sm text-slate-400 mt-2">引入硬件级安全模块，守护玩家资产。</p>
                            </div>
                        </div>
                    </div>
                    <div class="relative">
                        <div class="absolute inset-0 blur-3xl bg-gradient-to-r from-indigo-500/40 via-purple-500/30 to-pink-500/30" />
                        <div class="relative grid gap-6">
                            <article
                                v-for="tile in advertisingTiles"
                                :key="tile.title"
                                class="rounded-[28px] overflow-hidden border border-white/10 bg-white/5 backdrop-blur"
                            >
                                <img :src="tile.imagery" :alt="tile.title" class="w-full h-48 object-cover">
                                <div class="p-6">
                                    <p class="text-sm uppercase tracking-[0.4em] text-slate-400">Signature</p>
                                    <h3 class="text-2xl font-semibold mt-3">{{ tile.title }}</h3>
                                    <p class="text-slate-300 mt-3">{{ tile.description }}</p>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>
