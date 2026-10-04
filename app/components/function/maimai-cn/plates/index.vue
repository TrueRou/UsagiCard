<script setup lang="ts">
import type { ChartEntry, PlateAttr, PlateObject } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { DifficultyNames, DifficultyShortNames, SongType, useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'
import { useScoreLibrary } from '~/composables/function/MaimaiCN/useScoreLibrary.client'
import ChartDetailModal from '../shared/chart-detail-modal.vue'
import PageHeaderActions from '../shared/page-header-actions.vue'

const props = defineProps<{
    artifactId: string
}>()

const { artifact } = await useArtifact(props.artifactId)
const { entries, refresh: refreshLibrary } = useScoreLibrary(props.artifactId)
const { formatAchievement, getDifficultyColor, getDifficultyTextClass, getSongJacketUrl, handleImageError } = useMaimaiUtils()

const VERSION_GROUPS = [
    { label: '旧框', versions: ['真', '超', '檄', '橙', '晓', '桃', '樱', '紫', '堇', '白', '雪', '辉'] },
    { label: 'DX', versions: ['熊', '华', '爽', '煌', '星', '宙', '祭', '祝', '双', '宴', '镜', '彩'] },
]
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
const attrLabel = computed(() => ATTR_OPTIONS.find(option => option.value === selection.value.attr)?.label ?? '')
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

function refresh() {
    void fetchPlates()
    void refreshLibrary()
}

watch(() => [selection.value.version, selection.value.plan, selection.value.attr], fetchPlates)
onMounted(refresh)

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
    <div class="space-y-3 p-2 sm:p-3 lg:p-4">
        <PageHeaderActions :artifact="artifact" :loading="loading" @refresh="refresh" @updated="refresh" />

        <!-- 牌子选择 -->
        <section class="panel space-y-3 p-3">
            <div class="space-y-2">
                <div v-for="group in VERSION_GROUPS" :key="group.label" class="grid grid-cols-[2.25rem_1fr] items-start gap-2">
                    <span class="pt-2 text-[11px] font-semibold text-base-content/50">{{ group.label }}</span>
                    <div class="flex flex-wrap gap-1">
                        <button
                            v-for="version in group.versions"
                            :key="version"
                            class="chip w-8 px-0 text-sm"
                            :class="selection.version === version ? 'chip-on' : 'chip-idle'"
                            :aria-pressed="selection.version === version"
                            type="button"
                            @click="selection.version = version"
                        >
                            {{ version }}
                        </button>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div class="grid grid-cols-4 gap-1" role="radiogroup" aria-label="牌子种类">
                    <button
                        v-for="plan in PLATE_TYPES"
                        :key="plan.value"
                        class="chip h-10 w-full flex-col gap-0 leading-tight"
                        :class="selection.plan === plan.value ? 'chip-on' : 'chip-idle'"
                        role="radio"
                        :aria-checked="selection.plan === plan.value"
                        type="button"
                        @click="selection.plan = plan.value"
                    >
                        <span class="text-sm">{{ plan.value }}</span>
                        <span class="text-[10px] font-medium opacity-70">{{ plan.description }}</span>
                    </button>
                </div>
                <div class="grid grid-cols-4 gap-1 self-end" role="radiogroup" aria-label="曲目状态">
                    <button
                        v-for="option in ATTR_OPTIONS"
                        :key="option.value"
                        class="chip w-full"
                        :class="selection.attr === option.value ? 'border-primary/50 bg-primary/10 text-primary' : 'chip-idle'"
                        role="radio"
                        :aria-checked="selection.attr === option.value"
                        type="button"
                        @click="selection.attr = option.value"
                    >
                        {{ option.label }}
                    </button>
                </div>
            </div>
        </section>

        <!-- 进度摘要 -->
        <section class="panel flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
            <div>
                <div class="text-[11px] text-base-content/55">
                    {{ attrLabel }}曲目
                </div>
                <div class="text-lg font-bold">
                    {{ plateName }} · <span class="font-mono tabular-nums">{{ loading ? '…' : plates.length }}</span> 首
                </div>
            </div>
            <div class="flex flex-wrap gap-1.5">
                <span
                    v-for="item in summary"
                    :key="item.level"
                    class="rounded-lg px-2 py-1 text-xs font-bold"
                    :class="getDifficultyTextClass(item.level)"
                    :style="{ backgroundColor: getDifficultyColor(item.level) }"
                >
                    {{ DifficultyNames[item.level] }} · {{ item.count }}
                </span>
            </div>
        </section>

        <div v-if="error" class="alert alert-error alert-soft text-sm" role="alert">
            <Icon name="mdi:alert-circle-outline" class="h-5 w-5" />
            <span>{{ error }}</span>
            <button class="btn btn-sm" type="button" @click="fetchPlates">
                重试
            </button>
        </div>

        <div v-if="loading" class="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" aria-busy="true">
            <div v-for="index in 6" :key="index" class="skeleton h-[88px] rounded-xl" />
        </div>

        <div v-else-if="!plates.length && !error" class="panel px-4 py-12 text-center">
            <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-base-200 text-base-content/40">
                <Icon :name="selection.attr === 'remained' ? 'mdi:party-popper' : 'mdi:music-note-off-outline'" class="h-6 w-6" />
            </div>
            <p class="text-sm text-base-content/70">
                {{ selection.attr === 'remained' ? '已全部完成，恭喜！' : '没有符合条件的曲目' }}
            </p>
        </div>

        <div v-else-if="plates.length" class="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            <article
                v-for="plate in plates"
                :key="plate.song.id"
                class="panel flex gap-3 p-2.5"
            >
                <img
                    :src="getSongJacketUrl(plate.song.id)"
                    alt=""
                    class="h-14 w-14 shrink-0 rounded-lg object-cover"
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
                            class="flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-bold transition-[opacity,transform] hover:opacity-85 active:scale-95"
                            :class="getDifficultyTextClass(level)"
                            :style="{ backgroundColor: getDifficultyColor(level) }"
                            type="button"
                            :aria-label="`${DifficultyNames[level]} 详情`"
                            @click="openDetail(plate, level)"
                        >
                            {{ DifficultyShortNames[level] }}
                            <span class="font-mono font-medium opacity-90 tabular-nums">
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
