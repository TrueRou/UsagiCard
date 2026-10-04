<script setup lang="ts">
import type { ChartEntry, MaimaiBests, MaimaiScore } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { fetchScoresVersion, readMaimaiCache, writeMaimaiCache } from '~/composables/function/MaimaiCN/useMaimaiCache.client'
import { VIEW_MODE_OPTIONS } from '~/composables/function/MaimaiCN/useScoreDisplay'
import { useScoreDisplayPref } from '~/composables/function/MaimaiCN/useScoreDisplayPref'
import { useScoreLibrary } from '~/composables/function/MaimaiCN/useScoreLibrary.client'
import { chartKey } from '~/composables/function/MaimaiCN/useScoreView'
import ChartDetailModal from '../shared/chart-detail-modal.vue'
import PageHeaderActions from '../shared/page-header-actions.vue'
import ScoreGrid from '../shared/score-grid.vue'
import ViewMenu from '../shared/view-menu.vue'

const props = defineProps<{
    artifactId: string
}>()

const { artifact, storageSave } = await useArtifact(props.artifactId)
const { entries, loading: libraryLoading, error: libraryError, refresh: refreshLibrary, findEntry } = useScoreLibrary(props.artifactId)
const { mode: viewMode, tileContent, syncState, saveToCard } = useScoreDisplayPref(props.artifactId, artifact, storageSave)

const bests = ref<MaimaiBests | null>(null)
const bestsLoading = ref(false)
const bestsError = ref<string | null>(null)

async function refreshBests() {
    bestsLoading.value = true
    bestsError.value = null
    try {
        const api = useNuxtApp().$leporidae
        const cached = readMaimaiCache<MaimaiBests>('bests', props.artifactId)
        const version = await fetchScoresVersion(props.artifactId)
        if (cached?.version === version) {
            bests.value = cached.data
        }
        else {
            bests.value = await api<MaimaiBests>('/api/maimai/usagicard/bests', { query: { uuid: props.artifactId } })
            writeMaimaiCache('bests', version, bests.value, props.artifactId)
        }
    }
    catch (e: any) {
        bestsError.value = e?.message || '最佳成绩加载失败，请稍后重试'
    }
    finally {
        bestsLoading.value = false
    }
}

function refresh() {
    void refreshBests()
    void refreshLibrary()
}

onMounted(refresh)

const loading = computed(() => bestsLoading.value || libraryLoading.value)
const error = computed(() => bestsError.value || libraryError.value)

function toEntries(scores: MaimaiScore[]): ChartEntry[] {
    return scores.flatMap((score) => {
        const entry = findEntry(chartKey(score.id % 10000, score.type, score.level_index))
        return entry ? [entry] : []
    })
}

function stats(scores: MaimaiScore[]) {
    if (!scores.length)
        return { min: '--', avg: '--' }
    const ratings = scores.map(score => score.dx_rating)
    return {
        min: String(Math.min(...ratings)),
        avg: (ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1),
    }
}

// B35 用信息蓝、B15 用警示橙，沿用旧版的颜色语义
const sections = computed(() => {
    const value = bests.value
    if (!value)
        return []
    return [
        { key: 'b35', title: 'Best 35', hint: '往期版本', rating: value.rating_b35, scores: value.scores_b35, text: 'text-info', bar: 'bg-info' },
        { key: 'b15', title: 'Best 15', hint: '当前版本', rating: value.rating_b15, scores: value.scores_b15, text: 'text-warning', bar: 'bg-warning' },
    ].map(section => ({ ...section, entries: toEntries(section.scores), stats: stats(section.scores) }))
})

const hasScores = computed(() => sections.value.some(section => section.scores.length > 0))

const detailOpen = ref(false)
const selected = ref<ChartEntry | null>(null)

function openDetail(entry: ChartEntry) {
    selected.value = entry
    detailOpen.value = true
}
</script>

