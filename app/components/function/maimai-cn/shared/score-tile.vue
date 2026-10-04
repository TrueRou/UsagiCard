<script setup lang="ts">
import type { ChartEntry } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import type { MaimaiTileContent } from '~/types/api'
import { SongType, useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'

/** 平铺模式的方形封面卡片 */
const props = defineProps<{
    entry: ChartEntry
    content: MaimaiTileContent
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
    getFCIconSrc,
    getFSIconSrc,
    getSongJacketUrl,
    handleImageError,
} = useMaimaiUtils()

type Overlay = { kind: 'icon', src: string, alt: string } | { kind: 'text', text: string }

const score = computed(() => props.entry.score)
const accentColor = computed(() => getDifficultyColor(props.entry.levelIndex, props.entry.type))
const accentTextClass = computed(() => getDifficultyTextClass(props.entry.levelIndex, props.entry.type))

const typeLabel = computed(() => {
    if (props.entry.type === SongType.DX)
        return 'DX'
    return props.entry.type === SongType.STANDARD ? 'SD' : '宴'
})

const levelText = computed(() => {
    const difficulty = props.entry.difficulty
    return difficulty.level_value > 0 ? difficulty.level_value.toFixed(1) : difficulty.level
})

function iconOrText(src: string | undefined, alt: string, fallback: string): Overlay {
    return src ? { kind: 'icon', src, alt } : { kind: 'text', text: fallback }
}

const overlay = computed<Overlay | null>(() => {
    const s = score.value
    if (props.content === 'none')
        return null
    if (props.content === 'level')
        return { kind: 'text', text: levelText.value }
    if (!s)
        return { kind: 'text', text: '未游玩' }
    switch (props.content) {
        case 'rating':
            return iconOrText(getAchievementIconSrc(s.achievements), '评级', formatAchievement(s.achievements))
        case 'fc':
            return iconOrText(getFCIconSrc(s.fc), 'FC', '—')
        case 'fs':
            return iconOrText(getFSIconSrc(s.fs), 'FS', '—')
        case 'dx_rating':
            return { kind: 'text', text: String(s.dx_rating) }
        case 'play_count':
            return { kind: 'text', text: s.play_count ? `${s.play_count} 次` : '—' }
        default:
            return { kind: 'text', text: formatAchievement(s.achievements) }
    }
})

const ariaLabel = computed(() => {
    const result = score.value ? formatAchievement(score.value.achievements) : '未游玩'
    return `${props.entry.song.title} ${typeLabel.value} ${levelText.value} ${result}`
})
</script>

<template>
    <button
        type="button"
        class="group relative block aspect-square w-full overflow-hidden rounded-lg border-2 bg-base-200 transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        :style="{ borderColor: accentColor }"
        :aria-label="ariaLabel"
        @click="$emit('select', entry)"
    >
        <img
            :src="getSongJacketUrl(entry.song.id)"
            alt=""
            class="h-full w-full object-cover transition-[transform,filter,opacity] duration-300 group-hover:scale-105"
            :class="score ? '' : 'opacity-60 grayscale'"
            loading="lazy"
            @error="handleImageError"
        >
        <span
            class="absolute left-0 top-0 rounded-br-md px-1 text-[9px] font-bold leading-4"
            :class="accentTextClass"
            :style="{ backgroundColor: accentColor }"
        >
            {{ typeLabel }}
        </span>
        <span
            v-if="rank !== undefined"
            class="absolute right-0 top-0 rounded-bl-md bg-neutral/75 px-1 font-mono text-[10px] font-bold leading-4 text-neutral-content"
        >
            #{{ rank }}
        </span>
        <span
            v-if="overlay"
            class="absolute inset-x-0 bottom-0 flex h-[30%] min-h-6 items-center justify-center bg-neutral/70 px-1 text-neutral-content"
        >
            <img v-if="overlay.kind === 'icon'" :src="overlay.src" :alt="overlay.alt" class="h-full max-h-7 w-auto py-0.5" loading="lazy">
            <span v-else class="truncate font-mono text-[11px] font-bold tabular-nums sm:text-xs">{{ overlay.text }}</span>
        </span>
    </button>
</template>
