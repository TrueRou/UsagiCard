import type { ScoreExtend, Song, SongDifficulty } from '../app/composables/function/MaimaiCN/useMaimaiTypes'
import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test -- Run with Bun without adding a test framework.
import { describe, it } from 'node:test'
import { FCType, FSType, SongType } from '../app/composables/function/MaimaiCN/useMaimaiUtils'
import {
    buildPlateQuery,
    computeOverview,
    computePlate,
    countAt,
    groupTableRows,
    isChartQualified,
    normalizeCompletionMode,
    parsePlateId,
    parsePlateQuery,
    PLATE_DEFS,
} from '../app/composables/function/MaimaiCN/usePlateProgress'
import { buildChartEntries } from '../app/composables/function/MaimaiCN/useScoreView'

function diff(type: SongType, levelIndex: number, levelValue: number, version: number, level?: string): SongDifficulty {
    return {
        type,
        level: level ?? `${Math.floor(levelValue)}${Math.round(levelValue * 10) % 10 >= 6 ? '+' : ''}`,
        level_value: levelValue,
        level_index: levelIndex,
        note_designer: '-',
        version,
        tap_num: 100,
        hold_num: 0,
        slide_num: 0,
        touch_num: 0,
        break_num: 10,
        curve: null,
    }
}

function song(id: number, difficulties: Partial<Song['difficulties']>, extra: Partial<Song> = {}): Song {
    return {
        id,
        title: `S${id}`,
        artist: '-',
        genre: '-',
        bpm: 150,
        map: null,
        version: 0,
        rights: null,
        aliases: null,
        disabled: false,
        difficulties: { standard: [], dx: [], utage: [], ...difficulties },
        ...extra,
    }
}

function sd(version: number, values: number[]) {
    return values.map((value, index) => diff(SongType.STANDARD, index, value, version))
}

function dx(version: number, values: number[]) {
    return values.map((value, index) => diff(SongType.DX, index, value, version))
}

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
        dx_score: 0,
        dx_rating: 0,
        play_count: 1,
        rate: 0,
        type,
        dx_star: null,
        version: 0,
        level_dx_score: 0,
        play_time: null,
        ...extra,
    }
}

function plate(id: string) {
    const def = parsePlateId(id)
    assert.ok(def, `plate ${id}`)
    return def
}

const songs: Song[] = [
    // 初代曲（真系）
    song(1, { standard: sd(10000, [3, 5, 8, 11.5]) }),
    // 桃：带 Re:MASTER，同时有 DX 谱
    song(2, {
        standard: [...sd(16000, [4, 6, 9, 12.7]), diff(SongType.STANDARD, 4, 13.8, 16000)],
        dx: dx(16000, [4, 6, 9, 12.9]),
    }),
    song(3, { standard: sd(16000, [5, 7, 10, 13.2]) }),
    song(4, { standard: sd(16000, [5, 7, 10, 12.6]) }),
    // 已删除的桃曲
    song(5, { standard: sd(16000, [5, 7, 10, 13]) }, { disabled: true }),
    // 旧曲在 DX 时代追加的 Re:MASTER
    song(6, { standard: [...sd(17000, [5, 7, 10, 12]), diff(SongType.STANDARD, 4, 13, 21000)] }),
    // 熊：DX 谱 + 同版本标准谱 + 宴谱
    song(10, {
        dx: dx(20000, [5, 7, 10, 13]),
        standard: sd(20000, [5, 7, 10, 13]),
        utage: [{ ...diff(SongType.UTAGE, 0, 0, 20000, '13+'), kanji: '狂', description: '', diff_id: 100010, is_buddy: false } as SongDifficulty],
    }),
    song(11, { dx: dx(25500, [5, 7, 10, 13.5]) }),
    song(12, { dx: dx(26000, [5, 7, 10, 14]) }),
]

const scores: ScoreExtend[] = [
    ...[0, 1, 2, 3].map(level => score(3, SongType.STANDARD, level, 100.2, { fc: FCType.FC })),
    ...[0, 1, 2].map(level => score(4, SongType.STANDARD, level, 100)),
    score(4, SongType.STANDARD, 3, 99.9999),
    score(5, SongType.STANDARD, 3, 101),
    score(2, SongType.STANDARD, 4, 100.5),
]

const entries = buildChartEntries(songs, scores)

describe('parsePlateId', () => {
    it('parses canonical names, aliases and traditional characters', () => {
        assert.equal(plate('桃将').id, '桃将')
        assert.equal(plate('华将').id, '熊将')
        assert.equal(plate('华将').label, '熊/华将')
        assert.equal(plate('星神').id, '宙神')
        assert.equal(plate('舞舞舞').kind, '舞舞')
        assert.equal(plate('舞舞舞').version.key, '舞')
        assert.equal(plate('暁極').id, '晓极')
        assert.equal(plate('覇者').id, '霸者')
    })

    it('rejects plates that do not exist', () => {
        for (const name of ['真将', '桃者', '霸将', '初将', '丸将', '', 'abc'])
            assert.equal(parsePlateId(name), null, name)
    })

    it('lists every plate exactly once', () => {
        assert.equal(PLATE_DEFS.length, 80)
        assert.equal(new Set(PLATE_DEFS.map(def => def.id)).size, 80)
    })
})

