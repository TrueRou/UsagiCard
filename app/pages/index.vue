<script lang="ts" setup>
import type { Ref } from 'vue'

useHead({
    title: '月兔礼品 — Bunny Presents',
})

type ProductCategory = 'all' | 'bunny'

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
]

const products: ProductCard[] = [
    {
        slug: 'usagicard',
        title: 'UsagiCard - 兔卡',
        subtitle: '支持游戏账号系统的NFC小卡片，目前为舞萌提供查分器更新、最佳成绩展示等功能，未来将支持更多游戏和功能。',
        price: 'RMB 18.80 起',
        badge: '推荐',
        category: 'bunny',
        accent: 'from-blue-500 to-sky-400',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80',
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
        title: '先设计，再下单',
        signature: '',
        description: '还在犹豫定制效果？提前访问设计器，自由搭配素材与版式，满意后再下单，所见即所得。',
        imagery: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?auto=format&fit=crop&w=1200&q=80',
    },
    {
        title: '规律发货，安心等待',
        signature: '',
        description: '在正常生产周期中，我们将在每月 10 / 20 / 30 日锁定订单并投入制作，锁定后两周内完成发货，感谢您的耐心与支持。',
        imagery: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    },
]
</script>

<template>
    <!-- eslint-disable vue/singleline-html-element-content-newline -->
    <div class="bg-slate-950 text-slate-50">
        <section class="max-w-6xl mx-auto px-6 sm:px-10 pt-24 pb-16">
            <p class="text-xs font-semibold tracking-[0.4em] uppercase text-slate-400 mb-4">月兔礼品 · Bunny Presents</p>
            <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight mb-6">为每一个值得纪念的瞬间<br>带来独特的礼物</h1>
            <p class="text-lg text-slate-300 max-w-3xl">
                月兔礼品专注于创意定制周边商品，目前推出兔卡系列——可自定义设计的 NFC 卡片，更多产品系列也在筹备中。
            </p>
            <div class="mt-12 border border-slate-800 rounded-3xl bg-slate-900/50 p-1 flex flex-wrap gap-2">
                <button
                    v-for="tab in tabs"
                    :key="tab.id"
                    class="flex-1 min-w-35 rounded-2xl py-3 text-center text-sm font-medium transition"
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
                    class="group bg-white/5 border border-white/5 rounded-4xl overflow-hidden backdrop-blur"
                >
                    <div class="flex flex-col gap-6 p-8">
                        <div class="flex items-center gap-3">
                            <span
                                v-if="product.badge"
                                class="text-xs font-semibold tracking-wide uppercase text-amber-400"
                            >
                                {{ product.badge }}
                            </span>
                            <span class="text-sm text-slate-400">兔卡系列</span>
                        </div>
                        <div>
                            <h2 class="text-3xl font-semibold text-white">{{ product.title }}</h2>
                            <p class="text-slate-300 mt-3">{{ product.subtitle }}</p>
                        </div>
                        <div class="text-base text-slate-200">{{ product.price }}</div>
                        <div
                            class="aspect-5/3 w-full rounded-3xl bg-linear-to-br shadow-2xl overflow-hidden"
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
                        <p class="text-xs tracking-[0.4em] uppercase text-slate-500 mb-4">月兔礼品 · Bunny Presents</p>
                        <h2 class="text-4xl font-semibold mb-6">用心做好每一件产品</h2>
                        <p class="text-slate-300 leading-relaxed">
                            我们专注于小批量精品定制，目前主力产品为兔卡系列。每一张卡片均可通过在线设计器自由创作，下单后按固定周期规律制作发货，全程透明可追踪。
                        </p>
                        <!-- <div class="mt-8 grid sm:grid-cols-2 gap-6">
                            <div class="rounded-2xl border border-white/10 p-6">
                                <p class="text-sm uppercase tracking-[0.2em] text-slate-400">免费试用</p>
                                <p class="text-2xl font-semibold mt-3">在线设计器</p>
                                <p class="text-sm text-slate-400 mt-2">还在犹豫定制效果，您可以提前访问设计器，进行您的创意搭配，满意后再下单。</p>
                            </div>
                            <div class="rounded-2xl border border-white/10 p-6">
                                <p class="text-sm uppercase tracking-[0.2em] text-slate-400">定时发货</p>
                                <p class="text-2xl font-semibold mt-3">每月三次锁定</p>
                                <p class="text-sm text-slate-400 mt-2">10 / 20 / 30 日锁定，锁定后两周内发货。</p>
                            </div>
                        </div> -->
                    </div>
                    <div class="relative">
                        <div class="absolute inset-0 blur-3xl bg-linear-to-r from-indigo-500/40 via-purple-500/30 to-pink-500/30" />
                        <div class="relative grid gap-6">
                            <article
                                v-for="tile in advertisingTiles"
                                :key="tile.title"
                                class="rounded-[28px] overflow-hidden border border-white/10 bg-white/5 backdrop-blur"
                            >
                                <img :src="tile.imagery" :alt="tile.title" class="w-full h-48 object-cover">
                                <div class="p-6">
                                    <p class="text-sm uppercase tracking-[0.4em] text-slate-400">{{ tile.signature }}</p>
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
