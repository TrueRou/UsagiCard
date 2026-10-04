<script setup lang="ts">
import type { ChartEntry, ScoreFilterState, ScoreSortState } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { useScoreDisplayPref } from '~/composables/function/MaimaiCN/useScoreDisplayPref'
import { useScoreLibrary } from '~/composables/function/MaimaiCN/useScoreLibrary.client'
import { computeMetrics, filterEntries, sortEntries } from '~/composables/function/MaimaiCN/useScoreView'
import { useScoreViewState } from '~/composables/function/MaimaiCN/useScoreViewState'
import ChartDetailModal from '../shared/chart-detail-modal.vue'
import PageHeaderActions from '../shared/page-header-actions.vue'
import ScoreGrid from '../shared/score-grid.vue'
import AdvancedFilterDialog from './advanced-filter-dialog.vue'
import AnalyticsDialog from './analytics-dialog.vue'
import FilterBar from './filter-bar.vue'
import MetricStrip from './metric-strip.vue'
import SortDialog from './sort-dialog.vue'

const props = defineProps<{
    artifactId: string
}>()

const { artifact, storageSave } = await useArtifact(props.artifactId)
const { entries, loading, error, refresh, matchSongIds } = useScoreLibrary(props.artifactId)
const { filter, sort } = useScoreViewState()
const { mode: viewMode, tileContent, syncState, saveToCard } = useScoreDisplayPref(props.artifactId, artifact, storageSave)

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

function clearLimit() {
    sort.value = { ...sort.value, limit: null }
}

onMounted(refresh)
</script>

<template>
    <div class="space-y-3 p-2 sm:p-3 lg:p-4">
        <PageHeaderActions :artifact="artifact" :loading="loading" @refresh="refresh" @updated="refresh" />

        <div v-if="error" class="alert alert-error alert-soft text-sm" role="alert">
            <Icon name="mdi:alert-circle-outline" class="h-5 w-5" />
            <span>{{ error }}</span>
            <button class="btn btn-sm" type="button" @click="refresh">
                重试
            </button>
        </div>

        <MetricStrip :metrics="metrics" />

        <FilterBar
            v-model:keyword="keyword"
            v-model:mode="viewMode"
            v-model:tile-content="tileContent"
            :filter="filter"
            :sort="sort"
            :sync-state="syncState"
            @update:filter="filter = $event"
            @update:sort="sort = $event"
            @open-advanced="advancedOpen = true"
            @open-sort="sortOpen = true"
            @open-analytics="analyticsOpen = true"
            @save-to-card="saveToCard"
        />

        <div class="-mt-1 flex min-h-6 flex-wrap items-center gap-x-3 gap-y-1 px-0.5 text-xs text-base-content/55">
            <span>已游玩 <b class="font-mono font-semibold text-base-content/80">{{ playedTotal }}</b> 张</span>
            <span>当前显示 <b class="font-mono font-semibold text-base-content/80">{{ displayed.length }}</b> 张</span>
            <button v-if="sort.limit" class="badge badge-soft badge-primary gap-1" type="button" @click="clearLimit">
                仅前 {{ sort.limit }} 条
                <Icon name="mdi:close" class="h-3 w-3" />
            </button>
        </div>

        <ScoreGrid
            :entries="displayed"
            :loading="loading && !entries.length"
            :mode="viewMode"
            :tile-content="tileContent"
            @select="openDetail"
        >
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