<template>
    <div class="space-y-4 p-2 sm:p-3 lg:p-4">
        <PageHeaderActions :artifact="artifact" :loading="loading" @refresh="refresh" @updated="refresh" />

        <div v-if="error" class="alert alert-error alert-soft text-sm" role="alert">
            <Icon name="mdi:alert-circle-outline" class="h-5 w-5" />
            <span>{{ error }}</span>
            <button class="btn btn-sm" type="button" @click="refresh">
                重试
            </button>
        </div>

        <!-- 汇总 -->
        <section
            v-if="bests || loading"
            class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-base-300 bg-base-300 lg:grid-cols-[minmax(14rem,auto)_1fr_1fr]"
        >
            <div class="col-span-2 flex items-end justify-between gap-3 bg-base-100 px-4 py-3 lg:col-span-1 lg:flex-col lg:items-start lg:justify-center">
                <div class="text-xs font-medium text-base-content/55">
                    DX Rating
                </div>
                <div v-if="bests" class="font-mono text-4xl font-bold leading-none tracking-tight tabular-nums">
                    {{ bests.rating }}
                </div>
                <div v-else class="skeleton h-9 w-28" />
            </div>
            <div v-for="section in sections" :key="section.key" class="bg-base-100 px-4 py-3">
                <div class="flex items-center gap-1.5 text-xs font-semibold" :class="section.text">
                    <span class="h-3 w-1 rounded-full" :class="section.bar" />
                    {{ section.title }}
                    <span class="font-normal text-base-content/45">{{ section.hint }}</span>
                </div>
                <div class="mt-1 font-mono text-2xl font-bold leading-tight tabular-nums" :class="section.text">
                    {{ section.rating }}
                </div>
                <div class="mt-0.5 text-[11px] text-base-content/55 tabular-nums">
                    最低 {{ section.stats.min }} · 平均 {{ section.stats.avg }}
                </div>
            </div>
            <template v-if="!bests">
                <div v-for="index in 2" :key="index" class="space-y-2 bg-base-100 px-4 py-3">
                    <div class="skeleton h-3 w-16" />
                    <div class="skeleton h-7 w-20" />
                </div>
            </template>
        </section>

        <ScoreGrid v-if="loading && !hasScores" :entries="[]" loading :mode="viewMode" />

        <div v-else-if="!error && !hasScores" class="panel px-4 py-14 text-center">
            <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-base-200 text-base-content/40">
                <Icon name="mdi:trophy-outline" class="h-6 w-6" />
            </div>
            <p class="text-sm font-medium text-base-content/75">
                暂无最佳成绩
            </p>
            <p class="mt-1 text-xs text-base-content/55">
                点击右上角的火箭按钮同步成绩。
            </p>
        </div>

        <template v-else>
            <section v-for="section in sections" :key="section.key" class="space-y-2">
                <header class="flex items-center justify-between gap-2">
                    <h3 class="flex min-w-0 items-center gap-2">
                        <span class="h-5 w-1 shrink-0 rounded-full" :class="section.bar" />
                        <span class="text-base font-bold">{{ section.title }}</span>
                        <span class="font-mono text-sm font-semibold tabular-nums" :class="section.text">{{ section.rating }}</span>
                        <span class="hidden text-xs text-base-content/45 sm:inline">{{ section.hint }} · {{ section.scores.length }} 首</span>
                    </h3>
                    <div class="flex shrink-0 items-center gap-1">
                        <div class="join" role="radiogroup" :aria-label="`${section.title} 布局`">
                            <button
                                v-for="option in VIEW_MODE_OPTIONS"
                                :key="option.value"
                                class="btn join-item btn-sm btn-square"
                                :class="viewMode === option.value ? 'btn-primary' : 'btn-ghost bg-base-200'"
                                role="radio"
                                :aria-checked="viewMode === option.value"
                                :aria-label="option.label"
                                :title="option.label"
                                type="button"
                                @click="viewMode = option.value"
                            >
                                <Icon :name="option.icon" class="h-4 w-4" />
                            </button>
                        </div>
                        <ViewMenu
                            v-model:mode="viewMode"
                            v-model:tile-content="tileContent"
                            :sync-state="syncState"
                            :show-label="false"
                            trigger-icon="mdi:tune-variant"
                            @save-to-card="saveToCard"
                        />
                    </div>
                </header>
                <ScoreGrid
                    :entries="section.entries"
                    :rank-from="1"
                    :page-size="60"
                    :mode="viewMode"
                    :tile-content="tileContent"
                    @select="openDetail"
                >
                    <template #empty>
                        <p class="text-sm text-base-content/60">
                            暂无成绩
                        </p>
                    </template>
                </ScoreGrid>
            </section>
        </template>

        <ChartDetailModal v-model:open="detailOpen" :entry="selected" :library="entries" />
    </div>
</template>
