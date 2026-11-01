<script setup lang="ts">
import type { ChartEntry } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import type { PlateKind, PlateTableItem } from '~/composables/function/MaimaiCN/usePlateProgress'
import { DifficultyNames, FCTypeMap, FSTypeMap, getRateByAchievement, RateTypeMap, useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'

/**
 * 完成表单元格。
 * 未筛选难度：封面 + 底部各难度达成方块，不显示成绩状态。
 * 筛选难度：封面 + 该难度当前成绩，不显示方块；所有封面统一蒙层。
 */
const props = defineProps<{
    item: PlateTableItem
    kind: PlateKind
    /** 是否筛选了单一难度 */
    filtered: boolean
}>()

const emit = defineEmits<{
    (e: 'select', entry: ChartEntry): void
}>()

const { getAchievementIconSrc, getDifficultyColor, getFCIconSrc, getFSIconSrc, getSongJacketUrl, handleImageError } = useMaimaiUtils()

const chart = computed(() => props.item.chart)
const score = computed(() => chart.value.entry.score)
const stampLabel = computed(() => {
    if (!score.value)
        return ''
    if (props.kind === '舞舞')
        return score.value.fs != null ? FSTypeMap[score.value.fs] : ''
    if (props.kind === '极' || props.kind === '神')
        return score.value.fc != null ? FCTypeMap[score.value.fc] : ''
    return RateTypeMap[getRateByAchievement(score.value.achievements)]
})

const stampIcon = computed(() => {
    if (!score.value)
        return undefined
    if (props.kind === '舞舞')
        return getFSIconSrc(score.value.fs)
    if (props.kind === '极' || props.kind === '神')
        return getFCIconSrc(score.value.fc)
    // 低于 A 时用精确评级文本，避免通用图标函数将 BBB / BB / C / D 归为 B。
    return score.value.achievements >= 80 ? getAchievementIconSrc(score.value.achievements) : undefined
})

const ariaLabel = computed(() => {
    const song = props.item.song
    if (!props.filtered) {
        const missing = song.charts.filter(item => !item.qualified).map(item => DifficultyNames[item.entry.levelIndex])
        return `${song.song.title} ${props.item.done ? '已完成' : `未完成：${missing.join('、')}`}`
    }
    const state = chart.value.qualified ? '已达成' : chart.value.entry.score ? '未达成' : '未游玩'
    return `${song.song.title} ${DifficultyNames[chart.value.entry.levelIndex]} ${chart.value.entry.difficulty.level} ${state}${stampLabel.value ? `，当前成绩 ${stampLabel.value}` : ''}`
})
</script>

<template>
    <button
        type="button"
        class="group relative block aspect-square w-full overflow-hidden rounded-md bg-base-200 transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        :aria-label="ariaLabel"
        :title="item.song.song.title"
        @click="emit('select', chart.entry)"
    >
        <img
            :src="getSongJacketUrl(item.song.song.id)"
            alt=""
            class="h-full w-full object-cover transition-[transform,filter,opacity] duration-300 group-hover:scale-105"
            loading="lazy"
            @error="handleImageError"
        >
        <!-- 所有封面统一蒙层，提高成绩与指示器的可读性。 -->
        <span class="absolute inset-0 bg-black/60" />
        <span
            v-if="filtered && stampLabel"
            class="absolute inset-0 flex items-center justify-center"
        >
            <img v-if="stampIcon" :src="stampIcon" :alt="stampLabel" class="max-h-full w-[78%] object-contain drop-shadow-[0_1px_2px_black]" loading="lazy">
            <span v-else class="text-2xl font-black text-white drop-shadow-[0_1px_2px_black]">{{ stampLabel }}</span>
        </span>
        <span v-if="filtered && chart.qualified" class="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-bl-md bg-success text-success-content">
            <Icon name="mdi:check-bold" class="h-3 w-3" />
        </span>
        <!-- 未筛选难度时：各难度达成方块，实心为已达成，描边为未达成 -->
        <span v-if="!filtered" class="absolute inset-x-0 bottom-0 flex gap-px bg-black/55 p-px">
            <span
                v-for="part in item.song.charts"
                :key="part.entry.key"
                class="h-1.5 flex-1 rounded-[1px] sm:h-2"
                :style="part.qualified
                    ? { backgroundColor: getDifficultyColor(part.entry.levelIndex) }
                    : { boxShadow: `inset 0 0 0 1px ${getDifficultyColor(part.entry.levelIndex)}`, opacity: 0.75 }"
            />
        </span>
    </button>
</template>
