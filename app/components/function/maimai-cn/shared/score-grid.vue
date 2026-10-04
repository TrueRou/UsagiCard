<script setup lang="ts">
import type { ChartEntry } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import ScoreCard from './score-card.vue'

const props = withDefaults(defineProps<{
    entries: ChartEntry[]
    loading?: boolean
    /** 显示名次角标，值为第一张卡片的名次 */
    rankFrom?: number
    pageSize?: number
}>(), {
    loading: false,
    rankFrom: undefined,
    pageSize: 60,
})

defineEmits<{
    (e: 'select', entry: ChartEntry): void
}>()

const displayCount = ref(props.pageSize)
const visibleEntries = computed(() => props.entries.slice(0, displayCount.value))
const hasMore = computed(() => displayCount.value < props.entries.length)

watch(() => props.entries, () => {
    displayCount.value = props.pageSize
})

const sentinel = ref<HTMLElement | null>(null)
useIntersectionObserver(sentinel, ([entry]) => {
    if (entry?.isIntersecting && hasMore.value)
        displayCount.value += props.pageSize
}, { rootMargin: '200px' })
</script>

<template>
    <div>
        <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-sm text-base-content/60">
            <span class="loading loading-spinner loading-md text-primary" />
            正在加载成绩数据...
        </div>

        <div v-else-if="entries.length === 0" class="rounded-lg border border-base-300 bg-base-100 px-4 py-14 text-center">
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
            <div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                <ScoreCard
                    v-for="(entry, index) in visibleEntries"
                    :key="entry.key"
                    :entry="entry"
                    :rank="rankFrom !== undefined ? rankFrom + index : undefined"
                    @select="$emit('select', $event)"
                />
            </div>
            <div v-if="hasMore" ref="sentinel" class="flex justify-center py-4">
                <span class="loading loading-dots loading-sm text-base-content/40" />
            </div>
        </template>
    </div>
</template>
