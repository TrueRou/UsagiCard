<script setup lang="ts">
import type { ChartEntry, PlateAttr, PlateObject } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { DifficultyNames, DifficultyShortNames, SongType, useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'
import { useScoreLibrary } from '~/composables/function/MaimaiCN/useScoreLibrary.client'
import ChartDetailModal from '../shared/chart-detail-modal.vue'

const props = defineProps<{
    artifactId: string
}>()

const { entries, refresh: refreshLibrary } = useScoreLibrary(props.artifactId)
const { formatAchievement, getDifficultyColor, getDifficultyTextClass, getSongJacketUrl, handleImageError } = useMaimaiUtils()

const CLASSIC_PLATES = ['真', '超', '檄', '橙', '晓', '桃', '樱', '紫', '堇', '白', '雪', '辉']
const DX_PLATES = ['熊', '华', '爽', '煌', '星', '宙', '祭', '祝', '双', '宴', '镜', '彩']
const PLATE_TYPES = [
    { value: '极', description: 'FC' },
    { value: '将', description: 'SSS' },
    { value: '神', description: 'AP' },
    { value: '舞舞', description: 'FDX' },
]
const ATTR_OPTIONS: { value: PlateAttr, label: string }[] = [
    { value: 'remained', label: '未完成' },
    { value: 'cleared', label: '已完成' },
    { value: 'played', label: '已游玩' },
    { value: 'all', label: '全部' },
]

const selection = useLocalStorage('maicn:plates', { version: '桃', plan: '将', attr: 'remained' as PlateAttr }, {
    mergeDefaults: true,
    initOnMounted: true,
})

const plateName = computed(() => `${selection.value.version}${selection.value.plan}`)
const plates = ref<PlateObject[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
let requestId = 0

async function fetchPlates() {
    const currentId = ++requestId
    loading.value = true
    error.value = null
    try {
        const data = await useNuxtApp().$leporidae<PlateObject[]>('/api/maimai/usagicard/plates', {
            query: { uuid: props.artifactId, plate: plateName.value, attr: selection.value.attr },
        })
        if (currentId === requestId)
            plates.value = data ?? []
    }
    catch (e: any) {
        if (currentId === requestId) {
            plates.value = []
            error.value = e?.message || `「${plateName.value}」查询失败`
        }
    }
    finally {
        if (currentId === requestId)
            loading.value = false
    }
}

watch(() => [selection.value.version, selection.value.plan, selection.value.attr], fetchPlates)

onMounted(() => {
    void fetchPlates()
    void refreshLibrary()
})

const summary = computed(() => {
    const counts = new Map<number, number>()
    for (const plate of plates.value) {
        for (const level of plate.levels)
            counts.set(level, (counts.get(level) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => a[0] - b[0]).map(([level, count]) => ({ level, count }))
})

function bestScore(plate: PlateObject, level: number) {
    return plate.scores.find(score => score.level_index === level)
}

function chartType(plate: PlateObject, level: number): SongType {
    return bestScore(plate, level)?.type
        ?? (plate.song.difficulties.standard.some(diff => diff.level_index === level) ? SongType.STANDARD : SongType.DX)
}

const detailOpen = ref(false)
const selected = ref<ChartEntry | null>(null)

function openDetail(plate: PlateObject, level: number) {
    const type = chartType(plate, level)
    const entry = entries.value.find(item => item.song.id === plate.song.id && item.type === type && item.levelIndex === level)
        ?? entries.value.find(item => item.song.id === plate.song.id && item.levelIndex === level)
    if (!entry)
        return
    selected.value = entry
    detailOpen.value = true
}
</script>

<template>
    <div class="space-y-3 p-2 sm:p-3">
        <section class="space-y-3 rounded-lg border border-base-300 bg-base-100 p-3 shadow-xs">
            <div class="space-y-1.5">
                <div v-for="(group, index) in [CLASSIC_PLATES, DX_PLATES]" :key="index" class="flex flex-wrap gap-1">
                    <button
                        v-for="version in group"
                        :key="version"
                        class="btn btn-xs btn-square border"
                        :class="selection.version === version ? 'btn-primary' : 'border-base-300 bg-base-100 hover:bg-base-200'"
                        :aria-pressed="selection.version === version"
                        type="button"
                        @click="selection.version = version"
                    >
                        {{ version }}
                    </button>
                </div>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="join">
                    <button
                        v-for="plan in PLATE_TYPES"
                        :key="plan.value"
                        class="btn join-item btn-sm"
                        :class="selection.plan === plan.value ? 'btn-primary' : 'btn-ghost bg-base-200'"
                        type="button"
                        @click="selection.plan = plan.value"
                    >
                        {{ plan.value }}
                        <span class="text-[10px] opacity-60">{{ plan.description }}</span>
                    </button>
                </div>
                <div class="join">
                    <button
                        v-for="option in ATTR_OPTIONS"
                        :key="option.value"
                        class="btn join-item btn-xs"
                        :class="selection.attr === option.value ? 'btn-primary btn-soft' : 'btn-ghost'"
                        type="button"
                        @click="selection.attr = option.value"
                    >
                        {{ option.label }}
                    </button>
                </div>
            </div>
        </section>

        <section class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 shadow-xs">
            <div>
                <div class="text-[11px] text-base-content/55">
                    {{ ATTR_OPTIONS.find(option => option.value === selection.attr)?.label }}曲目
                </div>
                <div class="text-lg font-bold">
                    {{ plateName }} · <span class="font-mono">{{ plates.length }}</span> 首
                </div>
            </div>
            <div class="flex flex-wrap gap-1.5">
                <span
                    v-for="item in summary"
                    :key="item.level"
                    class="rounded px-2 py-1 text-xs font-bold"
                    :class="getDifficultyTextClass(item.level)"
                    :style="{ backgroundColor: getDifficultyColor(item.level) }"
                >
                    {{ DifficultyNames[item.level] }} · {{ item.count }}
                </span>
            </div>
        </section>

        <div v-if="error" class="alert alert-error alert-soft text-sm" role="alert">
            {{ error }}
        </div>

        <div v-if="loading" class="flex items-center justify-center gap-2 py-14 text-sm text-base-content/60">
            <span class="loading loading-spinner loading-md text-primary" />
            查询中...
        </div>

        <div v-else-if="!plates.length && !error" class="rounded-lg border border-base-300 bg-base-100 px-4 py-12 text-center text-sm text-base-content/60">
            {{ selection.attr === 'remained' ? '已全部完成，恭喜！' : '没有符合条件的曲目' }}
        </div>

        <div v-else class="grid grid-cols-1 gap-2 lg:grid-cols-2">
            <article
                v-for="plate in plates"
                :key="plate.song.id"
                class="flex gap-3 rounded-lg border border-base-300 bg-base-100 p-2.5 shadow-xs"
            >
                <img
                    :src="getSongJacketUrl(plate.song.id)"
                    :alt="plate.song.title"
                    class="h-14 w-14 shrink-0 rounded-md object-cover"
                    loading="lazy"
                    @error="handleImageError"
                >
                <div class="min-w-0 flex-1">
                    <div class="truncate text-sm font-bold">
                        {{ plate.song.title }}
                    </div>
                    <div class="truncate text-[11px] text-base-content/55">
                        #{{ plate.song.id }} · {{ plate.song.artist }}
                    </div>
                    <div class="mt-1.5 flex flex-wrap gap-1">
                        <button
                            v-for="level in plate.levels"
                            :key="level"
                            class="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-bold transition-opacity hover:opacity-85"
                            :class="getDifficultyTextClass(level)"
                            :style="{ backgroundColor: getDifficultyColor(level) }"
                            type="button"
                            :aria-label="`${DifficultyNames[level]} 详情`"
                            @click="openDetail(plate, level)"
                        >
                            {{ DifficultyShortNames[level] }}
                            <span class="font-mono font-medium opacity-90">
                                {{ bestScore(plate, level) ? formatAchievement(bestScore(plate, level)!.achievements) : '未游玩' }}
                            </span>
                        </button>
                    </div>
                </div>
            </article>
        </div>

        <ChartDetailModal v-model:open="detailOpen" :entry="selected" :library="entries" />
    </div>
</template>
