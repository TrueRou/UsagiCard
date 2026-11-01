import type { Ref } from 'vue'
import type { StorageSaveFn } from '../app/composables/useArtifact'
import type { ArtifactStorage, ArtifactUserResponse, MaimaiStorage } from '../app/types/api'
import type { StoragePatch } from '../app/utils/storagePatch'
import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test -- Run with Bun without adding a test framework.
import { afterEach, describe, it } from 'node:test'
import { computed, effectScope, onScopeDispose, readonly, ref, watch } from 'vue'
import { useScoreDisplayPref } from '../app/composables/function/MaimaiCN/useScoreDisplayPref'
import { defaultScores } from '../app/composables/function/MaimaiCN/useScorePreferences'
import { diffStorage } from '../app/utils/storagePatch'

type CardData = ArtifactUserResponse & { storage: ArtifactStorage }

const originalGlobals = new Map(['computed', 'ref', 'readonly', 'watch', 'onScopeDispose', 'onMounted', 'useNuxtApp', 'useLocalStorage', 'window']
    .map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
const cleanups: (() => void)[] = []

afterEach(async () => {
    for (const stop of cleanups.splice(0))
        stop()
    await settle()
    for (const [key, descriptor] of originalGlobals) {
        if (descriptor)
            Object.defineProperty(globalThis, key, descriptor)
        else
            Reflect.deleteProperty(globalThis, key)
    }
})

async function settle() {
    for (let i = 0; i < 20; i++)
        await Promise.resolve()
}

/** 只替换 Nuxt 自动导入和浏览器存储，使用真实 Vue 响应式与 effectScope。 */
function setup(options: {
    id?: string
    memory?: Map<string, string>
    scores?: MaimaiStorage['scores']
    includeScores?: boolean
    beforeSave?: () => Promise<void>
    app?: object
    data?: Ref<CardData>
} = {}) {
    const id = options.id ?? 'card-a'
    const memory = options.memory ?? new Map<string, string>()
    const callbacks: (() => void)[] = []
    const app = options.app ?? {}
    const localStorage = {
        getItem: (key: string) => memory.get(key) ?? null,
        setItem: (key: string, value: string) => memory.set(key, value),
    }
    Object.assign(globalThis, {
        computed,
        ref,
        readonly,
        watch,
        onScopeDispose,
        onMounted: (callback: () => void) => callbacks.push(callback),
        useNuxtApp: () => app,
        useLocalStorage: (key: string, fallback: unknown) => {
            const value = ref(fallback)
            callbacks.push(() => {
                const cached = memory.get(key)
                if (cached)
                    value.value = JSON.parse(cached)
            })
            watch(value, next => memory.set(key, JSON.stringify(next)), { deep: true, flush: 'sync' })
            return value
        },
        window: { localStorage },
    })
    const data = options.data ?? ref({
        storage: {
            MaimaiCN: {
                bio: { player_name: 'untouched', player_rating: null, friend_code: null },
                update: { enabled_mode: 'off', last_updated_at: null, strategy: { sources: [], targets: [] } },
                view: { mode: 'list', tile_content: 'rating' },
                scores: options.scores ?? null,
            },
        },
    } as unknown as CardData)
    const calls: MaimaiStorage[] = []
    const save = (async (_namespace, payload) => {
        const snapshot = JSON.parse(JSON.stringify(diffStorage(data.value.storage.MaimaiCN, payload as StoragePatch<MaimaiStorage>))) as MaimaiStorage
        calls.push(snapshot)
        await options.beforeSave?.()
        // 模拟后端对象深合并（仅用于这个 composable 的 stub）。
        const merge = (current: unknown, patch: unknown): unknown => {
            if (!patch || typeof patch !== 'object' || Array.isArray(patch))
                return patch
            const previous = current && typeof current === 'object' ? current as Record<string, unknown> : {}
            const result = { ...previous }
            for (const [key, value] of Object.entries(patch))
                result[key] = merge(previous[key], value)
            return result
        }
        data.value.storage.MaimaiCN = merge(data.value.storage.MaimaiCN, snapshot) as MaimaiStorage
    }) as StorageSaveFn
    const scope = effectScope()
    cleanups.push(() => scope.stop())
    const state = scope.run(() => useScoreDisplayPref(id, computed(() => data.value), save, options.includeScores ?? true))!
    for (const callback of callbacks)
        callback()
    return { state, calls, memory, data, app, stop: () => scope.stop() }
}

describe('score preference synchronization', () => {
    it('saves view, filters and sorting together while preserving other card settings', async () => {
        const { state, calls, memory, data, stop } = setup()
        state.filter.value = { ...state.filter.value, difficulties: [3], showUnplayed: true }
        state.sort.value = { ...state.sort.value, limit: 50, primaryDir: 'asc' }
        state.mode.value = 'tile'
        assert.equal(state.syncState.value, 'syncing')
        await state.saveToCard()
        assert.equal(calls.length, 1)
        assert.equal(calls[0]!.view!.mode, 'tile')
        assert.deepEqual(calls[0]!.scores!.filter.difficulties, [3])
        assert.equal(calls[0]!.scores!.filter.show_unplayed, true)
        assert.equal(calls[0]!.scores!.sort.limit, 50)
        assert.equal(calls[0]!.scores!.sort.primary_dir, 'asc')
        assert.equal(calls[0]!.bio, undefined)
        assert.equal(data.value.storage.MaimaiCN!.bio.player_name, 'untouched')
        assert.equal('keyword' in calls[0]!.scores!, false)
        assert.equal(JSON.parse(memory.get('maicn:card-a:scores')!).dirty, false)
        assert.equal(state.syncState.value, 'synced')
        stop()
    })

    it('restores per-card pending changes without leaking them to another card', async () => {
        const cached = defaultScores()
        cached.sort.limit = 35
        const memory = new Map([['maicn:card-a:scores', JSON.stringify({ ...cached, dirty: true })]])
        const first = setup({ memory })
        assert.equal(first.state.sort.value.limit, 35)
        await first.state.saveToCard()
        first.stop()
        const second = setup({ id: 'card-b', memory })
        assert.equal(second.state.sort.value.limit, null)
        assert.equal(second.calls.length, 0)
        second.stop()
        const card = defaultScores()
        card.sort.limit = 50
        const restored = setup({ memory, scores: card })
        assert.equal(restored.state.sort.value.limit, 50)
        restored.stop()
    })

    it('sends only the changed sort leaf when other preferences are unchanged', async () => {
        const { state, calls, stop } = setup({ scores: defaultScores() })
        state.sort.value = { ...state.sort.value, limit: 50 }
        await state.saveToCard()
        assert.deepEqual(calls, [{ scores: { sort: { limit: 50 } } }])
        stop()
    })

    it('retains failed changes and allows a manual retry', async () => {
        let offline = true
        const { state, calls, memory, stop } = setup({
            beforeSave: async () => {
                if (offline)
                    throw new Error('offline')
            },
        })
        state.sort.value = { ...state.sort.value, limit: 15 }
        await state.saveToCard()
        assert.equal(state.syncState.value, 'error')
        assert.equal(state.sort.value.limit, 15)
        assert.equal(JSON.parse(memory.get('maicn:card-a:scores')!).dirty, true)
        offline = false
        await state.saveToCard()
        assert.equal(calls.length, 2)
        assert.equal(state.syncState.value, 'synced')
        assert.equal(JSON.parse(memory.get('maicn:card-a:scores')!).dirty, false)
        stop()
    })

    it('keeps modifications made during a request, including reverting to the previous card view', async () => {
        let release!: () => void
        const barrier = new Promise<void>(resolve => release = resolve)
        let first = true
        const { state, calls, data, stop } = setup({
            beforeSave: async () => {
                if (first) {
                    first = false
                    await barrier
                }
            },
        })
        state.sort.value = { ...state.sort.value, limit: 50 }
        state.mode.value = 'tile'
        const saving = state.saveToCard()
        await settle()
        state.sort.value = { ...state.sort.value, limit: 100 }
        state.mode.value = 'list'
        const savingLatest = state.saveToCard()
        assert.equal(calls.length, 1)
        release()
        await Promise.all([saving, savingLatest])
        assert.equal(calls.length, 2)
        assert.equal(data.value.storage.MaimaiCN!.view!.mode, 'list')
        assert.equal(data.value.storage.MaimaiCN!.scores!.sort.limit, 100)
        assert.equal(state.syncState.value, 'synced')
        stop()
    })

    it('flushes pending changes when leaving the page', async () => {
        const { state, calls, stop } = setup()
        state.filter.value = { ...state.filter.value, genres: ['舞萌'] }
        stop()
        await settle()
        assert.equal(calls.length, 1)
        assert.deepEqual(calls[0]!.scores!.filter.genres, ['舞萌'])
    })

    it('serializes writes across page instances even when the newer choice matches the old card value', async () => {
        let release!: () => void
        const barrier = new Promise<void>(resolve => release = resolve)
        const first = setup({ beforeSave: () => barrier })
        first.state.mode.value = 'tile'
        const savingFirst = first.state.saveToCard()
        await settle()
        first.stop()
        const second = setup({ memory: first.memory, app: first.app, data: first.data, includeScores: false })
        second.state.mode.value = 'list'
        const savingSecond = second.state.saveToCard()
        assert.equal(second.calls.length, 0)
        release()
        await Promise.all([savingFirst, savingSecond])
        assert.equal(second.calls.length, 1)
        assert.equal(second.data.value.storage.MaimaiCN!.view!.mode, 'list')
        second.stop()
    })

    it('resumes pending changes after re-entering the page', async () => {
        const first = setup({ beforeSave: async () => {
            throw new Error('offline')
        } })
        first.state.sort.value = { ...first.state.sort.value, limit: 15 }
        await first.state.saveToCard()
        first.stop()
        await settle()
        const second = setup({ memory: first.memory })
        assert.equal(second.state.sort.value.limit, 15)
        assert.equal(second.state.syncState.value, 'syncing')
        await second.state.saveToCard()
        assert.equal(second.calls[0]!.scores!.sort.limit, 15)
        assert.equal(second.state.syncState.value, 'synced')
        second.stop()
    })

    it('migrates old global preferences only once and never overwrites card settings', async () => {
        const memory = new Map([
            ['maicn:score-view:filter', JSON.stringify({ difficulties: [4] })],
            ['maicn:score-view:sort', JSON.stringify({ primary: 'title', limit: 35 })],
        ])
        const configured = setup({ scores: defaultScores(), memory })
        assert.equal(configured.state.sort.value.limit, null)
        configured.stop()
        const first = setup({ memory })
        assert.deepEqual(first.state.filter.value.difficulties, [4])
        assert.equal(first.state.sort.value.limit, 35)
        await first.state.saveToCard()
        first.stop()
        const other = setup({ id: 'card-b', memory })
        assert.deepEqual(other.state.filter.value.difficulties, [])
        assert.equal(other.state.sort.value.limit, null)
        other.stop()
    })

    it('keeps the bests page view-only and preserves existing score preferences', async () => {
        const scores = defaultScores()
        scores.sort.limit = 35
        const { state, calls, data, stop } = setup({ scores, includeScores: false })
        state.tileContent.value = 'fc'
        await state.saveToCard()
        assert.equal(calls[0]!.scores, undefined)
        assert.deepEqual(data.value.storage.MaimaiCN!.scores, scores)
        stop()
    })

    it('automatically debounces successive configuration changes', async () => {
        const { state, calls, stop } = setup()
        state.sort.value = { ...state.sort.value, limit: 35 }
        state.sort.value = { ...state.sort.value, limit: 50 }
        state.filter.value = { ...state.filter.value, showUnplayed: true }
        assert.equal(calls.length, 0)
        await new Promise(resolve => setTimeout(resolve, 850))
        assert.equal(calls.length, 1)
        assert.equal(calls[0]!.scores!.sort.limit, 50)
        assert.equal(state.syncState.value, 'synced')
        stop()
    })
})
