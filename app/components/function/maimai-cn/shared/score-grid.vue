<script setup lang="ts">
import type { ChartEntry } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import type { MaimaiTileContent, MaimaiViewMode } from '~/types/api'
import ScoreCard from './score-card.vue'
import ScoreTile from './score-tile.vue'

const props = withDefaults(defineProps<{
    entries: ChartEntry[]
    loading?: boolean
    /** 显示名次角标，值为第一张卡片的名次 */
    rankFrom?: number
    pageSize?: number
    mode?: MaimaiViewMode
    tileContent?: MaimaiTileContent
}>(), {
    loading: false,
    rankFrom: undefined,
    pageSize: 60,
    mode: 'list',
    tileContent: 'rating',
})

defineEmits<{
    (e: 'select', entry: ChartEntry): void
}>()

// 平铺卡片更小，每批多渲染一倍
const step = computed(() => props.mode === 'tile' ? props.pageSize * 2 : props.pageSize)
const displayCount = ref(step.value)
const visibleEntries = computed(() => props.entries.slice(0, displayCount.value))
const hasMore = computed(() => displayCount.value < props.entries.length)

watch(() => props.entries, () => {
    displayCount.value = step.value
})
// 切换视图不重置已加载数量，只保证至少显示一整批
watch(step, (value) => {
    if (displayCount.value < value)
        displayCount.value = value
})

const sentinel = ref<HTMLElement | null>(null)
useIntersectionObserver(sentinel, ([entry]) => {
    if (entry?.isIntersecting && hasMore.value)
        displayCount.value += step.value
}, { rootMargin: '300px' })

const LIST_GRID = 'grid grid-cols-2 gap-1.5 sm:gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
const TILE_GRID = 'grid grid-cols-4 gap-1 sm:grid-cols-5 sm:gap-1.5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12'
const gridClass = computed(() => props.mode === 'tile' ? TILE_GRID : LIST_GRID)
</script>

<template>
    <div>
        <div v-if="loading" :class="gridClass" aria-busy="true" aria-label="正在加载成绩">
            <div
                v-for="index in (mode === 'tile' ? 16 : 8)"
                :key="index"
                class="skeleton"
                :class="mode === 'tile' ? 'aspect-square rounded-lg' : 'h-[88px] rounded-xl sm:h-[100px]'"
            />
        </div>

        <div v-else-if="entries.length === 0" class="panel px-4 py-14 text-center">
            <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-base-200 text-base-content/40">
                <Icon name="mdi:music-note-off-outline" class="h-6 w-6" />
            </div>
            <slot name="empty">
                <p class="text-sm font-medium text-base-content/75">
                    暂未检索到符合条件的谱面成绩
                </p>
            </slot>
        </div>

        <template v-else>
            <div :class="gridClass">
                <template v-if="mode === 'tile'">
                    <ScoreTile
                        v-for="(entry, index) in visibleEntries"
                        :key="entry.key"
                        :entry="entry"
                        :content="tileContent"
                        :rank="rankFrom !== undefined ? rankFrom + index : undefined"
                        @select="$emit('select', $event)"
                    />
                </template>
                <template v-else>
                    <ScoreCard
                        v-for="(entry, index) in visibleEntries"
                        :key="entry.key"
                        :entry="entry"
                        :rank="rankFrom !== undefined ? rankFrom + index : undefined"
                        @select="$emit('select', $event)"
                    />
                </template>
            </div>
            <div v-if="hasMore" ref="sentinel" class="flex justify-center py-4">
                <span class="loading loading-dots loading-sm text-base-content/40" />
            </div>
        </template>
    </div>
</template>
