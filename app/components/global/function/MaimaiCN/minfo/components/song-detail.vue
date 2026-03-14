<script setup lang="ts">
import type { MaimaiScore, Song, SongDifficulty } from '~/composables/function/MaimaiCN/useMaimaiUtils'
import { SongType, useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'
import ScoreBlock from './score-block.vue'

const props = defineProps<{
    song: Song
    artifactId?: string
}>()

const { getSongJacketUrl } = useMaimaiUtils()

const isLoading = ref(false)
const songScores = ref<MaimaiScore[]>([])

const groupedDifficulties = computed(() => {
    const result: Record<string, { difficulty: SongDifficulty, score: MaimaiScore | null }[]> = {}

    // 遍历song.difficulties中的每个分组
    for (const groupKey in props.song.difficulties) {
        if (!result[groupKey]) {
            result[groupKey] = []
        }

        // 将每个难度添加到对应分组
        const difficulties: SongDifficulty[] = (props.song.difficulties as any)[groupKey]
        difficulties.forEach((difficulty: any) => {
            // 查找该难度是否有对应成绩
            const matchedScore = songScores.value.find((score) => {
                if (score.type === SongType.UTAGE) {
                    return score.type === groupKey && score.id === difficulty.diff_id
                }
                else {
                    return score.type === groupKey && score.level_index === difficulty.level_index
                }
            })

            result[groupKey]?.push({
                difficulty,
                score: matchedScore || null,
            })
        })

        // 按难度排序（降序）
        result[groupKey].sort((a, b) =>
            (b.difficulty.level_value || 0) - (a.difficulty.level_value || 0),
        )
    }

    return result
})

// 添加当前活动分组状态
const activeGroup = ref<string>('dx')

// 分组类型的显示名称映射
const groupLabels: Record<string, string> = {
    dx: 'DX',
    standard: 'SD',
    utage: 'UTAGE',
}

// 获取非空分组的键列表
const availableGroups = computed(() => {
    return Object.keys(groupedDifficulties.value)
})

// 初始化活动分组为第一个有数据的分组
watch(availableGroups, (groups) => {
    if (groups.length > 0 && !groups.includes(activeGroup.value) && groups[0]) {
        activeGroup.value = groups[0]
    }
}, { immediate: true })

// 监听选中的歌曲变化，调用API获取该歌曲的所有成绩
watch(() => props.song, async (newSong) => {
    isLoading.value = true
    songScores.value = []

    if (newSong !== null && props.artifactId) {
        const params = new URLSearchParams({
            id: String(newSong.id),
            uuid: props.artifactId,
        })
        const responseData: any = await useNuxtApp().$leporid(`/api/otoge/maimai/usagicard/minfo?${params.toString()}`)
        songScores.value = responseData.scores
    }
    isLoading.value = false
}, { immediate: true })

const aliases = computed(() => {
    if (!props.song || !props.song.aliases)
        return []
    return props.song.aliases.filter((alias: string) => alias.trim() !== '')
})
</script>

<template>
    <div v-if="song" class="song-detail bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <!-- 歌曲基本信息头部区域 -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex">
                <!-- 左侧封面 -->
                <div class="w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 shadow-md">
                    <img :src="getSongJacketUrl(song.id)" :alt="song.title" class="w-full h-full object-cover">
                </div>

                <!-- 右侧信息 -->
                <div class="ml-4 flex flex-col justify-between grow">
                    <!-- 歌曲ID和标题 -->
                    <div>
                        <div class="flex items-center text-gray-500 text-xs mb-1">
                            ID {{ song.id }}
                        </div>
                        <h3 class="text-xl font-bold dark:text-white line-clamp-2">
                            {{ song.title }}
                        </h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            {{ song.artist }}
                        </p>
                    </div>

                    <!-- 歌曲元数据 -->
                    <div class="flex flex-wrap items-center gap-2 mt-2">
                        <div class="flex items-center">
                            <span class="text-gray-600 dark:text-gray-400 text-sm mr-2">BPM</span>
                            <span class="font-bold text-gray-800 dark:text-gray-200">{{ song.bpm }}</span>
                        </div>

                        <div class="h-4 border-r border-gray-300 dark:border-gray-600" />

                        <div class="flex items-center">
                            <span class="text-gray-600 dark:text-gray-400 text-sm mr-2">分类</span>
                            <span
                                class="px-2 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded-full"
                            >
                                {{ song.genre }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 别名标签 -->
            <div v-if="aliases.length > 0" class="mt-3 flex flex-wrap gap-1">
                <div
                    v-for="(alias, index) in aliases" :key="index"
                    class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs rounded-full"
                >
                    {{ alias }}
                </div>
            </div>
        </div>

        <!-- 成绩列表 -->
        <div class="grow">
            <div v-if="isLoading" class="flex items-center justify-center h-24">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400" />
            </div>
            <div v-else-if="Object.keys(groupedDifficulties).length > 0">
                <!-- 分组选项卡 -->
                <div class="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        v-for="groupKey in availableGroups" :key="groupKey" class="py-2 px-4 font-medium text-sm focus:outline-none transition-colors duration-200"
                        :class="[
                            activeGroup === groupKey
                                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
                        ]" @click="activeGroup = groupKey"
                    >
                        {{ groupLabels[groupKey] }}
                        <span class="ml-1 text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                            {{ groupedDifficulties[groupKey]?.length || 0 }}
                        </span>
                    </button>
                </div>

                <div class="p-4">
                    <div v-for="(item, index) in groupedDifficulties[activeGroup]" :key="index" class="mb-4">
                        <ScoreBlock :difficulty="item.difficulty" :score="item.score" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.song-detail {
    transition: all 0.3s ease;
}
</style>
