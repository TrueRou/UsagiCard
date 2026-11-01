import type { Song } from '../app/composables/function/MaimaiCN/useMaimaiTypes'
import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test -- Run with Bun without adding a test framework.
import { describe, it } from 'node:test'
import { useSharedSongSearch, useSongSearch } from '../app/composables/function/MaimaiCN/useSongSearch.client'

const song: Song = {
    id: 1,
    title: 'Test Song',
    artist: 'Test Artist',
    genre: 'test',
    bpm: 120,
    map: null,
    version: 1,
    rights: null,
    aliases: [],
    disabled: false,
    difficulties: { standard: [], dx: [], utage: [] },
}

async function withSongApi(api: (path: string) => Promise<unknown>, run: (storage: Map<string, string>) => Promise<void>) {
    const previousApp = Object.getOwnPropertyDescriptor(globalThis, 'useNuxtApp')
    const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
    const storage = new Map<string, string>()
    Object.defineProperty(globalThis, 'useNuxtApp', {
        configurable: true,
        value: () => ({ $leporidae: api }),
    })
    Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        value: {
            getItem: (key: string) => storage.get(key) ?? null,
            setItem: (key: string, value: string) => storage.set(key, value),
            removeItem: (key: string) => storage.delete(key),
        },
    })
    try {
        await run(storage)
    }
    finally {
        for (const [key, descriptor] of [['useNuxtApp', previousApp], ['localStorage', previousStorage]] as const) {
            if (descriptor)
                Object.defineProperty(globalThis, key, descriptor)
            else
                Reflect.deleteProperty(globalThis, key)
        }
    }
}

describe('song index initialization', () => {
    it('shares initialization across pages and concurrent callers, then skips version checks', async () => {
        const requests: string[] = []
        await withSongApi(async (path) => {
            requests.push(path)
            return path.endsWith('/version') ? { version: 1 } : [song]
        }, async () => {
            const firstPage = useSharedSongSearch()
            const secondPage = useSharedSongSearch()
            assert.equal(firstPage, secondPage)
            const pending = firstPage.indexSongs()
            assert.equal(secondPage.indexSongs(), pending)
            await pending
            assert.equal(firstPage.getSongMap().get(1), song)
            assert.deepEqual(firstPage.searchSong('1'), [song])
            await secondPage.indexSongs()
            await firstPage.indexSongs()
            assert.deepEqual(requests, ['/api/maimai/usagicard/songs/version', '/api/maimai/songs'])
        })
    })

    it('checks a persistent cache once without downloading matching songs', async () => {
        const requests: string[] = []
        await withSongApi(async (path) => {
            requests.push(path)
            return { version: 1 }
        }, async (storage) => {
            storage.set('maicn:cache:v2:songs:global', JSON.stringify({ version: 1, data: [song] }))
            const search = useSongSearch()
            await search.indexSongs()
            await search.indexSongs()
            assert.deepEqual(search.getSongMap().get(1), song)
            assert.deepEqual(requests, ['/api/maimai/usagicard/songs/version'])
        })
    })

    it('allows retry after initialization fails', async () => {
        let versionRequests = 0
        await withSongApi(async (path) => {
            if (path.endsWith('/version')) {
                if (++versionRequests === 1)
                    throw new Error('offline')
                return { version: 1 }
            }
            return [song]
        }, async () => {
            const search = useSongSearch()
            await assert.rejects(search.indexSongs(), /offline/)
            await search.indexSongs()
            await search.indexSongs()
            assert.equal(versionRequests, 2)
            assert.equal(search.getSongMap().size, 1)
        })
    })
})
