<script setup lang="ts">
import type { MaimaiScore } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { TileDisplayMode, useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'

const props = defineProps<{
    scores: MaimaiScore[]
    displayMode?: TileDisplayMode
}>()

defineEmits<{
    (e: 'click', score: MaimaiScore): void
}>()

const { getAchievementIconSrc, getDifficultyColor, getFCIconSrc, getFSIconSrc } = useMaimaiUtils()

const currentDisplayMode = computed(() => props.displayMode || TileDisplayMode.RATING)

function getDisplayContent(score: MaimaiScore) {
    switch (currentDisplayMode.value) {
        case TileDisplayMode.NONE:
            return ''
        case TileDisplayMode.RATING:
            return ''
        case TileDisplayMode.ACHIEVEMENT:
            return score.achievements ? `${score.achievements.toFixed(4)}` : '-'
        case TileDisplayMode.FC:
            return ''
        case TileDisplayMode.FS:
            return ''
        case TileDisplayMode.DX_RATING:
            return `${score.dx_rating || 0}`
        case TileDisplayMode.LEVEL_VALUE:
            return `${score.level_value.toFixed(1) || '-'}`
        case TileDisplayMode.PLAY_COUNT:
            return `${score.play_count || 0}`
        default:
            return ''
    }
}

function getDisplayClass(score: MaimaiScore) {
    switch (currentDisplayMode.value) {
        case TileDisplayMode.NONE:
            return ''
        case TileDisplayMode.RATING:
            return ''
        case TileDisplayMode.ACHIEVEMENT:
            return 'bg-blue-600'
        case TileDisplayMode.FC:
            return score.fc ? 'bg-green-600' : 'bg-gray-600'
        case TileDisplayMode.FS:
            return score.fs ? 'bg-indigo-600' : 'bg-gray-600'
        case TileDisplayMode.DX_RATING:
            return 'bg-yellow-600'
        case TileDisplayMode.LEVEL_VALUE:
            return 'bg-purple-600'
        default:
            return 'bg-gray-600'
    }
}
</script>

<template>
    <div class="grid grid-cols-5 gap-2">
        <div
            v-for="score in scores" :key="`${score.id}:${score.type}:${score.level_index}`"
            class="relative group cursor-pointer rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            :style="{ border: `2px solid ${getDifficultyColor(score.level_index)}` }"
            @click="$emit('click', score)"
        >
            <!-- 歌曲封面 -->
            <div class="aspect-square overflow-hidden">
                <img
                    :src="`https://assets2.lxns.net/maimai/jacket/${score.id}.png`" class="w-full h-full object-cover transition-transform group-hover:scale-110"
                    :alt="score.title"
                    loading="lazy"
                >
            </div>

            <div
                v-if="currentDisplayMode !== TileDisplayMode.NONE"
                class="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
                <!-- RATING模式显示评级图标 -->
                <div
                    v-if="currentDisplayMode === TileDisplayMode.RATING && getAchievementIconSrc(score.achievements)"
                    class="text-center w-full px-2"
                >
                    <img
                        :src="getAchievementIconSrc(score.achievements)" alt="Rating"
                        class="h-6 xs:h-7 sm:h-8 md:h-9 lg:h-10 w-auto mx-auto"
                    >
                </div>
                <!-- FC模式显示图标 -->
                <div
                    v-else-if="currentDisplayMode === TileDisplayMode.FC && getFCIconSrc(score.fc)"
                    class="text-center w-full px-2"
                >
                    <img :src="getFCIconSrc(score.fc)" alt="FC Status" class="h-8 md:h-12 lg:h-14 w-auto mx-auto">
                </div>
                <!-- FS模式显示图标 -->
                <div
                    v-else-if="currentDisplayMode === TileDisplayMode.FS && getFSIconSrc(score.fs)"
                    class="text-center w-full px-2"
                >
                    <img :src="getFSIconSrc(score.fs)" alt="FS Status" class="h-8 md:h-12 lg:h-14 w-auto mx-auto">
                </div>
                <!-- 其他模式使用文本显示 -->
                <div
                    v-else-if="currentDisplayMode !== TileDisplayMode.FC && currentDisplayMode !== TileDisplayMode.FS && currentDisplayMode !== TileDisplayMode.RATING"
                    class="text-white text-xs sm:text-sm md:text-base font-bold px-2 py-1 rounded text-center"
                    :class="getDisplayClass(score)"
                >
                    {{ getDisplayContent(score) }}
                </div>
            </div>
        </div>
    </div>
</template>
