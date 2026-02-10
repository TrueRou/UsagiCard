<script setup lang="ts">
import type { MaimaiScore, SongDifficulty, SongDifficultyUtage } from '~/composables/function/MaimaiCN/useMaimaiUtils'
import { SongType, useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'

const props = defineProps<{
    difficulty: SongDifficulty
    score: MaimaiScore | null
}>()

const { getAchievementIconSrc, getDifficultyColor, getFCIconSrc, getFSIconSrc, formatAchievement } = useMaimaiUtils()

const difficultyColor = computed(() => {
    return getDifficultyColor(props.difficulty.level_index, props.difficulty.type)
})

const bgColorWithOpacity = computed(() => {
    return `${difficultyColor.value}80`
})
</script>

<template>
    <div class="score-block rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex flex-col" :style="{ backgroundColor: bgColorWithOpacity }">
            <!-- 难度和等级信息 -->
            <div class="p-3 flex items-center justify-between">
                <div class="flex items-center">
                    <div class="w-4 h-4 rounded-full mr-2" :style="{ backgroundColor: difficultyColor }" />
                    <div v-if="difficulty.level_value" class="text-gray-800 text-lg font-bold mr-2">
                        {{ difficulty.level_value }}
                    </div>
                    <span class="text-gray-800">
                        {{
                            difficulty.type === SongType.UTAGE
                                ? `[${(difficulty as SongDifficultyUtage).kanji}]`
                                : ['BASIC', 'ADVANCED', 'EXPERT', 'MASTER', 'Re:MASTER'][difficulty.level_index]
                        }}
                    </span>
                </div>
                <div v-if="props.score" class="flex items-center justify-end">
                    <div class="flex items-center w-8 h-8 justify-center">
                        <img
                            v-if="getFCIconSrc(props.score.fc)" :src="getFCIconSrc(props.score.fc)" alt="FC Status"
                            class="h-8 w-8"
                        >
                    </div>
                    <div class="flex items-center w-8 h-8 justify-center">
                        <img
                            v-if="getFSIconSrc(props.score.fs)" :src="getFSIconSrc(props.score.fs)" alt="FS Status"
                            class="h-8 w-8"
                        >
                    </div>
                </div>
            </div>

            <!-- 成绩详细信息 -->
            <div class="bg-gray-50 dark:bg-gray-800 p-3">
                <div v-if="props.score" class="flex flex-row items-center gap-3">
                    <!-- 达成率区域 -->
                    <div class="grow">
                        <div class="flex items-center">
                            <div class="mr-2">
                                <img
                                    v-if="getAchievementIconSrc(props.score.achievements)"
                                    :src="getAchievementIconSrc(props.score.achievements)" alt="Rating"
                                    class="h-8 w-auto"
                                >
                            </div>
                            <div class="font-bold text-xl dark:text-white">
                                {{ formatAchievement(props.score.achievements) }}
                            </div>
                        </div>
                    </div>

                    <!-- 游玩信息区域 -->
                    <div class="flex flex-col items-start">
                        <div class="mt-1 flex items-center">
                            <span class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                                <span class="text-blue-600 dark:text-blue-400 font-medium">
                                    PC: {{ score?.play_count || '-' }}
                                </span>
                            </span>
                        </div>
                    </div>

                    <!-- 分隔线 -->
                    <div class="block h-12 border-l border-gray-300 dark:border-gray-600" />

                    <!-- DX Rating 区域 -->
                    <div class="flex flex-col items-start">
                        <span class="text-gray-500 dark:text-gray-400 text-xs">DX Rating</span>
                        <span class="font-bold text-lg dark:text-white">{{ score?.dx_rating || '-' }}</span>
                    </div>
                </div>
                <div v-else class="flex items-center justify-center h-12 text-gray-500 dark:text-gray-400">
                    <span>暂无成绩</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.score-block {
    transition: all 0.2s ease;
}

.score-block:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
