<script setup lang="ts">
import type { MaimaiScore } from '~/composables/function/MaimaiCN/useMaimaiUtils'
import { useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'

const props = defineProps<{
    score: MaimaiScore
}>()

defineEmits<{
    (e: 'click'): void
}>()

const { getAchievementIconSrc, getDifficultyColor, getFCIconSrc, getFSIconSrc, getSongJacketUrl, getSongTypeLabel } = useMaimaiUtils()

const cardBackgroundColor = computed(() => {
    return getDifficultyColor(props.score.level_index)
})

const songJacketUrl = computed(() => {
    return getSongJacketUrl(props.score.id)
})

const achievementIconSrc = computed(() => {
    return getAchievementIconSrc(props.score.achievements)
})

const songTypeLabel = computed(() => {
    return getSongTypeLabel(props.score.type)
})
</script>

<template>
    <div
        class="relative overflow-hidden bg-white dark:bg-gray-800 border-2 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer h-20"
        :style="{ borderColor: cardBackgroundColor }" @click="$emit('click')"
    >
        <!-- 背景图片 -->
        <div class="absolute inset-0 opacity-25 dark:opacity-15">
            <img v-if="songJacketUrl" :src="songJacketUrl" alt="歌曲封面" class="w-full h-full object-cover">
            <div v-show="!songJacketUrl" class="w-full h-full" :style="{ backgroundColor: cardBackgroundColor }" />
        </div>

        <div class="relative p-2 flex items-center h-full">
            <!-- 歌曲封面 -->
            <div
                class="w-14 h-14 shrink-0 rounded-sm border border-gray-300 dark:border-gray-600 overflow-hidden mr-2"
            >
                <img v-if="songJacketUrl" :src="songJacketUrl" alt="歌曲封面" class="w-full h-full object-cover">
                <div v-show="!songJacketUrl" class="w-full h-full" :style="{ backgroundColor: cardBackgroundColor }" />
            </div>

            <!-- 左侧信息 -->
            <div class="flex-1 min-w-0 mr-2">
                <!-- 歌曲名称 -->
                <div class="flex">
                    <div class="text-xs text-white py-0.5 px-0.5 rounded mr-0.5" :class="songTypeLabel.color">
                        {{ songTypeLabel.name }}
                    </div>
                    <div class="flex font-semibold text-sm truncate max-w-full dark:text-white">
                        {{ props.score.title }}
                    </div>
                </div>

                <!-- 达成率和DX评分 -->
                <div class="text-xl">
                    <span class="font-bold dark:text-white">
                        {{ parseInt(String(props.score.achievements)) }}.{{
                            (String(props.score.achievements).split(".")[1] || "0").padEnd(4, "0")
                        }}%
                    </span>
                </div>

                <div class="text-xs">
                    <span class="text-gray-500 dark:text-gray-400">
                        {{ props.score.level_value.toFixed(1) }} -> {{ props.score.dx_rating }} PC: {{
                            props.score.play_count }}
                    </span>
                </div>
            </div>

            <!-- 右侧等级和评级 -->
            <div class="flex items-center justify-center shrink-0">
                <div class="flex-col">
                    <!-- 成绩评级图标 -->
                    <div v-if="achievementIconSrc" class="flex items-center justify-center -mr-1.5">
                        <img :src="achievementIconSrc" alt="评级" class="h-10 w-auto">
                    </div>

                    <!-- FC/FS 图标显示 -->
                    <div class="flex items-center justify-end">
                        <div class="flex items-center w-6 h-6 justify-center">
                            <img
                                v-if="getFCIconSrc(props.score.fc)" :src="getFCIconSrc(props.score.fc)" alt="FC Status"
                                class="h-6 w-6"
                            >
                        </div>
                        <div class="flex items-center w-6 h-6 justify-center">
                            <img
                                v-if="getFSIconSrc(props.score.fs)" :src="getFSIconSrc(props.score.fs)" alt="FS Status"
                                class="h-6 w-6"
                            >
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
