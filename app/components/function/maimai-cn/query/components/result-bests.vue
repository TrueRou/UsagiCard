<script setup lang="ts">
import type { MaimaiBests } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { TileDisplayMode, ViewMode } from '~/composables/function/MaimaiCN/useMaimaiUtils'
import ScoreList from '../../bests/components/score-list.vue'

defineProps<{
    bests: MaimaiBests
}>()

const currentViewMode = ref<ViewMode>(ViewMode.LIST)
const tileDisplayMode = ref<TileDisplayMode>(TileDisplayMode.RATING)
</script>

<template>
    <div>
        <!-- Rating 汇总 -->
        <div class="mb-4 rounded-lg">
            <div class="text-2xl font-bold">
                {{ Math.floor(bests.rating * 100) / 100 }}
            </div>
            <div class="text-sm text-base-content/60">
                DX Rating
            </div>
            <div class="flex gap-4 mt-2 text-sm">
                <span>B35: <span class="font-bold text-blue-500">{{ bests.rating_b35 }}</span></span>
                <span>B15: <span class="font-bold text-orange-500">{{ bests.rating_b15 }}</span></span>
            </div>
        </div>

        <!-- B35 -->
        <div v-if="bests.scores_b35.length" class="mb-6">
            <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-bold">
                    Best 35
                </h3>
                <div class="flex gap-1">
                    <button
                        class="btn btn-sm" :class="currentViewMode === ViewMode.LIST ? 'btn-primary' : 'btn-ghost'"
                        @click="currentViewMode = ViewMode.LIST"
                    >
                        列表
                    </button>
                    <button
                        class="btn btn-sm" :class="currentViewMode === ViewMode.TILE ? 'btn-primary' : 'btn-ghost'"
                        @click="currentViewMode = ViewMode.TILE"
                    >
                        平铺
                    </button>
                </div>
            </div>
            <ScoreList
                :scores="bests.scores_b35" :view-mode="currentViewMode" :display-mode="tileDisplayMode"
                @toggle-display-mode="tileDisplayMode = $event"
            />
        </div>

        <!-- B15 -->
        <div v-if="bests.scores_b15.length" class="mb-6">
            <h3 class="text-lg font-bold mb-3">
                Best 15
            </h3>
            <ScoreList
                :scores="bests.scores_b15" :view-mode="currentViewMode" :display-mode="tileDisplayMode"
                @toggle-display-mode="tileDisplayMode = $event"
            />
        </div>
    </div>
</template>
