<script setup lang="ts">
import type { PlateAttr, PlateObject } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { LevelIndex, useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'

const props = defineProps<{
    plates: PlateObject[]
    plateName: string
    plateAttr: PlateAttr
}>()

const emit = defineEmits<{
    (e: 'update:plateAttr', attr: PlateAttr): void
}>()

const { getDifficultyColor, getSongJacketUrl, formatAchievement, handleImageError } = useMaimaiUtils()

const plateAttrOptions: { label: string, value: PlateAttr }[] = [
    { label: '未完成', value: 'remained' },
    { label: '已完成', value: 'cleared' },
    { label: '已游玩', value: 'played' },
    { label: '全部', value: 'all' },
]

const difficultyNames: Record<number, string> = {
    [LevelIndex.BASIC]: 'BASIC',
    [LevelIndex.ADVANCED]: 'ADVANCED',
    [LevelIndex.EXPERT]: 'EXPERT',
    [LevelIndex.MASTER]: 'MASTER',
    [LevelIndex.ReMASTER]: 'Re:MASTER',
}

const summary = computed(() => {
    const counts: Record<number, number> = {}
    for (const plate of props.plates) {
        for (const level of plate.levels) {
            counts[level] = (counts[level] || 0) + 1
        }
    }
    return Object.entries(counts)
        .map(([idx, count]) => ({
            index: Number(idx),
            name: difficultyNames[Number(idx)] || `Lv${idx}`,
            color: getDifficultyColor(Number(idx)),
            count,
        }))
        .sort((a, b) => a.index - b.index)
})

function getBestScore(plate: PlateObject, levelIndex: LevelIndex) {
    return plate.scores.find(s => s.level_index === levelIndex)
}
</script>

<template>
    <section class="space-y-4">
        <div class="border border-base-300/70 bg-base-100/80 p-4">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                        牌子进度查询
                    </p>
                    <h3 class="mt-1 text-xl font-semibold text-base-content">
                        {{ plateName }} 进度
                    </h3>
                    <p class="mt-1 text-sm text-base-content/60">
                        切换筛选方式查看不同状态的曲目。
                    </p>
                </div>
                <div class="border border-base-300/70 bg-base-50 px-4 py-3 text-sm">
                    <div class="text-xs text-base-content/50">
                        曲目数
                    </div>
                    <div class="text-2xl font-semibold text-base-content">
                        {{ plates.length }}
                    </div>
                </div>
            </div>

            <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div class="flex flex-wrap gap-2">
                    <div
                        v-for="s in summary" :key="s.index"
                        class="px-3 py-2 text-sm font-medium text-white"
                        :style="{ backgroundColor: s.color }"
                    >
                        {{ s.name }} · {{ s.count }}
                    </div>
                </div>
                <div class="flex gap-1">
                    <button
                        v-for="option in plateAttrOptions" :key="option.value"
                        class="border px-2.5 py-1.5 text-xs"
                        :class="plateAttr === option.value ? 'border-primary bg-primary/8 text-primary' : 'border-base-300 bg-base-100 text-base-content'"
                        type="button"
                        @click="emit('update:plateAttr', option.value)"
                    >
                        {{ option.label }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="plates.length === 0" class="border border-base-300/70 bg-base-100/60 px-4 py-12 text-center">
            <p class="text-sm text-base-content/60">
                {{ plateAttr === 'remained' ? '已全部完成，恭喜！' : '没有符合条件的曲目' }}
            </p>
        </div>

        <div v-else class="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <article
                v-for="plate in plates" :key="plate.song.id"
                class="group relative overflow-hidden border border-base-300/70 bg-base-100 transition-colors duration-200 hover:border-primary/20"
            >
                <div class="absolute inset-0 opacity-8 transition-opacity duration-300 group-hover:opacity-14">
                    <img
                        :src="getSongJacketUrl(plate.song.id)"
                        :alt="plate.song.title"
                        class="h-full w-full object-cover"
                        loading="lazy"
                        @error="handleImageError"
                    >
                </div>

                <div class="relative flex gap-4 p-4">
                    <div class="h-16 w-16 shrink-0 overflow-hidden border border-base-300 bg-base-200">
                        <img
                            :src="getSongJacketUrl(plate.song.id)" :alt="plate.song.title"
                            class="h-full w-full object-cover" loading="lazy" @error="handleImageError"
                        >
                    </div>

                    <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="badge badge-ghost badge-sm">ID {{ plate.song.id }}</span>
                            <span class="badge badge-outline badge-sm">{{ plate.levels.length }} 个难度</span>
                        </div>
                        <div class="mt-2 truncate text-base font-semibold text-base-content">
                            {{ plate.song.title }}
                        </div>
                        <div class="truncate text-sm text-base-content/55">
                            {{ plate.song.artist }}
                        </div>

                        <div class="mt-3 space-y-2">
                            <div
                                v-for="levelIdx in plate.levels" :key="levelIdx"
                                class="flex items-start justify-between gap-3 border border-base-300/70 bg-base-50 px-3 py-2"
                            >
                                <div class="flex min-w-0 items-center gap-2">
                                    <span
                                        class="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                                        :style="{ backgroundColor: getDifficultyColor(levelIdx) }"
                                    />
                                    <span class="text-sm font-medium text-base-content">
                                        {{ difficultyNames[levelIdx] }}
                                    </span>
                                </div>
                                <div class="text-right text-xs text-base-content/60">
                                    <template v-if="getBestScore(plate, levelIdx)">
                                        当前最佳 {{ formatAchievement(getBestScore(plate, levelIdx)!.achievements) }}
                                    </template>
                                    <template v-else>
                                        未游玩
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    </section>
</template>
