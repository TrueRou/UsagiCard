<script setup lang="ts">
import type { ChartEntry, MaimaiBests, MaimaiScore } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { useScoreLibrary } from '~/composables/function/MaimaiCN/useScoreLibrary.client'
import { chartKey } from '~/composables/function/MaimaiCN/useScoreView'
import ChartDetailModal from '../shared/chart-detail-modal.vue'
import ScoreGrid from '../shared/score-grid.vue'

const props = defineProps<{
    artifactId: string
}>()

const { entries, loading: libraryLoading, error: libraryError, refresh: refreshLibrary, findEntry } = useScoreLibrary(props.artifactId)

const bests = ref<MaimaiBests | null>(null)
const bestsLoading = ref(false)
const bestsError = ref<string | null>(null)

async function refreshBests() {
    bestsLoading.value = true
    bestsError.value = null
    try {
        bests.value = await useNuxtApp().$leporidae<MaimaiBests>('/api/maimai/usagicard/bests', { query: { uuid: props.artifactId } })
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

const sections = computed(() => {
    if (!bests.value || !entries.value.length)
        return []
    const value = bests.value
    return [
        { key: 'b15', title: '当前版本 B15', rating: value.rating_b15, scores: value.scores_b15, entries: toEntries(value.scores_b15) },
        { key: 'b35', title: '往期版本 B35', rating: value.rating_b35, scores: value.scores_b35, entries: toEntries(value.scores_b35) },
    ]
})

const totals = computed(() => {
    const value = bests.value
    if (!value)
        return []
    return [
        { label: 'B15 合计', rating: value.rating_b15, scores: value.scores_b15, color: 'text-warning' },
        { label: 'B35 合计', rating: value.rating_b35, scores: value.scores_b35, color: 'text-info' },
    ]
})

function stats(scores: MaimaiScore[]) {
    if (!scores.length)
        return { min: '--', avg: '--' }
    const ratings = scores.map(score => score.dx_rating)
    return {
        min: String(Math.min(...ratings)),
        avg: (ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1),
    }
}

const detailOpen = ref(false)
const selected = ref<ChartEntry | null>(null)

function openDetail(entry: ChartEntry) {
    selected.value = entry
    detailOpen.value = true
}
</script>

<template>
    <div class="space-y-4 p-2 sm:p-3">
        <div v-if="error" class="alert alert-error alert-soft text-sm" role="alert">
            {{ error }}
            <button class="btn btn-xs" type="button" @click="refresh">
                重试
            </button>
        </div>

        <section class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-xs">
            <div class="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div class="text-xs font-medium text-base-content/55">
                        DX Rating
                    </div>
                    <div class="font-mono text-3xl font-bold tracking-tight">
                        {{ bests ? bests.rating : '--' }}
                    </div>
                </div>
                <button class="btn btn-sm btn-ghost border border-base-300" type="button" :disabled="loading" aria-label="刷新" @click="refresh">
                    <Icon name="mdi:refresh" class="h-4 w-4" :class="loading ? 'animate-spin' : ''" />
                </button>
            </div>
            <dl v-if="bests" class="mt-3 grid grid-cols-2 gap-2">
                <div v-for="item in totals" :key="item.label" class="rounded-md border border-base-200 bg-base-200/40 px-3 py-2">
                    <dt class="text-[11px] text-base-content/55">
                        {{ item.label }}
                    </dt>
                    <dd class="font-mono text-lg font-bold" :class="item.color">
                        {{ item.rating }}
                    </dd>
                    <dd class="text-[10px] text-base-content/50">
                        最低 {{ stats(item.scores).min }} · 平均 {{ stats(item.scores).avg }} · {{ item.scores.length }} 首
                    </dd>
                </div>
            </dl>
        </section>

        <ScoreGrid v-if="!sections.length" :entries="[]" :loading="loading">
            <template #empty>
                <p class="text-sm font-medium text-base-content/75">
                    暂无最佳成绩
                </p>
                <p class="mt-1 text-xs text-base-content/55">
                    请先通过「查分更新」同步成绩。
                </p>
            </template>
        </ScoreGrid>

        <section v-for="section in sections" :key="section.key" class="space-y-2">
            <h3 class="flex items-baseline justify-between gap-2">
                <span class="text-base font-bold">{{ section.title }}</span>
                <span class="font-mono text-sm text-base-content/60">{{ section.rating }}</span>
            </h3>
            <ScoreGrid :entries="section.entries" :rank-from="1" :page-size="60" @select="openDetail">
                <template #empty>
                    <p class="text-sm text-base-content/60">
                        暂无成绩
                    </p>
                </template>
            </ScoreGrid>
        </section>

        <ChartDetailModal v-model:open="detailOpen" :entry="selected" :library="entries" />
    </div>
</template>
