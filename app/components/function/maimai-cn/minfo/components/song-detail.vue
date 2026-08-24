<script setup lang="ts">
import type { MaimaiScore, Song, SongDifficulty } from '~/composables/function/MaimaiCN/useMaimaiTypes'
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

    for (const groupKey in props.song.difficulties) {
        if (!result[groupKey])
            result[groupKey] = []

        const difficulties: SongDifficulty[] = (props.song.difficulties as any)[groupKey]
        difficulties.forEach((difficulty: any) => {
            const matchedScore = songScores.value.find((score) => {
                if (score.type === SongType.UTAGE)
                    return score.type === groupKey && score.id === difficulty.diff_id
                return score.type === groupKey && score.level_index === difficulty.level_index
            })

            result[groupKey]?.push({
                difficulty,
                score: matchedScore || null,
            })
        })

        result[groupKey].sort((a, b) =>
            (b.difficulty.level_value || 0) - (a.difficulty.level_value || 0),
        )
    }

    return result
})

const activeGroup = ref<string>('dx')

const groupLabels: Record<string, string> = {
    dx: 'DX',
    standard: 'SD',
    utage: 'UTAGE',
}

const availableGroups = computed(() => {
    return Object.keys(groupedDifficulties.value)
})

watch(availableGroups, (groups) => {
    if (groups.length > 0 && !groups.includes(activeGroup.value) && groups[0])
        activeGroup.value = groups[0]
}, { immediate: true })

watch(() => props.song, async (newSong) => {
    isLoading.value = true
    songScores.value = []

    if (newSong !== null && props.artifactId) {
        const params = new URLSearchParams({
            id: String(newSong.id),
            uuid: props.artifactId,
        })
        const responseData: any = await useNuxtApp().$leporidae(`/api/maimai/usagicard/minfo?${params.toString()}`)
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
    <div v-if="song" class="border border-base-300/70 bg-base-100">
        <div class="border-b border-base-300/70 px-4 py-4 sm:px-5">
            <div class="flex gap-4">
                <div class="h-24 w-24 shrink-0 overflow-hidden border border-base-300 bg-base-200 md:h-28 md:w-28">
                    <img :src="getSongJacketUrl(song.id)" :alt="song.title" class="h-full w-full object-cover" loading="lazy">
                </div>

                <div class="min-w-0 flex-1">
                    <div class="text-xs text-base-content/55">
                        ID {{ song.id }}
                    </div>
                    <h3 class="mt-1 text-xl font-semibold text-base-content line-clamp-2">
                        {{ song.title }}
                    </h3>
                    <p class="mt-1 text-sm text-base-content/65">
                        {{ song.artist }}
                    </p>

                    <div class="mt-3 flex flex-wrap items-center gap-3 text-sm text-base-content/70">
                        <div>
                            <span class="text-base-content/50">BPM</span>
                            <span class="ml-2 font-semibold text-base-content">{{ song.bpm }}</span>
                        </div>
                        <div class="h-4 border-r border-base-300/80" />
                        <div>
                            <span class="text-base-content/50">分类</span>
                            <span class="ml-2 font-medium text-base-content">{{ song.genre }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="aliases.length > 0" class="mt-4 flex flex-wrap gap-2">
                <span
                    v-for="(alias, index) in aliases" :key="index"
                    class="border border-base-300/70 bg-base-50 px-2.5 py-1 text-xs text-base-content/75"
                >
                    {{ alias }}
                </span>
            </div>
        </div>

        <div class="grow">
            <div v-if="isLoading" class="flex h-24 items-center justify-center">
                <span class="loading loading-spinner loading-md text-primary" />
            </div>
            <div v-else-if="Object.keys(groupedDifficulties).length > 0">
                <div class="flex flex-wrap gap-2 border-b border-base-300/70 px-4 py-3 sm:px-5">
                    <button
                        v-for="groupKey in availableGroups" :key="groupKey"
                        class="btn btn-sm border-0"
                        :class="activeGroup === groupKey ? 'btn-primary' : 'btn-ghost bg-base-200/70'"
                        @click="activeGroup = groupKey"
                    >
                        {{ groupLabels[groupKey] }}
                        <span class="ml-1 text-xs opacity-70">
                            {{ groupedDifficulties[groupKey]?.length || 0 }}
                        </span>
                    </button>
                </div>

                <div class="space-y-3 p-4 sm:p-5">
                    <div v-for="(item, index) in groupedDifficulties[activeGroup]" :key="index">
                        <ScoreBlock :difficulty="item.difficulty" :score="item.score" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
