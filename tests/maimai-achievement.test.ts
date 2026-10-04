import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test -- Run with Bun without adding a test framework.
import { describe, it } from 'node:test'
import {
    achievementBounds,
    calcAchievement,
    createPerfectMatrix,
    enumerateBreakSplits,
    remainingSssPlusTolerance,
    sssPlusTolerance,
    totalWeight,
    truncateAchievement,
    verifyAchievement,
    weightMatrix,
} from '../app/composables/function/MaimaiCN/useAchievementMath'

const chart = { tap: 100, hold: 0, slide: 0, touch: 0, break: 10 }

describe('weightMatrix', () => {
    it('sums to 101% in additive mode for an all-critical play', () => {
        const rows = weightMatrix(chart, '0+')
        const total = rows.reduce((sum, row) => sum + row.count * row.perfect[0]!, 0)
        assert.ok(Math.abs(total - 101) < 1e-9)
    })

    it('reports losses relative to 101% in 101- mode', () => {
        const tap = weightMatrix(chart, '101-').find(row => row.kind === 'tap')!
        assert.equal(tap.perfect[0], 0)
        assert.ok(Math.abs(tap.great[0]! - (-20 / totalWeight(chart))) < 1e-9)
        const brk = weightMatrix(chart, '101-').find(row => row.kind === 'break')!
        assert.equal(brk.perfect.length, 3)
        assert.equal(brk.great.length, 3)
        assert.ok(Math.abs(brk.perfect[1]! - (-0.025)) < 1e-9)
    })
})

describe('sssPlusTolerance', () => {
    it('computes TAP GREAT tolerance for all-critical breaks', () => {
        // 101 - k * 20/150 >= 100.5 → k <= 3.75
        assert.equal(sssPlusTolerance(chart, 1), 3)
    })

    it('accounts for partial critical ratio', () => {
        // 100.875 - k * 0.1333 >= 100.5 → k <= 2.8125
        assert.equal(sssPlusTolerance(chart, 0.5), 2)
    })

    it('returns null for charts without breaks', () => {
        assert.equal(sssPlusTolerance({ ...chart, break: 0 }, 1), null)
    })

    it('matches remaining tolerance from an exact achievement', () => {
        assert.equal(remainingSssPlusTolerance(101, chart), 3)
        assert.equal(remainingSssPlusTolerance(100.4999, chart), null)
    })
})

describe('calcAchievement', () => {
    it('returns 101 for a perfect play and 100 without breaks', () => {
        const matrix = createPerfectMatrix(chart)
        assert.equal(truncateAchievement(calcAchievement(matrix, { perfectHigh: 0, great2000: 0, great1500: 0, great1250: 0 })), 101)
        const noBreak = createPerfectMatrix({ ...chart, break: 0 })
        assert.equal(truncateAchievement(calcAchievement(noBreak, { perfectHigh: 0, great2000: 0, great1500: 0, great1250: 0 })), 100)
    })

    it('brackets best and worst break splits', () => {
        const matrix = createPerfectMatrix(chart)
        matrix.break = { critical: 8, perfect: 1, great: 1, good: 0, miss: 0 }
        const { best, worst } = achievementBounds(matrix)
        assert.ok(best > worst)
        const splits = enumerateBreakSplits(matrix, best)
        // PERFECT 2 档 × GREAT 3 档
        assert.equal(splits.length, 6)
        assert.equal(splits[0]!.achievement, truncateAchievement(best))
    })
})

describe('verifyAchievement', () => {
    it('accepts reachable values', () => {
        assert.equal(verifyAchievement(chart, 101), true)
        assert.equal(verifyAchievement(chart, 100.5), true)
        // 单个 BREAK：GREAT 2000 = 80% + 0.4%
        assert.equal(verifyAchievement({ tap: 0, hold: 0, slide: 0, touch: 0, break: 1 }, 80.4), true)
        // 单个 TAP：只有 100 / 80 / 50 / 0
        assert.equal(verifyAchievement({ tap: 1, hold: 0, slide: 0, touch: 0, break: 0 }, 80), true)
    })

    it('rejects impossible values', () => {
        assert.equal(verifyAchievement(chart, 101.0001), false)
        assert.equal(verifyAchievement(chart, -1), false)
        assert.equal(verifyAchievement({ tap: 0, hold: 0, slide: 0, touch: 0, break: 1 }, 80.5), false)
        assert.equal(verifyAchievement({ tap: 1, hold: 0, slide: 0, touch: 0, break: 0 }, 99), false)
        assert.equal(verifyAchievement({ ...chart, break: 0 }, 100.5), false)
    })
})
