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
    'aime-official': {
        name: '双面定制AIME蓝白卡',
        headline: '官方认证，完整体验',
        description:
            '采用官方AIME蓝白卡，认证度最高。双面全彩定制，可使用素材库或上传自定义素材。卡片背面二维码可直接进入个人卡片主页，并享受完整的账号系统功能（支持 maimai 等音游）。',
        heroImage: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1600&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
        ],
        specs: [
            { title: '卡片类型', value: 'AIME 官方蓝白卡' },
            { title: '卡片主页', value: '支持（扫码进入）' },
            { title: '账号系统', value: '完整支持' },
        ],
        highlights: [
            '官方AIME蓝白卡，认证度最高',
            '可通过二维码进入个人卡片主页',
            '支持完整账号系统（maimai 等音游）',
            '双面定制，素材库或自定义上传均可',
            '下单前可免费体验在线设计器',
        ],
    },
    'aime-compat': {
        name: '双面定制AIME兼容卡',
        headline: '高性价比，灵活选择',
        description:
            '采用自制AIME兼容卡，成本更低，是预算有限玩家的理想之选。仅限在手台登录私服使用，同样支持扫码进入个人卡片主页。双面全彩定制，素材库与自定义上传均可使用。',
        heroImage: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
        ],
        specs: [
            { title: '卡片类型', value: 'AIME 自制兼容卡' },
            { title: '卡片主页', value: '支持（扫码进入）' },
            { title: '账号系统', value: '仅限手台私服' },
        ],
        highlights: [
            '自制兼容卡，性价比更高',
            '可通过二维码进入个人卡片主页',
            '仅限手台登录私服，不支持官服',
            '双面定制，素材库或自定义上传均可',
            '下单前可免费体验在线设计器',
        ],
    },
    'nfc-card': {
        name: '双面定制NFC卡',
        headline: '个性定制，随贴随用',
        description:
            '标准双面定制NFC卡，可通过卡片背面二维码进入个人卡片主页。暂不支持账号系统功能，适合侧重展示与分享卡面的用户。',
        heroImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80',
        ],
        specs: [
            { title: '卡片类型', value: '双面定制NFC卡' },
            { title: '卡片主页', value: '支持（扫码进入）' },
            { title: '账号系统', value: '暂不支持' },
        ],
        highlights: [
            '标准NFC定制卡，通用性强',
            '可通过二维码进入个人卡片主页',
            '暂不支持账号系统功能',
            '双面定制，素材库或自定义上传均可',
            '下单前可免费体验在线设计器',
        ],
    },
    'crystal-sticker': {
        name: '双面定制水晶卡贴',
        headline: '轻薄贴合，经济之选',
        description:
            '双面定制水晶卡贴，后背自带背胶，直接贴于手机背面即可使用，无需其他配件。暂不支持卡片主页与账号系统功能，是追求简便、注重性价比的入门选择。',
        heroImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
        ],
        specs: [
            { title: '类型', value: '双面定制水晶卡贴' },
            { title: '背胶', value: '自带背胶，直接贴用' },
            { title: '卡片主页', value: '不支持' },
        ],
        highlights: [
            '后背自带背胶，无需额外处理',
            '轻薄贴合，方便携带',
            '暂不支持卡片主页与账号系统',
            '双面定制，素材库或自定义上传均可',
            '下单前可免费体验在线设计器',
        ],
    },
}

const product = productDetails[route.params.slug as string]

if (!product) {
    throw createError({ statusCode: 404, statusMessage: '未找到对应产品', fatal: true })
}

useHead({
    title: `${product.name} — 月兔礼品`,
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
            <div class="rounded-4xl overflow-hidden border border-white/10 bg-linear-to-br from-white/10 to-transparent">
                <img :src="product.heroImage" :alt="product.name" class="w-full h-104 object-cover">
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
                <article class="rounded-4xl border border-white/10 bg-white/5 p-8 space-y-4">
                    <p class="text-xs tracking-[0.4em] uppercase text-slate-400">Highlights</p>
                    <h2 class="text-3xl font-semibold">设计亮点</h2>
                    <ul class="space-y-3 text-slate-300">
                        <li v-for="item in product.highlights" :key="item" class="flex items-start gap-3">
                            <span class="h-2.5 w-2.5 rounded-full bg-white mt-2" />
                            <span>{{ item }}</span>
                        </li>
                    </ul>
                </article>
                <article class="rounded-4xl border border-white/10 bg-linear-to-br from-indigo-500/20 to-slate-900 p-8 space-y-4">
                    <p class="text-xs tracking-[0.4em] uppercase text-slate-200">定制流程</p>
                    <h2 class="text-3xl font-semibold">从设计到收货</h2>
                    <p class="text-slate-100 leading-relaxed">
                        下单并完成设计后，卡片进入草稿状态，锁定前仍可随时修改。我们每月 10 / 20 / 30 日锁定订单并投入制作，锁定后两周内完成发货，还望谅解 🙏
                    </p>
                </article>
            </div>

            <div class="mt-12 grid md:grid-cols-2 gap-8">
                <div
                    v-for="(image, index) in product.gallery"
                    :key="index"
                    class="rounded-4xl overflow-hidden border border-white/10"
                >
                    <img :src="image" :alt="`${product.name} gallery ${index + 1}`" class="w-full h-72 object-cover">
                </div>
            </div>
        </section>
    </div>
</template>