describe('isChartQualified', () => {
    const s = (extra: Partial<ScoreExtend>) => score(1, SongType.DX, 3, 0, extra)
    it('uses the threshold of each kind', () => {
        assert.equal(isChartQualified('将', s({ achievements: 99.9999 })), false)
        assert.equal(isChartQualified('将', s({ achievements: 100 })), true)
        assert.equal(isChartQualified('者', s({ achievements: 79.9999 })), false)
        assert.equal(isChartQualified('者', s({ achievements: 80 })), true)
        assert.equal(isChartQualified('极', s({ fc: FCType.FC })), true)
        assert.equal(isChartQualified('极', s({ fc: null })), false)
        assert.equal(isChartQualified('神', s({ fc: FCType.FCP })), false)
        assert.equal(isChartQualified('神', s({ fc: FCType.AP })), true)
        assert.equal(isChartQualified('舞舞', s({ fs: FSType.FSP })), false)
        assert.equal(isChartQualified('舞舞', s({ fs: FSType.FSD })), true)
    })

    it('treats zero-valued enums correctly and never qualifies unplayed charts', () => {
        assert.equal(isChartQualified('极', s({ fc: FCType.APP })), true)
        assert.equal(isChartQualified('神', s({ fc: FCType.APP })), true)
        assert.equal(isChartQualified('舞舞', s({ fs: FSType.SYNC })), false)
        assert.equal(isChartQualified('将', null), false)
    })
})

describe('computePlate', () => {
    it('merges 初 into 真 and uses standard charts only for old versions', () => {
        const progress = computePlate(entries, plate('真极'))
        assert.deepEqual(progress.songs.map(item => item.song.id), [1])
        assert.equal(progress.chartCount.total, 4)
    })

    it('excludes Re:MASTER, other chart types and deleted songs on version plates', () => {
        const progress = computePlate(entries, plate('桃将'))
        assert.deepEqual(progress.songs.map(item => item.song.id).sort(), [2, 3, 4])
        assert.ok(progress.songs.every(item => item.charts.every(chart => chart.entry.type === SongType.STANDARD && chart.entry.levelIndex <= 3)))
        assert.deepEqual(progress.songCount, { done: 1, total: 3 })
        assert.deepEqual(progress.levels.map(level => level.levelIndex), [3, 2, 1, 0])
        assert.deepEqual(progress.levels[0], { levelIndex: 3, done: 1, total: 3 })
    })

    it('requires Re:MASTER on 舞 plates only when the chart is from an old version', () => {
        const progress = computePlate(entries, plate('舞将'))
        const peach = progress.songs.find(item => item.song.id === 2)!
        assert.equal(peach.top.entry.levelIndex, 4)
        assert.equal(peach.top.qualified, true)
        assert.equal(peach.complete, false)
        const late = progress.songs.find(item => item.song.id === 6)!
        assert.equal(late.top.entry.levelIndex, 3)
        assert.deepEqual(progress.levels.map(level => level.levelIndex), [4, 3, 2, 1, 0])
        assert.equal(progress.songs.some(item => item.song.id >= 10), false)
    })

    it('uses DX charts for DX plates, ignores utage and respects the version end', () => {
        const bear = computePlate(entries, plate('华极'))
        assert.deepEqual(bear.songs.map(item => item.song.id), [10])
        assert.ok(bear.songs[0]!.charts.every(chart => chart.entry.type === SongType.DX))
        assert.deepEqual(computePlate(entries, plate('熊极')).chartCount, bear.chartCount)
        assert.deepEqual(computePlate(entries, plate('彩神')).songs.map(item => item.song.id), [11])
    })

    it('marks a song complete only when every required chart qualifies', () => {
        const progress = computePlate(entries, plate('桃极'))
        const done = progress.songs.find(item => item.song.id === 3)!
        assert.equal(done.complete, true)
        const partial = computePlate(entries, plate('桃将')).songs.find(item => item.song.id === 4)!
        assert.equal(partial.complete, false)
    })
})

