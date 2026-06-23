<script setup lang="ts">
import type { MaimaiScore } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { TileDisplayMode, ViewMode } from '~/composables/function/MaimaiCN/useMaimaiUtils'
import ScoreDetail from './detail-modal.vue'
import ScoreCardView from './view_mode/card.vue'
import ScoreTileView from './view_mode/tile.vue'

const props = defineProps<{
    scores: MaimaiScore[]
    viewMode?: ViewMode
    displayMode?: TileDisplayMode
}>()

const emit = defineEmits<{
    (e: 'toggleDisplayMode', mode: TileDisplayMode): void
}>()

const selectedScore = ref<MaimaiScore | null>(null)
const showScoreDetail = ref(false)

function openScoreDetail(score: MaimaiScore) {
    selectedScore.value = score
    showScoreDetail.value = true
}

function closeScoreDetail() {
    showScoreDetail.value = false
}

const currentViewMode = computed(() => props.viewMode || ViewMode.LIST)

const displayModeOptions = [
    { value: TileDisplayMode.RATING, label: '评价', icon: 'star' },
    { value: TileDisplayMode.ACHIEVEMENT, label: '达成率', icon: 'percentage' },
    { value: TileDisplayMode.FC, label: '连击', icon: 'fire' },
    { value: TileDisplayMode.FS, label: '同步', icon: 'music' },
    { value: TileDisplayMode.DX_RATING, label: 'DX评分', icon: 'chart-bar' },
    { value: TileDisplayMode.LEVEL_VALUE, label: '定数', icon: 'hashtag' },
    { value: TileDisplayMode.PLAY_COUNT, label: '游玩次数', icon: 'gamepad' },
    { value: TileDisplayMode.NONE, label: '无', icon: 'image' },
]
</script>

<template>
    <div class="space-y-3">
        <div v-if="currentViewMode === ViewMode.TILE" class="rounded-3xl border border-base-300/70 bg-base-100/70 p-3 shadow-sm">
            <div class="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-base-content/45">
                平铺模式显示内容
            </div>
            <div class="flex flex-wrap gap-2">
                <button
                    v-for="option in displayModeOptions" :key="option.value"
                    class="btn btn-sm rounded-xl border-0"
                    :class="displayMode === option.value ? 'btn-primary' : 'btn-ghost bg-base-200/80'"
                    @click="emit('toggleDisplayMode', option.value as TileDisplayMode)"
                >
                    {{ option.label }}
                </button>
            </div>
        </div>

        <TransitionGroup
            v-if="currentViewMode === ViewMode.LIST"
            name="score-list"
            tag="div"
            class="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
            <ScoreCardView
                v-for="score in scores" :key="`${score.id}:${score.type}:${score.level_index}`"
                :score="score" @click="openScoreDetail(score)"
            />
        </TransitionGroup>

        <div v-else-if="currentViewMode === ViewMode.TILE">
            <ScoreTileView :scores="scores" :display-mode="displayMode" @click="openScoreDetail" />
        </div>

        <ScoreDetail :score="selectedScore" :show="showScoreDetail" @close="closeScoreDetail" />
    </div>
</template>

<style scoped>
.score-list-enter-active,
.score-list-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.score-list-enter-from,
.score-list-leave-to {
    opacity: 0;
    transform: translateY(8px);
}
</style>
