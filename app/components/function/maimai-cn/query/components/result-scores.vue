<script setup lang="ts">
import type { MaimaiScore } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { TileDisplayMode, ViewMode } from '~/composables/function/MaimaiCN/useMaimaiUtils'
import ScoreList from '../../bests/components/score-list.vue'

const props = defineProps<{
    scores: MaimaiScore[]
    queryLabel: string
}>()

const PAGE_SIZE = 50
const currentViewMode = ref<ViewMode>(ViewMode.LIST)
const tileDisplayMode = ref<TileDisplayMode>(TileDisplayMode.RATING)
const displayCount = ref(PAGE_SIZE)

const visibleScores = computed(() => props.scores.slice(0, displayCount.value))
const hasMore = computed(() => displayCount.value < props.scores.length)
const topAchievement = computed(() => props.scores[0]?.achievements)
const averageAchievement = computed(() => {
    if (!props.scores.length)
        return null
    return props.scores.reduce((sum, score) => sum + (score.achievements ?? 0), 0) / props.scores.length
})
const top50Rating = computed(() => {
    if (!props.scores.length)
        return null
    return [...props.scores]
        .sort((a, b) => (b.dx_rating ?? 0) - (a.dx_rating ?? 0))
        .slice(0, 50)
        .reduce((sum, score) => sum + (score.dx_rating ?? 0), 0)
})

function loadMore() {
    displayCount.value += PAGE_SIZE
}
</script>

<template>
    <section class="space-y-4">
        <div class="border border-base-300/70 bg-base-100/80 p-4">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                        成绩筛选结果
                    </p>
                    <h3 class="mt-1 text-xl font-semibold text-base-content">
                        {{ queryLabel }} 分数列表
                    </h3>
                    <p class="mt-1 text-sm text-base-content/60">
                        默认按达成率从高到低展示，可切换列表或平铺模式浏览当前筛选结果。
                    </p>
                </div>
                <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <div class="border border-base-300/70 bg-base-50 px-3 py-2 text-sm">
                        <div class="text-xs text-base-content/50">
                            成绩总数
                        </div>
                        <div class="font-semibold text-base-content">
                            {{ scores.length }} 条
                        </div>
                    </div>
                    <div class="border border-base-300/70 bg-base-50 px-3 py-2 text-sm">
                        <div class="text-xs text-base-content/50">
                            最高达成率
                        </div>
                        <div class="font-semibold text-base-content">
                            {{ topAchievement?.toFixed(4) || '--' }}%
                        </div>
                    </div>
                    <div class="border border-base-300/70 bg-base-50 px-3 py-2 text-sm">
                        <div class="text-xs text-base-content/50">
                            平均达成率
                        </div>
                        <div class="font-semibold text-base-content">
                            {{ averageAchievement?.toFixed(4) || '--' }}%
                        </div>
                    </div>
                    <div class="border border-base-300/70 bg-base-50 px-3 py-2 text-sm">
                        <div class="text-xs text-base-content/50">
                            Rating
                        </div>
                        <div class="font-semibold text-base-content">
                            {{ top50Rating != null ? Math.floor(top50Rating * 100) / 100 : '--' }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-base-300/70 pt-3">
                <div class="join border border-base-300/80 bg-base-100 p-1">
                    <button
                        class="btn join-item btn-sm border-0"
                        :class="currentViewMode === ViewMode.LIST ? 'btn-primary' : 'btn-ghost'"
                        @click="currentViewMode = ViewMode.LIST"
                    >
                        列表
                    </button>
                    <button
                        class="btn join-item btn-sm border-0"
                        :class="currentViewMode === ViewMode.TILE ? 'btn-primary' : 'btn-ghost'"
                        @click="currentViewMode = ViewMode.TILE"
                    >
                        平铺
                    </button>
                </div>
                <p class="text-sm text-base-content/55">
                    当前显示 {{ visibleScores.length }} / {{ scores.length }} 条
                </p>
            </div>
        </div>

        <ScoreList
            :scores="visibleScores" :view-mode="currentViewMode" :display-mode="tileDisplayMode"
            @toggle-display-mode="tileDisplayMode = $event"
        />

        <div v-if="hasMore" class="text-center">
            <button class="btn btn-outline px-5" @click="loadMore">
                加载更多（剩余 {{ scores.length - displayCount }} 条）
            </button>
        </div>
    </section>
</template>
