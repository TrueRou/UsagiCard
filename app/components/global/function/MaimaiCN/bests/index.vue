<script setup lang="ts">
import { useMaimaiScores } from '~/composables/function/MaimaiCN/useMaimaiScores'
import { TileDisplayMode, ViewMode } from '~/composables/function/MaimaiCN/useMaimaiUtils'
import ScoreList from './components/score-list.vue'

const props = defineProps<{
    artifact: ArtifactUserResponse
}>()

const { bests } = await useMaimaiScores(props.artifact)

const currentViewMode = ref<ViewMode>(ViewMode.LIST)
const tileDisplayMode = ref<TileDisplayMode>(TileDisplayMode.RATING)

function toggleViewMode(mode: ViewMode) {
    currentViewMode.value = mode
}

function toggleTileDisplayMode(mode: TileDisplayMode) {
    tileDisplayMode.value = mode
}

const stats = computed(() => {
    const data = []

    const total = bests.value.rating_b35 + bests.value.rating_b15
    data.push({
        label: 'BEST 35',
        count: bests.value.rating_b35,
        part: Math.round(bests.value.rating_b35 / total * 100),
        color: '#228be6',
    })

    data.push({
        label: 'BEST 15',
        count: bests.value.rating_b15,
        part: Math.round(bests.value.rating_b15 / total * 100),
        color: '#fd7e14',
    })

    return data
})
</script>

<template>
    <div>
        <!-- 评级统计区段 -->
        <div class="bg-white dark:bg-gray-800 mt-4 mb-6 rounded-md">
            <div class="flex justify-between items-center mb-4">
                <div>
                    <h3 class="text-xl font-bold mb-1 dark:text-white">
                        {{ Math.floor(bests.rating * 100) / 100
                        }}
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        DX Rating 总和
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
                <div
                    v-for="(stat, index) in stats" :key="index" class="border-b-2 pb-2"
                    :style="{ borderBottomColor: stat.color }"
                >
                    <div class="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">
                        {{ stat.label }}
                    </div>

                    <div class="flex justify-between items-end">
                        <div class="font-bold dark:text-white">
                            {{ stat.count }}
                        </div>
                        <div class="text-sm font-bold" :style="{ color: stat.color }">
                            {{ stat.part }}%
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- B35成绩展示 -->
        <div v-if="'scores_b35' in bests && bests.scores_b35.length" class="mb-6">
            <div class="flex justify-between items-center mb-3">
                <div>
                    <h3 class="text-xl font-bold mb-1 dark:text-white">
                        Best 35
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        旧版本最佳曲目
                    </p>
                </div>
                <div class="flex space-x-2">
                    <button
                        class="p-2 rounded" :class="[currentViewMode === ViewMode.LIST ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300']"
                        @click="toggleViewMode(ViewMode.LIST)"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                    <button
                        class="p-2 rounded" :class="[currentViewMode === ViewMode.TILE ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300']"
                        @click="toggleViewMode(ViewMode.TILE)"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
            <ScoreList
                :scores="bests.scores_b35" :view-mode="currentViewMode" :display-mode="tileDisplayMode"
                @toggle-display-mode="toggleTileDisplayMode"
            />
        </div>

        <!-- B15成绩展示 -->
        <div v-if="'scores_b15' in bests && bests.scores_b15.length" class="mb-6">
            <div class="flex justify-between items-center mb-3">
                <div>
                    <h3 class="text-xl font-bold mb-1 dark:text-white">
                        Best 15
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        现版本最佳曲目
                    </p>
                </div>
                <div class="flex space-x-2">
                    <button
                        class="p-2 rounded" :class="[currentViewMode === ViewMode.LIST ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300']"
                        @click="toggleViewMode(ViewMode.LIST)"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                    <button
                        class="p-2 rounded" :class="[currentViewMode === ViewMode.TILE ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300']"
                        @click="toggleViewMode(ViewMode.TILE)"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
            <ScoreList
                :scores="bests.scores_b15" :view-mode="currentViewMode" :display-mode="tileDisplayMode"
                @toggle-display-mode="toggleTileDisplayMode"
            />
        </div>
    </div>
</template>
