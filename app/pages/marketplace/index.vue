<script lang="ts" setup>
useHead({
    title: '关于兔卡 — 月兔礼品',
})

// TODO: 替换为真实用户返图路径，建议存放于 public/images/usagi-reviews/ 目录
const reviewPhotos: string[] = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80',
]

interface Variant {
    slug: string
    emoji: string
    title: string
    description: string
    features: { label: string, supported: boolean }[]
}

const variants: Variant[] = [
    {
        slug: 'aime-official',
        emoji: '🚀',
        title: '双面定制AIME蓝白卡',
        description: '官方蓝白卡，成本较高。可以通过二维码进入卡片主页，支持完整账号系统。',
        features: [
            { label: '卡片主页', supported: true },
            { label: '账号系统', supported: true },
            { label: '手台私服', supported: true },
        ],
    },
    {
        slug: 'aime-compat',
        emoji: '🚢',
        title: '双面定制AIME兼容卡',
        description: '自制兼容卡，成本较低。只能在手台登录私服。可以通过二维码进入卡片主页。',
        features: [
            { label: '卡片主页', supported: true },
            { label: '账号系统', supported: false },
            { label: '手台私服', supported: true },
        ],
    },
    {
        slug: 'nfc-card',
        emoji: '✨',
        title: '双面定制NFC卡',
        description: '可以进入卡片主页，但无法享受账号系统。',
        features: [
            { label: '卡片主页', supported: true },
            { label: '账号系统', supported: false },
            { label: '手台私服', supported: false },
        ],
    },
    {
        slug: 'crystal-sticker',
        emoji: '🎨',
        title: '双面定制水晶卡贴',
        description: '卡贴后自带背胶。无法进入卡片主页，也无法享受账号系统。',
        features: [
            { label: '卡片主页', supported: false },
            { label: '账号系统', supported: false },
            { label: '手台私服', supported: false },
        ],
    },
]
</script>

<template>
    <!-- eslint-disable vue/singleline-html-element-content-newline -->
    <div class="bg-slate-950 text-slate-50">
        <!-- Hero 文案 -->
        <section class="max-w-4xl mx-auto px-6 sm:px-10 pt-24 pb-16">
            <p class="text-xs font-semibold tracking-[0.4em] uppercase text-slate-400 mb-4">UsagiCard · 兔卡系列</p>
            <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mb-10">
                🎉 创意定制NFC卡片<br>让每一次排卡更特别
            </h1>
            <div class="space-y-5 text-lg text-slate-300 leading-relaxed max-w-3xl">
                <p>✨ 想要与众不同的查分体验吗？现在就来定制你的独一无二的DXPASS卡片吧！我们有多种设计风格供你选择，从边框再到人物的设计，你可以使用我们的素材库，也可以上传自己的素材图片。</p>
                <p>🚀 在手机背面轻轻一贴，实时查询成绩并更新查分器，逼格拉满、方便易用。</p>
                <p>👍 还在犹豫定制效果，您可以提前访问设计器，进行您的创意搭配，满意后再下单。</p>
                <p>✌ 想试试账号系统效果，您可以扫描展示图下方二维码，或者点击链接进入卡面。</p>
                <p class="text-base text-slate-400 border-l-2 border-slate-700 pl-4">
                    下单并完成设计后，您的卡片将进入草稿状态，在被自动锁定前，您仍可以修改自己的设计。我们将在每个月 10 / 20 / 30 号锁定订单，并将您的卡片投入制作，并在锁定后2周内发货，还望谅解 🙏
                </p>
            </div>
        </section>

        <!-- 产品系列对比 -->
        <section class="max-w-4xl mx-auto px-6 sm:px-10 pb-16">
            <h2 class="text-2xl font-semibold mb-6">产品系列对比</h2>
            <div class="grid sm:grid-cols-2 gap-4">
                <article
                    v-for="v in variants"
                    :key="v.slug"
                    class="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3"
                >
                    <div class="text-2xl">{{ v.emoji }}</div>
                    <h3 class="text-lg font-semibold">{{ v.title }}</h3>
                    <p class="text-sm text-slate-400">{{ v.description }}</p>
                    <div class="flex flex-wrap gap-2 pt-1">
                        <span
                            v-for="f in v.features"
                            :key="f.label"
                            class="text-xs px-2 py-1 rounded-full"
                            :class="f.supported ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-500'"
                        >{{ f.supported ? '✓' : '✗' }} {{ f.label }}</span>
                    </div>
                    <NuxtLink :to="`/products/${v.slug}`" class="inline-block pt-1 text-sm text-blue-400 hover:text-blue-300">
                        查看详情 →
                    </NuxtLink>
                </article>
            </div>
        </section>

        <!-- 宣传视频 -->
        <section class="bg-black/20 border-t border-white/5">
            <div class="max-w-4xl mx-auto px-6 sm:px-10 py-16">
                <h2 class="text-2xl font-semibold mb-6">宣传视频</h2>
                <!-- TODO: 替换 src，视频文件建议放至 public/videos/usagicard-promo.mp4 -->
                <div class="rounded-3xl overflow-hidden border border-white/10 bg-white/5 aspect-video flex items-center justify-center">
                    <div class="text-center space-y-3 text-slate-500">
                        <div class="text-5xl">▶</div>
                        <p class="text-sm">宣传视频 · 待上传</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 用户返图 -->
        <section class="max-w-4xl mx-auto px-6 sm:px-10 py-16">
            <h2 class="text-2xl font-semibold mb-2">来自用户的真实反馈</h2>
            <p class="text-slate-400 text-sm mb-8">以下为用户收货后的真实返图</p>
            <!-- TODO: 替换为真实用户返图，建议存放于 public/images/usagi-reviews/ 目录 -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div
                    v-for="(photo, i) in reviewPhotos"
                    :key="i"
                    class="aspect-square rounded-2xl overflow-hidden border border-white/10"
                >
                    <img :src="photo" :alt="`用户返图 ${i + 1}`" class="w-full h-full object-cover">
                </div>
            </div>
        </section>
    </div>
</template>
