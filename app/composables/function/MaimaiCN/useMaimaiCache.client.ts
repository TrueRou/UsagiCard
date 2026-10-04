import type { MaimaiBests, ScoreExtend, Song } from './useMaimaiTypes'

export type MaimaiCacheKind = 'scores' | 'bests' | 'songs'

interface CacheEntry<T> {
    version: number
    data: T
}

const prefix = 'maicn:cache:v2:'

function key(kind: MaimaiCacheKind, artifactId?: string) {
    return `${prefix}${kind}:${artifactId || 'global'}`
}

export function readMaimaiCache<T>(kind: MaimaiCacheKind, artifactId?: string): CacheEntry<T> | null {
    try {
        const raw = localStorage.getItem(key(kind, artifactId))
        if (!raw) return null
        const value = JSON.parse(raw) as CacheEntry<T>
        return typeof value.version === 'number' && value.data !== undefined ? value : null
    } catch {
        localStorage.removeItem(key(kind, artifactId))
        return null
    }
}

export function writeMaimaiCache<T>(kind: MaimaiCacheKind, version: number, data: T, artifactId?: string) {
    try {
        localStorage.setItem(key(kind, artifactId), JSON.stringify({ version, data }))
    } catch {
        // 缓存失败不影响正常请求。
    }
}

export function removeLegacyMaimaiCaches() {
    for (const cacheKey of ['maimaiSongs', 'maimaiIndexingTime', 'maimaiIndexingVersion', 'lastIndexingTime'])
        localStorage.removeItem(cacheKey)
}

export type CachedScores = CacheEntry<ScoreExtend[]>
export type CachedBests = CacheEntry<MaimaiBests>
export type CachedSongs = CacheEntry<Song[]>

const pendingScoresVersions = new Map<string, Promise<number>>()

/** 获取卡片成绩版本；同一卡片并发调用时共用一次请求。 */
export function fetchScoresVersion(artifactId: string): Promise<number> {
    let pending = pendingScoresVersions.get(artifactId)
    if (!pending) {
        const api = useNuxtApp().$leporidae
        pending = api<{ version: number }>('/api/maimai/usagicard/scores/version', { query: { uuid: artifactId } })
            .then(res => res.version)
            .finally(() => pendingScoresVersions.delete(artifactId))
        pendingScoresVersions.set(artifactId, pending)
    }
    return pending
}
