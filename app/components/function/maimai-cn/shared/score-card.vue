<script setup lang="ts">
import type { ChartEntry } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { SongType, useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'
import { entryDxStar } from '~/composables/function/MaimaiCN/useScoreView'

const props = defineProps<{
    entry: ChartEntry
    /** 可选名次角标（B50 等场景） */
    rank?: number
}>()

defineEmits<{
    (e: 'select', entry: ChartEntry): void
}>()

const {
    formatAchievement,
    getAchievementIconSrc,
    getDifficultyColor,
    getDifficultyTextClass,
    getDxStarIconSrc,
    getFCIconSrc,
    getFSIconSrc,
    getSongJacketUrl,
    handleImageError,
} = useMaimaiUtils()

const score = computed(() => props.entry.score)
const accentColor = computed(() => getDifficultyColor(props.entry.levelIndex, props.entry.type))
const accentTextClass = computed(() => getDifficultyTextClass(props.entry.levelIndex, props.entry.type))

const title = computed(() => {
    const { entry } = props
    if (entry.type !== SongType.UTAGE)
        return entry.song.title
    const utage = entry.difficulty as ChartEntry['difficulty'] & { kanji?: string, is_buddy?: boolean }
    return `[${utage.kanji ?? '宴'}]${utage.is_buddy ? ' [双]' : ''} ${entry.song.title}`
})

const typeLabel = computed(() => {
    switch (props.entry.type) {
        case SongType.DX:
            return 'DX'
        case SongType.STANDARD:
            return 'SD'
        default:
            return '宴'
    }
})

const levelText = computed(() => {
    const difficulty = props.entry.difficulty
    return difficulty.level_value > 0 ? difficulty.level_value.toFixed(1) : difficulty.level
})

const dxStar = computed(() => entryDxStar(props.entry))
const dxTip = computed(() => {
    if (!score.value || props.entry.maxDxScore <= 0)
        return ''
    const pct = score.value.dx_score / props.entry.maxDxScore * 100
    return `${score.value.dx_score}/${props.entry.maxDxScore} (${pct.toFixed(1)}%)`
})

// 曲名超长时启用跑马灯
const titleBox = ref<HTMLElement | null>(null)
const titleText = ref<HTMLElement | null>(null)
const marqueeDistance = ref(0)

function measureTitle() {
    if (!titleBox.value || !titleText.value)
        return
    const overflow = titleText.value.scrollWidth - titleBox.value.clientWidth
    marqueeDistance.value = overflow > 2 ? overflow : 0
}

useResizeObserver(titleBox, measureTitle)
watch(title, () => nextTick(measureTitle))
</script>

<template>
    <article
        class="score-card group relative cursor-pointer rounded-[10px] border border-base-300 bg-base-100 shadow-xs transition-[box-shadow,border-color] duration-200 hover:border-primary/60 hover:shadow-lg"
        role="button"
        tabindex="0"
        :aria-label="`${title} ${levelText}`"
        @click="$emit('select', entry)"
        @keydown.enter.prevent="$emit('select', entry)"
        @keydown.space.prevent="$emit('select', entry)"
    >
        <!-- 成绩区：难度色底 -->
        <div
            class="flex gap-2 overflow-hidden rounded-t-[9px] px-1.5 pt-1 pb-1"
            :class="accentTextClass"
            :style="{ backgroundColor: accentColor }"
        >
            <div class="relative h-[50px] w-[50px] shrink-0 overflow-hidden rounded-md border border-white/40 bg-black/25 sm:h-[52px] sm:w-[52px]">
                <img
                    :src="getSongJacketUrl(entry.song.id)"
                    :alt="entry.song.title"
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    @error="handleImageError"
                >
                <span
                    v-if="rank !== undefined"
                    class="absolute left-0 top-0 rounded-br-md bg-black/60 px-1 font-mono text-[10px] font-bold leading-4 text-white"
                >
                    #{{ rank }}
                </span>
            </div>

            <div class="flex min-w-0 flex-1 flex-col justify-between">
                <div class="flex items-center gap-1.5">
                    <div ref="titleBox" class="min-w-0 flex-1 overflow-hidden">
                        <span
                            ref="titleText"
                            class="inline-block whitespace-nowrap text-[13px] font-bold leading-5 drop-shadow-xs"
                            :class="marqueeDistance ? 'score-card-marquee' : 'max-w-full truncate align-bottom'"
                            :style="marqueeDistance ? { '--marquee-distance': `-${marqueeDistance}px` } : undefined"
                        >
                            {{ title }}
                        </span>
                    </div>
                    <span class="shrink-0 rounded bg-black/20 px-1 text-[10px] font-bold leading-4">
                        {{ typeLabel }}
                    </span>
                </div>

                <div class="flex items-end justify-between gap-1">
                    <span v-if="score" class="font-mono text-2xl font-bold leading-none tracking-tight">
                        {{ formatAchievement(score.achievements) }}
                    </span>
                    <span v-else class="text-[15px] font-semibold leading-none opacity-90">
                        暂未游玩
                    </span>
                    <img
                        v-if="score && getAchievementIconSrc(score.achievements)"
                        :src="getAchievementIconSrc(score.achievements)"
                        alt="评级"
                        class="-mb-0.5 h-8 w-auto shrink-0"
                        loading="lazy"
                    >
                </div>
            </div>
        </div>

        <!-- 信息条 -->
        <div class="flex min-h-9 items-center justify-between gap-2 border-t border-base-200 px-2.5 text-[11px]">
            <div class="flex min-w-0 items-center gap-2 font-mono text-base-content/60">
                <span class="font-bold">#{{ entry.song.id }}</span>
                <span
                    class="tooltip tooltip-top"
                    :data-tip="score ? `定数 ${levelText} · DX Rating +${score.dx_rating}` : `定数 ${levelText}`"
                >
                    <span :class="score ? 'font-bold text-base-content' : ''">{{ levelText }}</span>
                    <template v-if="score">
                        <span class="mx-0.5 text-base-content/35">→</span>
                        <span class="font-bold text-base-content">{{ score.dx_rating }}</span>
                    </template>
                </span>
                <span v-if="score && score.play_count">pc:{{ score.play_count }}</span>
            </div>

            <div v-if="score" class="flex shrink-0 items-center">
                <span class="flex h-6 w-6 items-center justify-center">
                    <img v-if="getFCIconSrc(score.fc)" :src="getFCIconSrc(score.fc)" alt="FC" class="h-6 w-6" loading="lazy">
                </span>
                <span class="flex h-6 w-6 items-center justify-center">
                    <img v-if="getFSIconSrc(score.fs)" :src="getFSIconSrc(score.fs)" alt="FS" class="h-6 w-6" loading="lazy">
                </span>
                <span class="tooltip tooltip-left flex h-6 w-9 items-center justify-end" :data-tip="dxTip">
                    <img v-if="getDxStarIconSrc(dxStar)" :src="getDxStarIconSrc(dxStar)" alt="DX 星级" class="h-5 w-auto" loading="lazy">
                </span>
            </div>
            <span
                v-else
                class="shrink-0 rounded bg-base-200 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-base-content/50"
            >
                Unplayed
            </span>
        </div>
    </article>
</template>

<style scoped>
.score-card-marquee {
    animation: score-card-marquee 6s ease-in-out infinite;
}

@keyframes score-card-marquee {
    0%,
    20% {
        transform: translateX(0);
    }
    70%,
    90% {
        transform: translateX(var(--marquee-distance));
    }
    100% {
        transform: translateX(0);
    }
}

@media (prefers-reduced-motion: reduce) {
    .score-card-marquee {
        animation: none;
    }
}
</style>
