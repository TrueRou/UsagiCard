import type { ChartEntry, ScoreExtend } from './useMaimaiTypes'
import { buildChartEntries } from './useScoreView'
import { useSharedSongSearch } from './useSongSearch.client'
import { fetchScoresVersion, readMaimaiCache, writeMaimaiCache } from './useMaimaiCache.client'

/**
 * 加载歌曲库与卡片全部成绩，合并为谱面列表。
 * 按卡片 UUID 缓存成绩；通过后端版本接口判断缓存是否需要刷新。
 */
export function useScoreLibrary(artifactId: string) {
    const songSearch = useSharedSongSearch()
    const entries = shallowRef<ChartEntry[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    let requestId = 0
    const cacheKey = `maicn:score-library:${artifactId}`


    async function refresh() {
        const currentId = ++requestId
        loading.value = true
        error.value = null
        try {
            const api = useNuxtApp().$leporidae
            const cached = readMaimaiCache<ScoreExtend[]>('scores', artifactId)
            const version = await fetchScoresVersion(artifactId)
            let scores: ScoreExtend[]
            if (cached && cached.version === version) {
                scores = cached.data
            }
            else {
                scores = await api<ScoreExtend[]>('/api/maimai/usagicard/scores', { query: { uuid: artifactId } })
                writeMaimaiCache('scores', version, scores ?? [], artifactId)
            }
            await songSearch.indexSongs()
            if (currentId !== requestId)
                return
            entries.value = buildChartEntries(songSearch.getSongMap().values(), scores ?? [])
        }
        catch (e: any) {
            if (currentId === requestId)
                error.value = e?.message || '成绩加载失败，请稍后重试'
        }
        finally {
            if (currentId === requestId)
                loading.value = false
        }
    }

    function findEntry(key: string) {
        return entries.value.find(entry => entry.key === key)
    }

    return {
        entries,
        loading,
        error,
        refresh,
        findEntry,
        matchSongIds: songSearch.matchSongIds,
    }
}
