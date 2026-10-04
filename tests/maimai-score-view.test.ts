import type { ScoreExtend, Song, SongDifficulty } from '../app/composables/function/MaimaiCN/useMaimaiTypes'
import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test -- Run with Bun without adding a test framework.
import { describe, it } from 'node:test'
import { FCType, SongType } from '../app/composables/function/MaimaiCN/useMaimaiUtils'
import {
    buildChartEntries,
    cloneFilter,
    computeAnalytics,
    computeMetrics,
    DEFAULT_FILTER,
    DEFAULT_SORT,
    filterEntries,
    sortEntries,
} from '../app/composables/function/MaimaiCN/useScoreView'

function diff(type: SongType, levelIndex: number, levelValue: number, extra: Partial<SongDifficulty> = {}): SongDifficulty {
    return {
        type,
        level: String(Math.floor(levelValue)),
        level_value: levelValue,
        level_index: levelIndex,
        note_designer: '-',
        version: 24000,
        tap_num: 100,
        hold_num: 0,
        slide_num: 0,
        touch_num: 0,
        break_num: 10,
        curve: null,
        ...extra,
    }
}

const songs: Song[] = [
    {
        id: 1,
        title: 'Alpha',
        artist: 'A',
        genre: 'maimai',
        bpm: 150,
        map: null,
        version: 24000,
        rights: null,
        aliases: null,
        disabled: false,
        difficulties: {
            standard: [],
            dx: [diff(SongType.DX, 2, 12.5), diff(SongType.DX, 3, 13.7)],
            utage: [],
        },
    },
    {
        id: 2,
        title: 'Beta',
        artist: 'B',
        genre: '宴会場',
        bpm: 180,
        map: null,
        version: 20000,
        rights: null,
        aliases: null,
        disabled: false,
        difficulties: {
            standard: [diff(SongType.STANDARD, 3, 14.2, { version: 20000 })],
            dx: [],
            utage: [{ ...diff(SongType.UTAGE, 0, 0, { level: '13+' }), kanji: '狂', description: '', diff_id: 100002, is_buddy: false } as SongDifficulty],
        },
    },
]

function score(id: number, type: SongType, levelIndex: number, achievements: number, extra: Partial<ScoreExtend> = {}): ScoreExtend {
    return {
        id,
        title: '',
        level: '',
        level_index: levelIndex,
        level_value: 0,
        fc: null,
        fs: null,
        achievements,
        dx_score: 300,
        dx_rating: Math.round(achievements * 3),
        play_count: 1,
        rate: 0,
        type,
        dx_star: null,
        version: 0,
        level_dx_score: 330,
        play_time: null,
        ...extra,
    }
}

const scores: ScoreExtend[] = [
    score(1, SongType.DX, 3, 100.6, { fc: FCType.AP, play_count: 10 }),
    score(10001, SongType.DX, 2, 99.1, { play_count: 3 }),
    // utage 成绩的 id 即 diff_id
    score(100002, SongType.UTAGE, 0, 97.5, { fc: FCType.FC }),
]

const entries = buildChartEntries(songs, scores)

describe('buildChartEntries', () => {
    it('creates one entry per chart and links scores, including utage via diff_id', () => {
        assert.equal(entries.length, 4)
        const utage = entries.find(entry => entry.type === SongType.UTAGE)!
        assert.equal(utage.key, '2_utage_100002')
        assert.equal(utage.levelIndex, -1)
        assert.equal(utage.score?.achievements, 97.5)
        // dx id 偏移 10000 也能关联
        assert.equal(entries.find(entry => entry.key === '1_dx_2')!.score?.achievements, 99.1)
        assert.equal(entries.find(entry => entry.key === '2_standard_3')!.score, null)
        assert.equal(entries[0]!.maxDxScore, 330)
    })
})

