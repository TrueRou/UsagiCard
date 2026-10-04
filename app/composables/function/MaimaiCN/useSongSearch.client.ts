import type { Document, DocumentData } from 'flexsearch'
import type { Song } from './useMaimaiTypes'
import FlexSearch from 'flexsearch'
import { pinyin } from 'pinyin-pro'
import { toHiragana } from 'wanakana'
import { readMaimaiCache, removeLegacyMaimaiCaches, writeMaimaiCache } from './useMaimaiCache.client'

function getNoteDesigners(song: Song) {
    const diffs = [...song.difficulties.dx, ...song.difficulties.standard]
    return diffs.map((d) => {
        if (d.note_designer && d.note_designer !== '-') {
            return d.note_designer.toLowerCase()
        }
        else {
            return ''
        }
    }).join(' ')
}

function toLXNSStyleId(id: number) {
    if (id > 10000) {
        return id % 10000
    }
    return id
}

const CACHE_KEYS = {
    MAIMAI_SONGS: 'maimaiSongs',
    MAIMAI_INDEXING_TIME: 'maimaiIndexingTime',
    MAIMAI_INDEXING_VERSION: 'maimaiIndexingVersion',
}

export function useSongSearch() {
    const MAX_SEARCH_NUMBER = 100
    const CURRENT_VERSION = 1
    let songIndex: Document<DocumentData, boolean, boolean> | null = null
    const songMap: Map<number, Song> = new Map()

    const cache = {
        save(key: string, value: any) {
            if (value === null || value === undefined) {
                localStorage.removeItem(key)
                return
            }
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
        },
        load<T>(key: string): T | null {
            const value = localStorage.getItem(key)
            if (!value)
                return null
            try {
                return JSON.parse(value) as T
            }
            catch {
                localStorage.removeItem(key)
                return null
            }
        },
        has(key: string): boolean {
            return localStorage.getItem(key) !== null
        },
        clear() {
            Object.values(CACHE_KEYS).forEach(key => localStorage.removeItem(key))
        },
    }

    const indexSongs = async () => {
        removeLegacyMaimaiCaches()
        const api = useNuxtApp().$leporidae
        const cached = readMaimaiCache<Song[]>('songs')
        let songData = cached?.data
        const remoteVersion = await api<{ version: number }>('/api/maimai/usagicard/songs/version')
        if (!songData || !remoteVersion.version || cached?.version !== remoteVersion.version) {
            const songsUrl: string = '/api/maimai/songs'
            songData = await api(songsUrl as never, { query: { page_size: 1000000 } })
            writeMaimaiCache('songs', remoteVersion.version, songData ?? [])
        }
        if ((!songIndex || !songMap) && songData) {
            songMap.clear()
            songData.forEach((song) => {
                songMap.set(song.id, song)
            })

            const promise = new Promise<Document<DocumentData, boolean, boolean>>((resolve) => {
                // 歌曲索引
                const songIndex = new FlexSearch.Document({
                    document: {
                        id: 'id',
                        index: [
                            { field: 'title', tokenize: 'forward', preset: 'match', priority: 10 },
                            { field: 'titleHiragana', tokenize: 'forward', preset: 'match', priority: 9 },
                            { field: 'titlePinYin', tokenize: 'forward', preset: 'match', priority: 9 },
                            { field: 'aliases', tokenize: 'forward', priority: 8 },
                            { field: 'aliasesPinYin', tokenize: 'forward', priority: 7 },
                            { field: 'artist', tokenize: 'forward', priority: 5 },
                            { field: 'artistHiragana', tokenize: 'forward', priority: 4 },
                            { field: 'artistPinYin', tokenize: 'forward', priority: 4 },
                            { field: 'noteDesigners', tokenize: 'forward', priority: 1 },
                            { field: 'noteDesignersHiragana', tokenize: 'forward', priority: 1 },
                        ],
                    },
                })
                // 添加索引
                songData.forEach((song) => {
                    const indexedDoc = {
                        id: song.id,
                        title: song.title,
                        titleHiragana: toHiragana(song.title).toLowerCase(),
                        titlePinYin: pinyin(song.title, { toneType: 'none', nonZh: 'removed', separator: '', v: true }),
                        artist: song.artist,
                        artistHiragana: toHiragana(song.artist).toLowerCase(),
                        artistPinYin: pinyin(song.artist, { toneType: 'none', nonZh: 'removed', separator: '', v: true }),
                        aliases: song.aliases || [],
                        aliasesHiragana: song.aliases?.map((v: string | undefined) => toHiragana(v).toLowerCase()).join(' ') || [],
                        aliasesPinYin: song.aliases?.flatMap((v: string) => {
                            const py = pinyin(v, { toneType: 'none', nonZh: 'removed', separator: '', v: true })
                            return py.length > 0 ? [py] : []
                        }) || [],
                        noteDesigners: getNoteDesigners(song).toLowerCase(),
                        noteDesignersHiragana: toHiragana(getNoteDesigners(song)).toLowerCase(),
                    }
                    songIndex.add(indexedDoc)
                })
                resolve(songIndex)
            })
            promise.then(index => songIndex = index)
        }
    }

    const searchSong = (keyword: string) => {
        const searchLower = keyword.toLowerCase()
        const searchNumber = !Number.isNaN(Number(keyword)) ? toLXNSStyleId(Number(keyword)) : null
        let songsToShow: Song[] = []
        if (searchNumber !== null && songMap != null) {
            const songById = songMap.get(searchNumber)
            if (songById) {
                const existingIndex = songsToShow.findIndex(s => s.id === searchNumber)
                if (existingIndex !== -1) {
                    songsToShow.splice(existingIndex, 1)
                }
                songsToShow.unshift(songById)
                return songsToShow
            }
        }
        if (songIndex != null && songMap != null) {
            const searchResults = (songIndex as Document).search(searchLower, { limit: MAX_SEARCH_NUMBER })
            const orderedIds: number[] = []
            const addedIds = new Set<number>()

            searchResults.forEach((fieldResult) => {
                fieldResult.result.forEach((id) => {
                    if (!addedIds.has(id as number)) {
                        orderedIds.push(id as number)
                        addedIds.add(id as number)
                    }
                })
            })
            songsToShow = orderedIds.map(id => songMap.get(id)).filter(Boolean) as Song[]
        }
        return songsToShow
    }

    /**
     * 返回匹配关键词的全部歌曲 ID（不受 MAX_SEARCH_NUMBER 限制），供成绩筛选使用。
     * 关键词为空时返回 null，表示不限制。
     */
    const matchSongIds = (keyword: string): Set<number> | null => {
        const trimmed = keyword.trim()
        if (!trimmed)
            return null
        const ids = new Set<number>()
        if (/^\d+$/.test(trimmed)) {
            const id = toLXNSStyleId(Number(trimmed))
            if (songMap.has(id))
                ids.add(id)
        }
        if (songIndex != null) {
            const searchResults = (songIndex as Document).search(trimmed.toLowerCase(), { limit: songMap.size || 100000 })
            searchResults.forEach((fieldResult) => {
                fieldResult.result.forEach(id => ids.add(id as number))
            })
        }
        return ids
    }

    const getSongMap = () => songMap

    return {
        indexSongs,
        searchSong,
        matchSongIds,
        getSongMap,
        MAX_SEARCH_NUMBER,
    }
}

let sharedSongSearch: ReturnType<typeof useSongSearch> | null = null

/** 页面间共享同一份歌曲索引，避免重复构建 */
export function useSharedSongSearch() {
    if (!sharedSongSearch)
        sharedSongSearch = useSongSearch()
    return sharedSongSearch
}
