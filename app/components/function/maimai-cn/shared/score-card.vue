<script setup lang="ts">
import type { ChartEntry } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { SongType, useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'
import { entryDxStar } from '~/composables/function/MaimaiCN/useScoreView'

/** 列表模式的成绩卡片；手机两列时宽约 170px，窄屏下收起次要信息 */
const props = defineProps<{
    entry: ChartEntry
    /** 可选名次角标（B50 等场景） */
    rank?: number
}>()

const emit = defineEmits<{
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
const rankIcon = computed(() => score.value ? getAchievementIconSrc(score.value.achievements) : undefined)

const title = computed(() => {
    const { entry } = props
    if (entry.type !== SongType.UTAGE)
        return entry.song.title
    const utage = entry.difficulty as ChartEntry['difficulty'] & { kanji?: string, is_buddy?: boolean }
    return `[${utage.kanji ?? '宴'}]${utage.is_buddy ? ' [双]' : ''} ${entry.song.title}`
})

const typeLabel = computed(() => {
    if (props.entry.type === SongType.DX)
        return 'DX'
    return props.entry.type === SongType.STANDARD ? 'SD' : '宴'
})

const levelText = computed(() => {
    const difficulty = props.entry.difficulty
    return difficulty.level_value > 0 ? difficulty.level_value.toFixed(1) : difficulty.level
})

const levelTip = computed(() => score.value ? `定数 ${levelText.value} · DX Rating +${score.value.dx_rating}` : `定数 ${levelText.value}`)

const dxStar = computed(() => entryDxStar(props.entry))
const dxTip = computed(() => {
    if (!score.value || props.entry.maxDxScore <= 0)
        return ''
    const pct = score.value.dx_score / props.entry.maxDxScore * 100
    return `${score.value.dx_score}/${props.entry.maxDxScore} (${pct.toFixed(1)}%)`
})

const ariaLabel = computed(() => {
    const result = score.value ? formatAchievement(score.value.achievements) : '未游玩'
    return `${title.value} ${typeLabel.value} ${levelText.value} ${result}`
})

// 宽卡片上曲名单行显示，溢出时悬停跑马灯
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

function select() {
    emit('select', props.entry)
}
</script>

<template>
    <article
        class="score-card group relative cursor-pointer rounded-xl bg-base-100 shadow-xs ring-1 ring-base-300 transition-[box-shadow,transform] duration-200 hover:z-10 hover:shadow-lg hover:ring-primary/50 focus-within:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
        role="button"
        tabindex="0"
        :aria-label="ariaLabel"
        @click="select"
        @keydown.enter.prevent="select"
        @keydown.space.prevent="select"
    >
        <!-- 成绩区：难度色底 -->
        <div class="flex gap-2 rounded-t-xl px-1.5 pb-2 pt-1.5" :class="accentTextClass" :style="{ backgroundColor: accentColor }">
            <div class="relative h-10 w-10 shrink-0 sm:h-[52px] sm:w-[52px]">
                <div class="h-full w-full overflow-hidden rounded-lg border border-white/40 bg-black/25">
                    <img
                        :src="getSongJacketUrl(entry.song.id)"
                        alt=""
                        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        @error="handleImageError"
                    >
                </div>
                <span
                    v-if="rank !== undefined"
                    class="absolute -left-1 -top-1 rounded-md bg-neutral px-1 font-mono text-[9px] font-bold leading-4 text-neutral-content shadow-sm"
                >
                    #{{ rank }}
                </span>
                <img
                    v-if="rankIcon"
                    :src="rankIcon"
                    alt="评级"
                    class="absolute -bottom-2 left-1/2 h-4 w-auto max-w-none -translate-x-1/2 drop-shadow sm:h-5"
                    loading="lazy"
                >
            </div>

            <div class="flex min-w-0 flex-1 flex-col justify-between gap-0.5">
                <div class="flex items-start gap-1">
                    <!-- 窄屏：两行截断 -->
                    <span class="line-clamp-2 min-w-0 flex-1 text-xs font-bold leading-4 drop-shadow-xs sm:hidden">
                        {{ title }}
                    </span>
                    <!-- 宽屏：单行，溢出时悬停滚动 -->
                    <div ref="titleBox" class="hidden min-w-0 flex-1 overflow-hidden sm:block">
                        <span
                            ref="titleText"
                            class="inline-block whitespace-nowrap text-[13px] font-bold leading-5 drop-shadow-xs"
                            :class="marqueeDistance ? 'score-card-marquee' : 'max-w-full truncate align-bottom'"
                            :style="marqueeDistance ? { '--marquee-distance': `-${marqueeDistance}px` } : undefined"
                        >
                            {{ title }}
                        </span>
                    </div>
                    <span class="shrink-0 rounded bg-black/20 px-1 text-[9px] font-bold leading-4 sm:text-[10px]">
                        {{ typeLabel }}
                    </span>
                </div>

                <span v-if="score" class="font-mono text-lg font-bold leading-none tracking-tight tabular-nums sm:text-2xl">
                    {{ formatAchievement(score.achievements) }}
                </span>
                <span v-else class="text-sm font-semibold leading-none opacity-90 sm:text-[15px]">
                    暂未游玩
                </span>
            </div>
        </div>

        <!-- 信息条 -->
        <div class="flex min-h-8 items-center justify-between gap-1.5 border-t border-base-200 px-2 text-[11px] sm:min-h-9 sm:px-2.5">
            <div class="flex min-w-0 items-center gap-1.5 font-mono text-base-content/60 sm:gap-2">
                <span class="hidden font-bold sm:inline">#{{ entry.song.id }}</span>
                <span class="tooltip tooltip-top min-w-0 truncate" :data-tip="levelTip">
                    <span :class="score ? 'font-bold text-base-content' : ''">{{ levelText }}</span>
                    <template v-if="score">
                        <span class="mx-0.5 text-base-content/35">→</span>
                        <span class="font-bold text-base-content">{{ score.dx_rating }}</span>
                    </template>
                </span>
                <span v-if="score && score.play_count" class="hidden sm:inline">pc:{{ score.play_count }}</span>
            </div>

            <div v-if="score" class="flex shrink-0 items-center">
                <span class="flex h-5 w-5 items-center justify-center">
                    <img v-if="getFCIconSrc(score.fc)" :src="getFCIconSrc(score.fc)" alt="FC" class="h-5 w-5" loading="lazy">
                </span>
                <span class="flex h-5 w-5 items-center justify-center">
                    <img v-if="getFSIconSrc(score.fs)" :src="getFSIconSrc(score.fs)" alt="FS" class="h-5 w-5" loading="lazy">
                </span>
                <span class="tooltip tooltip-left flex h-5 w-7 items-center justify-end" :data-tip="dxTip">
                    <img v-if="getDxStarIconSrc(dxStar)" :src="getDxStarIconSrc(dxStar)" alt="DX 星级" class="h-4 w-auto" loading="lazy">
                </span>
            </div>
        </div>
    </article>
</template>

<style scoped>
@media (min-width: 40rem) and (hover: hover) {
    .group:hover .score-card-marquee,
    .group:focus-visible .score-card-marquee {
        animation: score-card-marquee 6s ease-in-out infinite;
    }
}

@keyframes score-card-marquee {
    0%,
    15% {
        transform: translateX(0);
    }
    65%,
    85% {
        transform: translateX(var(--marquee-distance));
    }
    100% {
        transform: translateX(0);
    }
}

@media (prefers-reduced-motion: reduce) {
    .group:hover .score-card-marquee,
    .group:focus-visible .score-card-marquee {
        animation: none;
    }
}
</style>