describe('filterEntries', () => {
    it('hides unplayed charts by default', () => {
        assert.equal(filterEntries(entries, null, DEFAULT_FILTER).length, 3)
        assert.equal(filterEntries(entries, null, { ...cloneFilter(DEFAULT_FILTER), showUnplayed: true }).length, 4)
    })

    it('ORs within a dimension and ANDs across dimensions', () => {
        const filter = { ...cloneFilter(DEFAULT_FILTER), difficulties: [2, 3] as (2 | 3)[], fc: [FCType.AP] }
        assert.deepEqual(filterEntries(entries, null, filter).map(entry => entry.key), ['1_dx_3'])
    })

    it('supports selecting charts without FC', () => {
        const filter = { ...cloneFilter(DEFAULT_FILTER), fc: ['none' as const] }
        assert.deepEqual(filterEntries(entries, null, filter).map(entry => entry.key), ['1_dx_2'])
    })

    it('filters utage by parsed level and by keyword song ids', () => {
        const filter = { ...cloneFilter(DEFAULT_FILTER), levelRange: [13.6, 13.9] as [number, number] }
        assert.deepEqual(filterEntries(entries, null, filter).map(entry => entry.key).sort(), ['1_dx_3', '2_utage_100002'])
        assert.deepEqual(filterEntries(entries, new Set([2]), DEFAULT_FILTER).map(entry => entry.key), ['2_utage_100002'])
    })

    it('filters by chart version group', () => {
        const filter = { ...cloneFilter(DEFAULT_FILTER), versions: [20000], showUnplayed: true }
        assert.deepEqual(filterEntries(entries, null, filter).map(entry => entry.key), ['2_standard_3'])
    })
})

describe('sortEntries', () => {
    const all = filterEntries(entries, null, { ...cloneFilter(DEFAULT_FILTER), showUnplayed: true })

    it('keeps unplayed charts at the bottom', () => {
        const sorted = sortEntries(all, { ...DEFAULT_SORT, primary: 'level', primaryDir: 'desc' })
        assert.equal(sorted.at(-1)!.key, '2_standard_3')
        const mixed = sortEntries(all, { ...DEFAULT_SORT, primary: 'level', primaryDir: 'desc', unplayedToBottom: false })
        assert.equal(mixed[0]!.key, '2_standard_3')
    })

    it('honours direction and limit', () => {
        const asc = sortEntries(all, { ...DEFAULT_SORT, primary: 'achievement', primaryDir: 'asc' })
        assert.equal(asc[0]!.key, '2_utage_100002')
        const top = sortEntries(all, { ...DEFAULT_SORT, primary: 'playCount', limit: 1 })
        assert.deepEqual(top.map(entry => entry.key), ['1_dx_3'])
    })
})

describe('metrics', () => {
    it('averages played charts only and counts AP separately from FC', () => {
        const all = filterEntries(entries, null, { ...cloneFilter(DEFAULT_FILTER), showUnplayed: true })
        const metrics = computeMetrics(all)
        assert.equal(metrics.total, 4)
        assert.equal(metrics.played, 3)
        assert.ok(Math.abs(metrics.avgAchievement - (100.6 + 99.1 + 97.5) / 3) < 1e-9)
        assert.equal(metrics.sssp, 1)
        assert.equal(metrics.sss, 1)
        assert.equal(metrics.ap, 1)
        assert.equal(metrics.fc, 2)
        assert.equal(metrics.playCount, 14)
    })

    it('keeps unplayed charts out of rank buckets', () => {
        const all = filterEntries(entries, null, { ...cloneFilter(DEFAULT_FILTER), showUnplayed: true })
        const analytics = computeAnalytics(all)
        assert.equal(analytics.ranks.find(bucket => bucket.key === 'low')!.count, 0)
        assert.equal(analytics.ranks.find(bucket => bucket.key === 'unplayed')!.count, 1)
        assert.equal(analytics.ranks.find(bucket => bucket.key === 's')!.count, 1)
    })
})
