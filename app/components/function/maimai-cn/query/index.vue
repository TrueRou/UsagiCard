<script setup lang="ts">
import type { MaimaiBests, PlateObject, ScoreExtend, Song } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'
import { useQueryCommand } from '~/composables/function/MaimaiCN/useQueryCommand.client'
import CommandBar from './components/command-bar.vue'
import ResultBests from './components/result-bests.vue'
import ResultPlate from './components/result-plate.vue'
import ResultScores from './components/result-scores.vue'
import ResultSong from './components/result-song.vue'

const props = defineProps<{
    artifactId: string
}>()

const { state, initSearch, updateDraft, selectSong, applyScoreFilterToken, resetScoreFilter, setPlateAttr } = useQueryCommand(props.artifactId)
const { getSongJacketUrl, handleImageError } = useMaimaiUtils()

const displaySongs = computed(() => {
    if (state.type === 'song-select' && Array.isArray(state.data))
        return state.data as Song[]
    return state.previewResults
})

onMounted(() => {
    initSearch()
})

function handleSelectSong(song: Song) {
    selectSong(song)
}
</script>

<template>
    <div class="max-w-5xl mx-auto p-2 space-y-4">
        <CommandBar
            :model-value="state.draft"
            :hint="state.hint"
            :preview-count="state.previewResults.length"
            :score-filter="state.scoreFilter"
            @update:model-value="updateDraft"
            @apply-score-filter="applyScoreFilterToken($event.key, $event.value)"
            @reset-score-filter="resetScoreFilter()"
        />

        <!-- Loading -->
        <div v-if="state.loading" class="flex items-center justify-center border border-base-300/70 bg-base-100/80 py-14">
            <span class="loading loading-spinner loading-md" />
            <span class="ml-2 text-base-content/60">查询中...</span>
        </div>

        <!-- Error -->
        <div v-else-if="state.error" class="border border-error/20 bg-error/10 p-4 text-sm text-error">
            {{ state.error }}
        </div>

        <!-- Results -->
        <Transition name="content-fade" mode="out-in">
            <div :key="`${state.type}:${state.meta.queryLabel || ''}:${state.meta.plateName || ''}:${state.plateAttr}:${state.draft}`" class="min-h-48">
                <!-- B50 -->
                <ResultBests v-if="state.type === 'bests' && state.data" :bests="(state.data as MaimaiBests)" />

                <!-- Plate -->
                <ResultPlate
                    v-else-if="state.type === 'plate' && state.data"
                    :plates="(state.data as PlateObject[])"
                    :plate-name="state.meta.plateName || ''"
                    :plate-attr="state.plateAttr"
                    @update:plate-attr="setPlateAttr"
                />

                <!-- Scores -->
                <ResultScores
                    v-else-if="state.type === 'scores' && state.data"
                    :scores="(state.data as ScoreExtend[])"
                    :query-label="state.meta.queryLabel || ''"
                />

                <!-- Song -->
                <ResultSong
                    v-else-if="state.type === 'song' && state.data"
                    :song="(state.data as Song)"
                    :artifact-id="artifactId"
                />

                <!-- Song disambiguation -->
                <div v-else-if="state.type === 'song-select' && state.data" class="border border-base-300/70 bg-base-100/80 p-4">
                    <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h3 class="text-lg font-semibold text-base-content">
                                找到多个匹配结果
                            </h3>
                            <p class="text-sm text-base-content/60">
                                继续输入可缩小范围，或直接点击任意歌曲进入详情。
                            </p>
                        </div>
                        <div class="badge badge-outline">
                            共 {{ displaySongs.length }} 首
                        </div>
                    </div>
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                            v-for="song in displaySongs" :key="song.id"
                            class="group flex items-center gap-3 border border-base-300 bg-base-100 px-3 py-3 text-left transition-colors duration-200 hover:border-primary/30 hover:bg-base-50"
                            @click="handleSelectSong(song)"
                        >
                            <div class="relative h-16 w-16 shrink-0 overflow-hidden border border-base-300">
                                <img
                                    :src="getSongJacketUrl(song.id)" :alt="song.title"
                                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" @error="handleImageError"
                                >
                            </div>
                            <div class="min-w-0 flex-1">
                                <div class="flex flex-wrap items-center gap-2">
                                    <span class="badge badge-ghost badge-sm">ID {{ song.id }}</span>
                                    <span class="badge badge-outline badge-sm text-xs">{{ song.artist }}</span>
                                </div>
                                <div class="mt-1 truncate text-sm font-semibold text-base-content">
                                    {{ song.title }}
                                </div>
                                <div class="mt-1 text-xs text-base-content/55">
                                    点击查看这首歌的详细信息与成绩分布
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Typing -->
                <div v-else-if="state.type === 'typing'" class="border border-dashed border-base-300 bg-base-100/60 px-4 py-12 text-center">
                    <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center bg-primary/10 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" />
                        </svg>
                    </div>
                    <h3 class="text-base font-semibold text-base-content">
                        正在识别查询内容
                    </h3>
                    <p class="mt-2 text-sm text-base-content/60">
                        会根据当前输入自动切换到歌曲、B50、牌子或成绩筛选结果。
                    </p>
                </div>

                <!-- Idle -->
                <div v-else class="border border-dashed border-base-300 bg-base-100/60 px-4 py-14 text-center">
                    <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center bg-base-200 text-base-content/50">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <p class="text-base font-medium text-base-content/75">
                        输入命令或筛选条件
                    </p>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.content-fade-enter-active,
.content-fade-leave-active {
    transition: opacity 0.18s ease, transform 0.18s ease;
}

.content-fade-enter-from,
.content-fade-leave-to {
    opacity: 0;
    transform: translateY(8px);
}
</style>