describe('groupTableRows', () => {
    it('groups by the top chart level by default, descending, with constants descending inside', () => {
        const groups = groupTableRows(computePlate(entries, plate('桃将')))
        assert.deepEqual(groups.map(group => group.label), ['13', '12+'])
        assert.deepEqual(groups[1]!.items.map(item => item.song.song.id), [2, 4])
        assert.ok(groups.every(group => group.items.every(item => item.chart.entry.levelIndex === 3)))
        assert.deepEqual(groups[0]!.count, { done: 1, total: 1 })
    })

    it('hides songs by the current difficulty only', () => {
        const progress = computePlate(entries, plate('桃将'))
        // 曲 4 的 MASTER 未达成，BASIC 已达成
        assert.deepEqual(groupTableRows(progress, { hideCompleted: true }).flatMap(group => group.items.map(item => item.song.song.id)).sort(), [2, 4])
        assert.deepEqual(groupTableRows(progress, { diff: 0, hideCompleted: true }).flatMap(group => group.items.map(item => item.song.song.id)), [2])
    })

    it('shows the selected difficulty and skips songs without it', () => {
        const progress = computePlate(entries, plate('舞将'))
        const remaster = groupTableRows(progress, { diff: 4 })
        assert.deepEqual(remaster.flatMap(group => group.items.map(item => item.song.song.id)), [2])
        const basic = groupTableRows(progress, { diff: 0 })
        assert.ok(basic.every(group => group.items.every(item => item.chart.entry.levelIndex === 0)))
        assert.deepEqual(countAt(progress, 4), { done: 1, total: 1 })
    })

    it('counts the top chart for the default difficulty', () => {
        const progress = computePlate(entries, plate('舞将'))
        // 曲 2 的 Re:MASTER 已达成（MASTER 未达成），曲 3 的 MASTER 已达成
        assert.deepEqual(countAt(progress, null, 'top'), { done: 2, total: progress.songs.length })
        assert.deepEqual(progress.topCount, countAt(progress, null, 'top'))
        assert.deepEqual(countAt(progress, null), progress.songCount)
    })

    it('requires all difficulties in the detail table even when the top chart qualifies', () => {
        const progress = computePlate(entries, plate('舞将'))
        const ids = groupTableRows(progress, { hideCompleted: true })
            .flatMap(group => group.items.map(item => item.song.song.id))
        // 曲 2 只有 Re:MASTER 达成，默认详情仍未完成；筛选 Re:MASTER 时已达成。
        assert.ok(ids.includes(2))
        assert.ok(!ids.includes(3))
        const partial = groupTableRows(progress).flatMap(group => group.items).find(item => item.song.song.id === 2)!
        assert.equal(partial.done, false)
        assert.deepEqual(groupTableRows(progress, { diff: 4, hideCompleted: true }), [])
    })

    it('never displays deleted songs, even when they have a qualifying score', () => {
        const progress = computePlate(entries, plate('桃将'))
        assert.ok(entries.some(entry => entry.song.id === 5 && entry.score))
        for (const difficulty of [null, 0, 1, 2, 3]) {
            const rows = groupTableRows(progress, { diff: difficulty }).flatMap(group => group.items)
            assert.ok(rows.every(item => !item.song.song.disabled && item.song.song.id !== 5))
            assert.equal(countAt(progress, difficulty).total, 3)
        }
    })
})

describe('computeOverview', () => {
    it('matches computePlate for every plate', () => {
        const overview = computeOverview(entries)
        assert.equal(overview.size, PLATE_DEFS.length)
        for (const def of PLATE_DEFS) {
            const progress = computePlate(entries, def)
            const item = overview.get(def.id)!
            assert.deepEqual(item.songCount, progress.songCount, def.id)
            assert.deepEqual(item.topCount, progress.topCount, def.id)
        }
    })
})

describe('normalizeCompletionMode', () => {
    it('defaults to all difficulties', () => {
        assert.equal(normalizeCompletionMode('top'), 'top')
        assert.equal(normalizeCompletionMode('all'), 'all')
        assert.equal(normalizeCompletionMode(undefined), 'all')
        assert.equal(normalizeCompletionMode('x'), 'all')
    })
})

describe('route query', () => {
    it('round-trips and omits defaults', () => {
        const state = parsePlateQuery({ plate: '桃将', view: 'progress' })
        assert.equal(state.plate?.id, '桃将')
        assert.deepEqual(buildPlateQuery(state), { plate: '桃将' })
        const remaster = parsePlateQuery(buildPlateQuery({ plate: plate('舞神'), diff: 4 }))
        assert.equal(remaster.plate?.id, '舞神')
        assert.equal(remaster.diff, 4)
    })

    it('validates diff', () => {
        assert.equal(parsePlateQuery({ diff: '3' }).diff, null)
        assert.equal(parsePlateQuery({ plate: '桃将', diff: '4' }).diff, null)
        assert.equal(parsePlateQuery({ plate: '桃将', diff: 'x' }).diff, null)
        assert.equal(parsePlateQuery({ plate: '桃将', diff: '2' }).diff, 2)
    })

    it('accepts array values and reports invalid plates', () => {
        assert.equal(parsePlateQuery({ plate: ['祭极', '桃将'] }).plate?.id, '祭极')
        const invalid = parsePlateQuery({ plate: '真将' })
        assert.equal(invalid.plate, null)
        assert.equal(invalid.invalid, '真将')
        assert.deepEqual(buildPlateQuery({ plate: null, diff: null }), {})
    })
})
