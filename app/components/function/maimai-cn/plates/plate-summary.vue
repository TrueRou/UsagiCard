<script setup lang="ts">
import type { PlateProgress } from '~/composables/function/MaimaiCN/usePlateProgress'
import { DifficultyNames, DifficultyShortNames, useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'
import { countAt, percent, PLATE_KINDS } from '~/composables/function/MaimaiCN/usePlateProgress'

/** 牌子头部：当前难度的完成度 + 各难度统计（点击切换完成表展示的难度） */
const props = defineProps<{
    progress: PlateProgress
    activeDiff: number | null
}>()

const emit = defineEmits<{
    (e: 'selectDiff', levelIndex: number): void
}>()

const { getDifficultyColor } = useMaimaiUtils()

const hint = computed(() => PLATE_KINDS.find(item => item.kind === props.progress.plate.kind)?.hint ?? '')
const current = computed(() => countAt(props.progress, props.activeDiff))
const currentPct = computed(() => percent(current.value))
const completed = computed(() => current.value.total > 0 && current.value.done === current.value.total)
const currentLabel = computed(() => props.activeDiff === null ? '牌子' : DifficultyNames[props.activeDiff])

function pctText(value: number) {
    return `${value.toFixed(2)}%`
}
</script>

<template>
    <section class="panel space-y-3 p-3">
        <div class="flex items-end justify-between gap-3">
            <div class="min-w-0">
                <div class="text-[11px] text-base-content/55">
                    {{ progress.plate.version.group === 'all' ? '旧框全曲' : '版本牌子' }} · 全谱面 {{ hint }}
                </div>
                <h2 class="truncate text-xl font-black tracking-wide">
                    {{ progress.plate.label }}
                </h2>
            </div>
            <div class="shrink-0 text-right">
                <div v-if="completed" class="text-sm font-black tracking-wider text-success">
                    COMPLETED!!!
                </div>
                <div v-else class="font-mono text-lg font-bold tabular-nums">
                    {{ current.done }}<span class="text-sm text-base-content/45">/{{ current.total }} 首</span>
                </div>
                <div class="text-[11px] text-base-content/55">
                    <span class="font-mono tabular-nums">{{ pctText(currentPct) }}</span>
                    <template v-if="activeDiff !== null">
                        · {{ currentLabel }}
                    </template>
                </div>
            </div>
        </div>
        <div class="h-2.5 overflow-hidden rounded-full bg-base-200" role="progressbar" :aria-valuenow="Math.round(currentPct)" aria-valuemin="0" aria-valuemax="100" :aria-label="`${currentLabel} 完成度`">
            <div class="h-full rounded-full bg-linear-to-r from-primary to-secondary transition-[width] duration-500" :style="{ width: `${currentPct}%` }" />
        </div>
        <p class="text-[11px] text-base-content/50">
            点击难度卡片只看该难度
        </p>

        <div class="grid gap-1.5" :class="progress.levels.length > 4 ? 'grid-cols-5' : 'grid-cols-4'">
            <button
                v-for="level in progress.levels"
                :key="level.levelIndex"
                type="button"
                class="relative overflow-hidden rounded-lg border bg-base-100 px-1.5 pt-1.5 pb-2 text-left transition-[transform,box-shadow] active:scale-95 sm:px-2.5"
                :class="activeDiff === level.levelIndex ? 'ring-2 ring-offset-1 ring-offset-base-100' : 'hover:bg-base-200/60'"
                :style="{ 'borderColor': getDifficultyColor(level.levelIndex), '--tw-ring-color': getDifficultyColor(level.levelIndex) }"
                :aria-pressed="activeDiff === level.levelIndex"
                :aria-label="`${DifficultyNames[level.levelIndex]} ${level.done}/${level.total}，${activeDiff === level.levelIndex ? '取消筛选' : '只看该难度'}`"
                @click="emit('selectDiff', level.levelIndex)"
            >
                <div class="flex items-center justify-between gap-1">
                    <span class="text-[10px] font-bold sm:text-[11px]" :style="{ color: getDifficultyColor(level.levelIndex) }">
                        <span class="sm:hidden">{{ DifficultyShortNames[level.levelIndex] }}</span>
                        <span class="hidden sm:inline">{{ DifficultyNames[level.levelIndex] }}</span>
                    </span>
                    <Icon v-if="level.done === level.total" name="mdi:check-circle" class="h-3.5 w-3.5 text-success" />
                </div>
                <div class="mt-0.5 font-mono font-bold tabular-nums">
                    <span class="text-base sm:text-xl" :style="{ color: getDifficultyColor(level.levelIndex) }">{{ level.done }}</span>
                    <span class="text-[10px] text-base-content/45 sm:text-xs">/{{ level.total }}</span>
                </div>
                <div class="font-mono text-[10px] text-base-content/55 tabular-nums">
                    {{ pctText(percent(level)) }}
                </div>
                <span class="absolute inset-x-0 bottom-0 h-1 bg-base-200">
                    <span class="block h-full" :style="{ width: `${percent(level)}%`, backgroundColor: getDifficultyColor(level.levelIndex) }" />
                </span>
            </button>
        </div>
    </section>
</template>
