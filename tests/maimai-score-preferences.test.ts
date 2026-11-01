import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test -- Run with Bun without adding a test framework.
import { describe, it } from 'node:test'
import { SongType } from '../app/composables/function/MaimaiCN/useMaimaiUtils'
import {
    createPreferenceQueue,
    defaultScores,
    isSameScores,
    normalizeScoreFilter,
    normalizeScores,
    normalizeScoreSort,
    resolveScoresPref,
    scoresFromStorage,
    scoresToStorage,
} from '../app/composables/function/MaimaiCN/useScorePreferences'
import { cloneFilter, DEFAULT_FILTER, DEFAULT_SORT } from '../app/composables/function/MaimaiCN/useScoreView'

describe('score preferences storage', () => {
    it('round trips every configurable field without persisting a keyword', () => {
        const filter = {
            ...cloneFilter(DEFAULT_FILTER),
            difficulties: [-1, 3, 4] as const,
            levelRange: [13.6, 14.9] as [number, number],
            versions: [24000],
            genres: ['舞萌'],
            types: [SongType.DX, SongType.UTAGE],
            rates: [0, 1],
            fc: [0, 'none'] as const,
            fs: [4, 'none'] as const,
            dxStars: [0, 5],
            showUnplayed: true,
        }
        const expectedFilter = { ...filter, difficulties: [...filter.difficulties], fc: [...filter.fc], fs: [...filter.fs] }
        const sort = { ...DEFAULT_SORT, primary: 'rating' as const, primaryDir: 'asc' as const, secondary: 'title' as const, secondaryDir: 'asc' as const, unplayedToBottom: false, limit: 50 }
        const stored = scoresToStorage(expectedFilter, sort)
        assert.deepEqual(scoresFromStorage(stored), { filter: expectedFilter, sort })
        assert.equal(stored.filter.show_unplayed, true)
        assert.equal(stored.sort.limit, 50)
        assert.deepEqual(Object.keys(stored), ['filter', 'sort'])
        assert.equal('keyword' in normalizeScores({ ...stored, keyword: 'temporary' }), false)
    })

    it('normalizes missing and malformed data and returns independent defaults', () => {
        assert.deepEqual(normalizeScores(undefined), defaultScores())
        assert.deepEqual(normalizeScores({ filter: null, sort: [] }), defaultScores())
        assert.deepEqual(normalizeScoreFilter({ levelRange: [15, 1], difficulties: [true, 3, 3, 99], fc: [false, 'none', 0], dxStars: [6, -1, 5] }), {
            ...cloneFilter(DEFAULT_FILTER),
            difficulties: [3],
            fc: ['none', 0],
            dxStars: [5],
        })
        assert.deepEqual(normalizeScoreSort({ primary: 'invalid', primaryDir: 'up', limit: -1 }), DEFAULT_SORT)
        for (const limit of [0, -1, 1.5, '50', Number.POSITIVE_INFINITY])
            assert.equal(normalizeScoreSort({ limit }).limit, null)
        const first = defaultScores()
        first.filter.level_range[0] = 14
        assert.deepEqual(defaultScores().filter.level_range, [1, 15])
    })

    it('uses dirty local changes, otherwise prefers the card over cached data', () => {
        const card = scoresToStorage(cloneFilter(DEFAULT_FILTER), { ...DEFAULT_SORT, limit: 50 })
        const local = { ...defaultScores(), dirty: true }
        assert.deepEqual(resolveScoresPref(card, local), defaultScores())
        assert.deepEqual(resolveScoresPref(card, { ...local, dirty: false }), card)
        assert.deepEqual(resolveScoresPref(null, local), defaultScores())
        assert.deepEqual(resolveScoresPref(undefined, null), defaultScores())
        assert.equal(isSameScores(local, defaultScores()), true)
        assert.equal(isSameScores(local, card), false)
    })
})

describe('preference write queue', () => {
    it('serializes requests and reads the latest card state when executing', async () => {
        const enqueue = createPreferenceQueue()
        const card = { view: 'list', limit: null as number | null }
        const events: string[] = []
        let release!: () => void
        const barrier = new Promise<void>(resolve => release = resolve)
        const first = enqueue(async () => {
            events.push('start:first')
            await barrier
            card.view = 'tile'
            events.push('end:first')
        })
        const second = enqueue(async () => {
            events.push('start:second')
            assert.equal(card.view, 'tile')
            card.limit = 50
        })
        await Promise.resolve()
        assert.deepEqual(events, ['start:first'])
        release()
        await Promise.all([first, second])
        assert.deepEqual(events, ['start:first', 'end:first', 'start:second'])
        assert.deepEqual(card, { view: 'tile', limit: 50 })
    })

    it('allows retries after a failed save', async () => {
        const enqueue = createPreferenceQueue()
        await assert.rejects(enqueue(async () => {
            throw new Error('offline')
        }))
        assert.equal(await enqueue(async () => 'saved'), 'saved')
    })
})
