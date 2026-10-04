import type { ChartEntry, ScoreExtend } from './useMaimaiTypes'
import { buildChartEntries } from './useScoreView'
import { useSharedSongSearch } from './useSongSearch.client'

/**
 * 加载歌曲库与卡片全部成绩，合并为谱面列表。
 * 每次调用 refresh 都会重新拉取成绩，保证快速更新后的数据是最新的。
 */
export function useScoreLibrary(artifactId: string) {
    const songSearch = useSharedSongSearch()
    const entries = shallowRef<ChartEntry[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    let requestId = 0

    async function refresh() {
        const currentId = ++requestId
        loading.value = true
        error.value = null
        try {
            const [, scores] = await Promise.all([
                songSearch.indexSongs(),
                useNuxtApp().$leporidae<ScoreExtend[]>('/api/maimai/usagicard/scores', { query: { uuid: artifactId } }),
            ])
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
