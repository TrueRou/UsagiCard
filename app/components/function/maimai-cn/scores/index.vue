<script setup lang="ts">
import type { ChartEntry, ScoreFilterState, ScoreSortState } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { useScoreLibrary } from '~/composables/function/MaimaiCN/useScoreLibrary.client'
import { computeMetrics, filterEntries, sortEntries } from '~/composables/function/MaimaiCN/useScoreView'
import { useScoreViewState } from '~/composables/function/MaimaiCN/useScoreViewState'
import ChartDetailModal from '../shared/chart-detail-modal.vue'
import ScoreGrid from '../shared/score-grid.vue'
import AdvancedFilterDialog from './advanced-filter-dialog.vue'
import AnalyticsDialog from './analytics-dialog.vue'
import FilterBar from './filter-bar.vue'
import MetricStrip from './metric-strip.vue'
import SortDialog from './sort-dialog.vue'

const props = defineProps<{
    artifactId: string
}>()

const { entries, loading, error, refresh, matchSongIds } = useScoreLibrary(props.artifactId)
const { filter, sort } = useScoreViewState()

const keyword = ref('')
const debouncedKeyword = refDebounced(keyword, 200)

const matchedSongIds = computed(() => {
    // 依赖 entries：歌曲索引在成绩加载完成后才可用
    if (!entries.value.length)
        return null
    return matchSongIds(debouncedKeyword.value)
})

const filtered = computed(() => filterEntries(entries.value, matchedSongIds.value, filter.value))
const displayed = computed(() => sortEntries(filtered.value, sort.value))
const metrics = computed(() => computeMetrics(displayed.value))
const playedTotal = computed(() => entries.value.filter(entry => entry.score).length)
const hiddenUnplayed = computed(() => !filter.value.showUnplayed && displayed.value.length === 0 && entries.value.length > 0)

const advancedOpen = ref(false)
const sortOpen = ref(false)
const analyticsOpen = ref(false)
const detailOpen = ref(false)
const selected = ref<ChartEntry | null>(null)

function openDetail(entry: ChartEntry) {
    selected.value = entry
    detailOpen.value = true
}

function applyPreset(value: { filter: ScoreFilterState, sort: ScoreSortState }) {
    filter.value = value.filter
    sort.value = value.sort
}

onMounted(refresh)
</script>

<template>
    <div class="space-y-3 p-2 sm:p-3">
        <header class="flex flex-wrap items-end justify-between gap-2">
            <div>
                <h2 class="text-lg font-bold tracking-tight sm:text-xl">
                    全部成绩
                </h2>
                <span class="badge badge-soft badge-primary badge-sm mt-1">
                    <Icon name="mdi:music-note" class="h-3.5 w-3.5" />
                    已游玩 {{ playedTotal }} 张 · 当前显示 {{ displayed.length }} 张
                </span>
            </div>
            <div class="flex gap-1.5">
                <button class="btn btn-sm btn-ghost border border-base-300" type="button" :disabled="loading" aria-label="刷新成绩" @click="refresh">
                    <Icon name="mdi:refresh" class="h-4 w-4" :class="loading ? 'animate-spin' : ''" />
                </button>
                <button class="btn btn-sm btn-ghost border border-base-300" type="button" :disabled="!displayed.length" @click="analyticsOpen = true">
                    <Icon name="mdi:chart-bar" class="h-4 w-4 text-primary" />
                    统计看板
                </button>
            </div>
        </header>

        <div v-if="error" class="alert alert-error alert-soft text-sm" role="alert">
            {{ error }}
            <button class="btn btn-xs" type="button" @click="refresh">
                重试
            </button>
        </div>

        <MetricStrip :metrics="metrics" />

        <FilterBar
            v-model:keyword="keyword"
            :filter="filter"
            :sort="sort"
            @update:filter="filter = $event"
            @update:sort="sort = $event"
            @open-advanced="advancedOpen = true"
            @open-sort="sortOpen = true"
        />

        <ScoreGrid :entries="displayed" :loading="loading && !entries.length" @select="openDetail">
            <template #empty>
                <p class="text-sm font-medium text-base-content/75">
                    暂未检索到符合条件的谱面成绩
                </p>
                <p class="mt-1 text-xs text-base-content/55">
                    请尝试调整难度、定数区间或关键词。
                </p>
                <button v-if="hiddenUnplayed" class="btn btn-sm btn-soft btn-primary mt-3" type="button" @click="filter = { ...filter, showUnplayed: true }">
                    包含未游玩谱面
                </button>
            </template>
        </ScoreGrid>

        <AdvancedFilterDialog
            v-model:open="advancedOpen"
            :filter="filter"
            :entries="entries"
            :matched-song-ids="matchedSongIds"
            @apply="filter = $event"
        />
        <SortDialog
            v-model:open="sortOpen"
            :sort="sort"
            :filter="filter"
            @apply="sort = $event"
            @apply-preset="applyPreset"
        />
        <AnalyticsDialog v-model:open="analyticsOpen" :entries="displayed" />
        <ChartDetailModal v-model:open="detailOpen" :entry="selected" :library="entries" />
    </div>
</template>
