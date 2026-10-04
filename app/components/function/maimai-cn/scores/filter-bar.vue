<script setup lang="ts">
import type { ScoreFilterState, ScoreSortState } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import type { ViewSyncState } from '~/composables/function/MaimaiCN/useScoreDisplay'
import type { MaimaiTileContent, MaimaiViewMode } from '~/types/api'
import { activeFilterCount } from '~/composables/function/MaimaiCN/useScoreView'
import ViewMenu from '../shared/view-menu.vue'

/**
 * 吸顶工具条。
 * 移动端：第一行搜索，第二行横向滚动的筛选 / 排序 / 视图，拇指可直接触达。
 * 桌面端：合并为一行。
 */
const props = defineProps<{
    filter: ScoreFilterState
    sort: ScoreSortState
    syncState: ViewSyncState
}>()

const emit = defineEmits<{
    (e: 'update:filter', value: ScoreFilterState): void
    (e: 'update:sort', value: ScoreSortState): void
    (e: 'openAdvanced'): void
    (e: 'openSort'): void
    (e: 'openAnalytics'): void
    (e: 'saveToCard'): void
}>()

const keyword = defineModel<string>('keyword', { default: '' })
const mode = defineModel<MaimaiViewMode>('mode', { required: true })
const tileContent = defineModel<MaimaiTileContent>('tileContent', { required: true })

const advancedCount = computed(() => activeFilterCount(props.filter))

function toggleDirection() {
    emit('update:sort', { ...props.sort, primaryDir: props.sort.primaryDir === 'desc' ? 'asc' : 'desc' })
}
</script>

<template>
    <section class="sticky top-0 z-20 -mx-2 bg-base-100/85 px-2 py-2 backdrop-blur-md sm:-mx-3 sm:px-3 lg:-mx-4 lg:px-4">
        <div class="flex flex-col gap-2 lg:flex-row lg:items-center">
            <!-- 第一行：搜索 -->
            <div class="flex items-center gap-2 lg:w-72 lg:shrink-0">
                <label class="input h-10 min-w-0 flex-1 rounded-xl lg:h-9">
                    <Icon name="mdi:magnify" class="h-5 w-5 shrink-0 text-base-content/45" />
                    <input
                        v-model="keyword"
                        type="search"
                        class="grow"
                        placeholder="曲名 / 别名 / 曲师 / 谱师 / ID"
                        aria-label="搜索谱面"
                        enterkeyhint="search"
                    >
                    <button v-if="keyword" class="btn btn-ghost btn-sm btn-circle -mr-2" type="button" aria-label="清空搜索" @click="keyword = ''">
                        <Icon name="mdi:close" class="h-4 w-4" />
                    </button>
                </label>
            </div>

            <!-- 第二行：工具条 -->
            <div class="relative min-w-0 lg:flex-1">
                <div class="scrollbar-none -mx-2 flex items-center gap-1.5 overflow-x-auto px-2 pr-8 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
                    <ViewMenu
                        v-model:mode="mode"
                        v-model:tile-content="tileContent"
                        :sync-state="syncState"
                        @save-to-card="emit('saveToCard')"
                    />

                    <button
                        class="chip"
                        :class="advancedCount ? 'border-primary/50 bg-primary/10 text-primary' : 'chip-idle'"
                        type="button"
                        @click="emit('openAdvanced')"
                    >
                        <Icon name="mdi:filter-variant" class="h-4 w-4" />
                        筛选
                        <span v-if="advancedCount" class="badge badge-primary badge-xs">{{ advancedCount }}</span>
                    </button>

                    <button class="chip chip-idle rounded-r-none" type="button" @click="emit('openSort')">
                        <Icon name="mdi:sort" class="h-4 w-4" />
                        排序
                        <span v-if="sort.limit" class="badge badge-ghost badge-xs">前 {{ sort.limit }}</span>
                    </button>

                    <button
                        class="chip chip-idle rounded-l-none border-l-0 px-2"
                        type="button"
                        :aria-label="sort.primaryDir === 'desc' ? '当前降序，切换为升序' : '当前升序，切换为降序'"
                        @click="toggleDirection"
                    >
                        <Icon :name="sort.primaryDir === 'desc' ? 'mdi:arrow-down' : 'mdi:arrow-up'" class="h-4 w-4" />
                    </button>

                    <button class="chip chip-idle inline-flex" type="button" @click="emit('openAnalytics')">
                        <Icon name="mdi:chart-box-outline" class="h-4 w-4 text-primary" />
                        统计看板
                    </button>
                </div>
                <!-- 右侧渐隐，提示可横向滑动 -->
                <div class="pointer-events-none absolute inset-y-0 -right-2 w-8 bg-linear-to-l from-base-100/90 to-transparent lg:hidden" aria-hidden="true" />
            </div>
        </div>
    </section>
</template>
