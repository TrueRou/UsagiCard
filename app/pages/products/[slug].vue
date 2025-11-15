<script setup lang="ts">
const route = useRoute()

interface ProductDetail {
    name: string
    headline: string
    description: string
    heroImage: string
    gallery: string[]
    specs: { title: string, value: string }[]
    highlights: string[]
}

const productDetails: Record<string, ProductDetail> = {
    'card-film': {
        name: '卡贴',
        headline: '以陶瓷光泽映衬你的收藏',
        description:
            '采用多层纳米雾面工艺，卡贴在任何角度都能呈现柔和质感。透过 CNC 倒角结构，边缘顺滑且耐磨，专为日常携带打造。',
        heroImage: 'https://images.unsplash.com/photo-1515168861092-9d3c0a0f0534?auto=format&fit=crop&w=1600&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
        ],
        specs: [
            { title: '材质', value: '陶瓷粉末涂层 · 复合纤维' },
            { title: '厚度', value: '0.32 mm' },
            { title: '颜色', value: '暮蓝 / 霜白 / 砂银' },
        ],
        highlights: ['抗刮耐磨', '指纹自净涂层', '可替换光学底纸'],
    },
    'nfc-card': {
        name: 'NFC 卡片',
        headline: '灵动响应，一触即发',
        description:
            '新一代低功耗芯片带来毫秒级识别速度。卡片采用对称金属骨架，防止弯折，同时保留顺滑手感。',
        heroImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
        ],
        specs: [
            { title: '芯片', value: 'Secure NFC v3' },
            { title: '存储', value: '128 KB' },
            { title: '系统', value: 'iOS / Android / Arcade' },
        ],
        highlights: ['双面陶瓷喷砂', 'IPX4 级防护', '可编程动态动画'],
    },
    'aime-card': {
        name: 'AIME 卡片',
        headline: '为音游玩家量身定制',
        description:
            '与日本工作室联合开发，支持主流街机终端。内置频段调校与金属微孔结构，确保在嘈杂环境中依然精准识别。',
        heroImage: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1600&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
        ],
        specs: [
            { title: '兼容机台', value: 'maimai / Ongeki / Chunithm 等' },
            { title: '同步', value: 'Bunny Cloud 全自动备份' },
            { title: '材质', value: '航天级铝合金 + 树脂包覆' },
        ],
        highlights: ['音游专属主题', '赛事加密模式', '多账号一键切换'],
    },
    'aime-plus': {
        name: 'AIME 兼容卡',
        headline: '跨区域游玩亦可即刻同步',
        description:
            '自研全球漫游技术，即使跨区域也能实时更新分数与收藏。采用双通道安全芯片，守护每一次游玩记录。',
        heroImage: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
        ],
        specs: [
            { title: '漫游区域', value: '亚太 / 北美 / 欧洲' },
            { title: '安全', value: 'EAL6+ 安全芯片' },
            { title: '续航', value: '约 2 年无需维护' },
        ],
        highlights: ['全球巡礼限量设计', '多语言 UI', '旅程时间线'],
    },
    'bunny-pass': {
        name: '通行证',
        headline: '一张卡片，开启沉浸式旅程',
        description:
            '融合身份识别、礼遇凭证与定制内容，适配线下门店与联名空间。以渐层玻璃工艺呈现品牌故事。',
        heroImage: 'https://images.unsplash.com/photo-1500534319217-43b75f4525e0?auto=format&fit=crop&w=1600&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80',
        ],
        specs: [
            { title: '核验', value: 'Bunny Gate · 双因子' },
            { title: '权益', value: '尊享通道 / 线下展览 / 特别活动' },
            { title: '定制', value: '提供品牌联名服务' },
        ],
        highlights: ['渐层玻璃', '光流电镀边框', '城市限定皮肤'],
    },
}

const product = productDetails[route.params.slug as string]

if (!product) {
    throw createError({ statusCode: 404, statusMessage: '未找到对应产品' })
}

useHead({
    title: `${product.name} — Bunny`,
})
</script>

<template>
    <!-- eslint-disable vue/singleline-html-element-content-newline -->
    <div class="bg-slate-950 text-white min-h-screen">
        <section class="max-w-5xl mx-auto px-6 sm:px-10 pt-20 pb-12 space-y-10">
            <NuxtLink to="/" class="text-sm text-slate-400 hover:text-white">返回主页</NuxtLink>
            <div class="space-y-6">
                <p class="text-xs tracking-[0.4em] uppercase text-slate-400">Bunny Products</p>
                <h1 class="text-5xl font-semibold">{{ product.name }}</h1>
                <p class="text-2xl text-slate-200">{{ product.headline }}</p>
                <p class="text-lg text-slate-300 leading-relaxed">{{ product.description }}</p>
            </div>
            <div class="rounded-[32px] overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 to-transparent">
                <img :src="product.heroImage" :alt="product.name" class="w-full h-[26rem] object-cover">
            </div>
            <div class="grid md:grid-cols-3 gap-6">
                <div
                    v-for="spec in product.specs"
                    :key="spec.title"
                    class="rounded-2xl border border-white/10 p-6 bg-white/5"
                >
                    <p class="text-sm uppercase tracking-[0.3em] text-slate-400">{{ spec.title }}</p>
                    <p class="mt-3 text-2xl font-semibold">{{ spec.value }}</p>
                </div>
            </div>
        </section>

        <section class="max-w-5xl mx-auto px-6 sm:px-10 pb-20">
            <div class="grid md:grid-cols-2 gap-8">
                <article class="rounded-[32px] border border-white/10 bg-white/5 p-8 space-y-4">
                    <p class="text-xs tracking-[0.4em] uppercase text-slate-400">Highlights</p>
                    <h2 class="text-3xl font-semibold">设计亮点</h2>
                    <ul class="space-y-3 text-slate-300">
                        <li v-for="item in product.highlights" :key="item" class="flex items-start gap-3">
                            <span class="h-2.5 w-2.5 rounded-full bg-white mt-2" />
                            <span>{{ item }}</span>
                        </li>
                    </ul>
                </article>
                <article class="rounded-[32px] border border-white/10 bg-gradient-to-br from-indigo-500/20 to-slate-900 p-8 space-y-4">
                    <p class="text-xs tracking-[0.4em] uppercase text-slate-200">Experience</p>
                    <h2 class="text-3xl font-semibold">沉浸式体验</h2>
                    <p class="text-slate-100 leading-relaxed">
                        Bunny 团队在全球甄选材质与工艺，保证每个细节都达到商业陈列标准。我们同步提供
                        Studio Crafted 定制服务，可为品牌打造独一无二的艺术化介质。
                    </p>
                </article>
            </div>

            <div class="mt-12 grid md:grid-cols-2 gap-8">
                <div
                    v-for="(image, index) in product.gallery"
                    :key="index"
                    class="rounded-[32px] overflow-hidden border border-white/10"
                >
                    <img :src="image" :alt="`${product.name} gallery ${index + 1}`" class="w-full h-72 object-cover">
                </div>
            </div>
        </section>
    </div>
</template>
