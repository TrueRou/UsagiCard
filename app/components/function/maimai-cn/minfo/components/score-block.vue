<script setup lang="ts">
import type { MaimaiScore, SongDifficulty, SongDifficultyUtage } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { SongType, useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'

const props = defineProps<{
    difficulty: SongDifficulty
    score: MaimaiScore | null
}>()

const { getAchievementIconSrc, getDifficultyColor, getFCIconSrc, getFSIconSrc, formatAchievement } = useMaimaiUtils()

const difficultyColor = computed(() => getDifficultyColor(props.difficulty.level_index, props.difficulty.type))

const difficultyLabel = computed(() => {
    if (props.difficulty.type === SongType.UTAGE)
        return `[${(props.difficulty as SongDifficultyUtage).kanji}]`
    return ['BASIC', 'ADVANCED', 'EXPERT', 'MASTER', 'Re:MASTER'][props.difficulty.level_index]
})
</script>

<template>
    <div class="border border-base-300/70 bg-base-100">
        <div class="flex items-center justify-between border-b border-base-300/70 px-4 py-3" :style="{ borderLeft: `3px solid ${difficultyColor}` }">
            <div class="flex min-w-0 items-center gap-3">
                <div class="h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: difficultyColor }" />
                <div class="min-w-0">
                    <div class="text-sm font-semibold text-base-content">
                        {{ difficultyLabel }}
                    </div>
                    <div class="text-xs text-base-content/55">
                        定数 {{ difficulty.level_value || '-' }}
                    </div>
                </div>
            </div>
            <div v-if="props.score" class="flex items-center gap-1">
                <div class="flex h-8 w-8 items-center justify-center">
                    <img
                        v-if="getFCIconSrc(props.score.fc)" :src="getFCIconSrc(props.score.fc)" alt="FC Status"
                        class="h-7 w-7"
                    >
                </div>
                <div class="flex h-8 w-8 items-center justify-center">
                    <img
                        v-if="getFSIconSrc(props.score.fs)" :src="getFSIconSrc(props.score.fs)" alt="FS Status"
                        class="h-7 w-7"
                    >
                </div>
            </div>
        </div>

        <div class="px-4 py-3">
            <div v-if="props.score" class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                    <div v-if="getAchievementIconSrc(props.score.achievements)" class="shrink-0">
                        <img
                            :src="getAchievementIconSrc(props.score.achievements)" alt="Rating"
                            class="h-8 w-auto"
                        >
                    </div>
                    <div>
                        <div class="text-xs text-base-content/50">
                            达成率
                        </div>
                        <div class="text-xl font-bold text-base-content">
                            {{ formatAchievement(props.score.achievements) }}
                        </div>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-2 text-sm text-base-content/65">
                    <span class="border border-base-300/70 bg-base-50 px-2 py-1">PC {{ score?.play_count || '-' }}</span>
                    <span class="border border-base-300/70 bg-base-50 px-2 py-1">DX Rating {{ score?.dx_rating || '-' }}</span>
                </div>
            </div>
            <div v-else class="text-sm text-base-content/55">
                暂无成绩
            </div>
        </div>
    </div>
</template>
