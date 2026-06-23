<script setup lang="ts">
import type { MaimaiScore } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'

const props = defineProps<{
    score: MaimaiScore | null
    show: boolean
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

const { formatAchievement, getAchievementIconSrc, getDifficultyColor, getFCIconSrc, getFCText, getFSIconSrc, getFSText, getSongJacketUrl, getSongTypeLabel } = useMaimaiUtils()

const accentColor = computed(() => {
    if (!props.score)
        return undefined
    return getDifficultyColor(props.score.level_index, props.score.type)
})
</script>

<template>
    <Teleport to="body">
        <div
            v-if="show && score"
            class="fixed inset-0 z-1000 flex items-center justify-center bg-black/55 p-4"
            @click.self="emit('close')"
        >
            <div class="max-h-[90vh] w-full max-w-2xl overflow-auto border border-base-300 bg-base-100">
                <div class="border-b border-base-300/70 bg-base-100 px-4 py-4 sm:px-5" :style="accentColor ? { borderTop: `3px solid ${accentColor}` } : undefined">
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex min-w-0 gap-4">
                            <div class="h-20 w-20 shrink-0 overflow-hidden border border-base-300 bg-base-200 sm:h-24 sm:w-24">
                                <img
                                    :src="getSongJacketUrl(score.id)"
                                    class="h-full w-full object-cover"
                                    alt="歌曲封面"
                                    loading="lazy"
                                >
                            </div>
                            <div class="min-w-0 flex-1">
                                <div class="flex flex-wrap items-center gap-2 text-xs text-base-content/55">
                                    <span>ID {{ score.id }}</span>
                                    <span>·</span>
                                    <span>{{ getSongTypeLabel(score.type).name }}</span>
                                    <span>·</span>
                                    <span>{{ score.level }}</span>
                                </div>
                                <h3 class="mt-1 text-lg font-semibold text-base-content sm:text-xl">
                                    {{ score.title }}
                                </h3>
                                <div class="mt-3 flex flex-wrap items-center gap-2">
                                    <span class="badge badge-sm border-0 text-white" :style="accentColor ? { backgroundColor: accentColor } : undefined">
                                        {{ score.level }}
                                    </span>
                                    <span class="badge badge-outline badge-sm">定数 {{ score.level_value.toFixed(1) }}</span>
                                    <span class="badge badge-outline badge-sm">DX Rating {{ score.dx_rating || '-' }}</span>
                                    <span class="badge badge-outline badge-sm">游玩 {{ score.play_count || 0 }} 次</span>
                                </div>
                            </div>
                        </div>
                        <button class="btn btn-ghost btn-sm btn-circle shrink-0" aria-label="关闭成绩详情" @click="emit('close')">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fill-rule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="space-y-4 p-4 sm:p-5">
                    <section class="border border-base-300/70 bg-base-50 p-4">
                        <div class="text-xs font-medium uppercase tracking-[0.2em] text-base-content/45">
                            达成情况
                        </div>
                        <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div class="text-sm text-base-content/55">
                                    达成率
                                </div>
                                <div class="text-3xl font-bold tracking-tight text-base-content">
                                    {{ formatAchievement(score.achievements) }}
                                </div>
                            </div>
                            <div v-if="getAchievementIconSrc(score.achievements)" class="border border-base-300/70 bg-base-100 px-3 py-2">
                                <img :src="getAchievementIconSrc(score.achievements)" alt="评级" class="h-10 w-auto">
                            </div>
                        </div>
                    </section>

                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <section class="border border-base-300/70 bg-base-50 p-4">
                            <div class="text-xs font-medium uppercase tracking-[0.2em] text-base-content/45">
                                连击评价
                            </div>
                            <div class="mt-3 flex items-center gap-3">
                                <div class="flex h-8 w-8 items-center justify-center">
                                    <img v-if="getFCIconSrc(score.fc)" :src="getFCIconSrc(score.fc)" alt="FC 状态" class="h-7 w-7">
                                </div>
                                <span class="text-base font-semibold text-base-content">{{ getFCText(score.fc) }}</span>
                            </div>
                        </section>

                        <section class="border border-base-300/70 bg-base-50 p-4">
                            <div class="text-xs font-medium uppercase tracking-[0.2em] text-base-content/45">
                                同步评价
                            </div>
                            <div class="mt-3 flex items-center gap-3">
                                <div class="flex h-8 w-8 items-center justify-center">
                                    <img v-if="getFSIconSrc(score.fs)" :src="getFSIconSrc(score.fs)" alt="FS 状态" class="h-7 w-7">
                                </div>
                                <span class="text-base font-semibold text-base-content">{{ getFSText(score.fs) }}</span>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>
